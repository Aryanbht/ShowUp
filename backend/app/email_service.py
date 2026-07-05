import os
import resend

resend.api_key = os.getenv("RESEND_API_KEY", "")


def send_welcome_email(name: str, email: str):
    """Send welcome email via Resend on new registration."""
    if not resend.api_key:
        return  # Skip silently if not configured

    resend.Emails.send({
        "from": "ShowUp <onboarding@resend.dev>",
        "to": [email],
        "subject": "Welcome to ShowUp 🎉 — Your Work Speaks First",
        "html": f"""
        <div style="font-family: 'IBM Plex Mono', monospace; background: #fdf7ff; padding: 40px; max-width: 600px; margin: 0 auto;">
            <h1 style="font-size: 24px; font-weight: 900; text-transform: uppercase; border-bottom: 3px solid #2A2A2A; padding-bottom: 16px;">
                ShowUp
            </h1>
            <p style="font-size: 18px; margin-top: 24px;">Hey {name} 👋</p>
            <p style="font-size: 16px; line-height: 1.6; color: #494551;">
                Your portfolio is live. Now it's time to <strong>show up</strong>.
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #494551;">
                Upload your first project, get AI-powered feedback, and start building credibility — one project at a time.
            </p>
            <a href="http://localhost:5173/upload"
               style="display: inline-block; background: #2A2A2A; color: #fff; padding: 14px 28px; text-decoration: none;
                      font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 24px;
                      border: 2px solid #2A2A2A; box-shadow: 4px 4px 0 #4f378a;">
                Upload Your First Project →
            </a>
            <p style="margin-top: 40px; font-size: 12px; color: #7a7582;">
                You're registered on ShowUp — the student portfolio platform.
            </p>
        </div>
        """,
    })

def send_otp_email(name: str, email: str, otp: str):
    """Send OTP email via Resend (HTTPS API bypasses Render SMTP block)."""
    if not resend.api_key:
        raise RuntimeError("RESEND_API_KEY not configured")

    resend.Emails.send({
        "from": "ShowUp <onboarding@resend.dev>",
        "to": [email],
        "subject": f"{otp} is your ShowUp verification code",
        "html": f"""
        <div style="font-family:'IBM Plex Mono',monospace;background:#fdf7ff;color:#1d1b20;padding:40px;max-width:480px;margin:0 auto;">
          <h1 style="font-size:22px;font-weight:900;text-transform:uppercase;border-bottom:3px solid #2A2A2A;padding-bottom:12px;">ShowUp</h1>
          <p style="margin-top:24px;">Hey {name},</p>
          <p>Your verification code is:</p>
          <div style="background:#e8def8;padding:24px;text-align:center;font-size:32px;font-weight:900;letter-spacing:8px;border:2px solid #2A2A2A;box-shadow:4px 4px 0 #4f378a;margin:32px 0;">
            {otp}
          </div>
          <p style="font-size:14px;color:#49454f;">Enter this code within 10 minutes to verify your account.</p>
        </div>
        """,
    })
