const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

let ffmpegPath = 'ffmpeg';
try {
  ffmpegPath = require('ffmpeg-static');
} catch (e) {
  // Fall back to system ffmpeg
}

const inputVideo = path.join(__dirname, '..', 'public', 'showup-demo.mp4');
const outBase = path.join(__dirname, '..', 'public', 'frames');

if (!fs.existsSync(inputVideo)) {
  console.error(`Input video not found: ${inputVideo}`);
  process.exit(1);
}

const tiers = [
  { name: 'low', fps: 6, width: 640, quality: 70 },
  { name: 'medium', fps: 9, width: 960, quality: 75 },
  { name: 'high', fps: 13, width: 1280, quality: 75 },
];

for (const tier of tiers) {
  const dir = path.join(outBase, tier.name);
  fs.mkdirSync(dir, { recursive: true });

  // Clean old frames
  fs.readdirSync(dir).forEach(f => {
    if (f.startsWith('frame_') && f.endsWith('.webp')) {
      fs.unlinkSync(path.join(dir, f));
    }
  });

  const outPattern = path.join(dir, 'frame_%04d.webp');
  console.log(`\nGenerating ${tier.name} tier (${tier.width}px, ~${tier.fps * 10} frames, q=${tier.quality})...`);
  
  const cmd = `"${ffmpegPath}" -y -i "${inputVideo}" -vf "fps=${tier.fps},scale=${tier.width}:-1:flags=lanczos" -vcodec libwebp -quality ${tier.quality} -compression_level 4 "${outPattern}"`;
  execSync(cmd, { stdio: 'inherit' });

  const generated = fs.readdirSync(dir).filter(f => f.endsWith('.webp'));
  let totalBytes = 0;
  generated.forEach(f => { totalBytes += fs.statSync(path.join(dir, f)).size; });

  console.log(`✓ ${tier.name} tier done: ${generated.length} frames, total size: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB`);
}

console.log('\nAll frame tiers successfully extracted!');
