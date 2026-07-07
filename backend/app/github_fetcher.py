"""
github_fetcher.py
Fetches README and key source files from a public GitHub repo URL.
Uses the GitHub REST API (no auth needed for public repos, 60 req/hr).
"""
import re
import requests

# File extensions worth reading for code quality signals
CODE_EXTENSIONS = {
    ".py", ".js", ".ts", ".jsx", ".tsx", ".java", ".go",
    ".rs", ".cpp", ".c", ".cs", ".rb", ".php", ".swift",
    ".kt", ".scala", ".html", ".css", ".sql",
}

# Files/dirs to skip (not useful for review)
SKIP_PATHS = {
    "node_modules", ".git", "dist", "build", "__pycache__",
    ".next", "venv", "env", ".venv", "coverage", ".pytest_cache",
}

MAX_FILE_CHARS = 3_000   # chars per file we send to Gemini
MAX_FILES      = 6       # max source files to include
MAX_TOTAL_CHARS = 15_000 # total code context cap


def _parse_github_url(url: str):
    """Extract (owner, repo) from a GitHub URL. Returns (None, None) if invalid."""
    url = url.strip().rstrip("/")
    # Match: github.com/owner/repo  (with or without https://)
    m = re.search(r"github\.com[/:]([^/]+)/([^/\s?#]+)", url)
    if not m:
        return None, None
    owner = m.group(1)
    repo  = m.group(2)
    # Strip .git suffix if present
    if repo.endswith(".git"):
        repo = repo[:-4]
    return owner, repo


def _api_get(url: str, timeout: int = 8):
    """Make a GitHub API GET request. Returns response JSON or None on failure."""
    try:
        resp = requests.get(
            url,
            headers={"Accept": "application/vnd.github+json"},
            timeout=timeout,
        )
        if resp.status_code == 200:
            return resp.json()
    except Exception:
        pass
    return None


def _fetch_readme(owner: str, repo: str) -> str:
    """Fetch the repo README. Returns markdown text or empty string."""
    data = _api_get(f"https://api.github.com/repos/{owner}/{repo}/readme")
    if not data:
        return ""
    # README comes back as base64; use the download_url for plain text
    download_url = data.get("download_url")
    if not download_url:
        return ""
    try:
        resp = requests.get(download_url, timeout=8)
        if resp.status_code == 200:
            return resp.text[:MAX_FILE_CHARS]
    except Exception:
        pass
    return ""


def _fetch_tree(owner: str, repo: str, branch: str = "main"):
    """Fetch flat file tree for the repo. Tries main then master."""
    for b in (branch, "master", "main"):
        data = _api_get(
            f"https://api.github.com/repos/{owner}/{repo}/git/trees/{b}?recursive=1"
        )
        if data and "tree" in data:
            return data["tree"]
    return []


def _fetch_file(url: str) -> str:
    """Fetch raw file content. Returns truncated text."""
    try:
        resp = requests.get(url, timeout=6)
        if resp.status_code == 200:
            return resp.text[:MAX_FILE_CHARS]
    except Exception:
        pass
    return ""


def fetch_github_context(github_url: str) -> dict:
    """
    Main entry point. Given a GitHub URL, returns:
    {
        "readme": str,           # README contents (may be empty)
        "files": [               # list of {path, content} dicts
            {"path": "...", "content": "..."},
        ],
        "has_readme": bool,
        "repo_name": str,
        "error": str | None,
    }
    """
    owner, repo = _parse_github_url(github_url)
    if not owner:
        return {"readme": "", "files": [], "has_readme": False,
                "repo_name": "", "error": "Invalid GitHub URL"}

    # 1. README
    readme = _fetch_readme(owner, repo)

    # 2. File tree
    tree = _fetch_tree(owner, repo)
    if not tree:
        return {
            "readme": readme,
            "files": [],
            "has_readme": bool(readme),
            "repo_name": f"{owner}/{repo}",
            "error": None,
        }

    # 3. Pick interesting source files (blobs only, skip large/binary/deps)
    blobs = [
        item for item in tree
        if item.get("type") == "blob"
        and item.get("size", 0) < 60_000          # skip huge files
        and any(item["path"].endswith(ext) for ext in CODE_EXTENSIONS)
        and not any(skip in item["path"] for skip in SKIP_PATHS)
    ]

    # Sort by depth (prefer top-level files) then by size descending
    blobs.sort(key=lambda x: (x["path"].count("/"), -x.get("size", 0)))

    fetched_files = []
    total_chars = 0

    for blob in blobs[:MAX_FILES * 3]:   # try more candidates than we need
        if len(fetched_files) >= MAX_FILES:
            break
        if total_chars >= MAX_TOTAL_CHARS:
            break

        raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/HEAD/{blob['path']}"
        content = _fetch_file(raw_url)
        if content.strip():
            fetched_files.append({"path": blob["path"], "content": content})
            total_chars += len(content)

    return {
        "readme": readme,
        "files": fetched_files,
        "has_readme": bool(readme),
        "repo_name": f"{owner}/{repo}",
        "error": None,
    }
