#!/usr/bin/env bash
# scripts/extract-frames.sh
# Extracts multi-tier WebP frame sequences for scroll-scrubbed canvas animation.
# Usage: ./scripts/extract-frames.sh

set -e

INPUT_VIDEO="public/showup-demo.mp4"
OUTPUT_BASE="public/frames"

if [ ! -f "$INPUT_VIDEO" ]; then
  echo "Error: $INPUT_VIDEO does not exist."
  exit 1
fi

mkdir -p "$OUTPUT_BASE/low" "$OUTPUT_BASE/medium" "$OUTPUT_BASE/high"

echo "=== Extracting frames for ScrollSequence ==="

# Low tier: 640px width, 6 fps (~60 frames total, ~0.94 MB) for low-end mobile / saveData / 2G-3G
echo "1. Generating low tier (640px @ 6fps, q=70)..."
ffmpeg -y -i "$INPUT_VIDEO" \
  -vf "fps=6,scale=640:-1:flags=lanczos" \
  -vcodec libwebp -quality 70 -compression_level 4 \
  "$OUTPUT_BASE/low/frame_%04d.webp"

# Medium tier: 960px width, 9 fps (~90 frames total, ~2.3 MB) for mid-range phones / tablets / laptops
echo "2. Generating medium tier (960px @ 9fps, q=75)..."
ffmpeg -y -i "$INPUT_VIDEO" \
  -vf "fps=9,scale=960:-1:flags=lanczos" \
  -vcodec libwebp -quality 75 -compression_level 4 \
  "$OUTPUT_BASE/medium/frame_%04d.webp"

# High tier: 1280px width, 13 fps (~130 frames total, ~4.4 MB) for desktop & high-performance devices
echo "3. Generating high tier (1280px @ 13fps, q=75)..."
ffmpeg -y -i "$INPUT_VIDEO" \
  -vf "fps=13,scale=1280:-1:flags=lanczos" \
  -vcodec libwebp -quality 75 -compression_level 4 \
  "$OUTPUT_BASE/high/frame_%04d.webp"

# Generate lightweight initial poster image from first frame
cp "$OUTPUT_BASE/low/frame_0001.webp" "$OUTPUT_BASE/poster.webp"

echo "=== Frame extraction complete! ==="
