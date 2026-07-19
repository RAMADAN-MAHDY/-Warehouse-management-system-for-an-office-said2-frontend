const fs = require('fs');
const path = require('path');

// Source logo inside public/logo/ - choose the first non-hidden file
const logoDir = path.join(__dirname, '..', 'public', 'logo');
const targets = [
  { dest: path.join(__dirname, '..', 'public', 'logo.png') },
  { dest: path.join(__dirname, '..', 'public', 'icons', 'android-chrome-192x192.png'), size: 192 },
  { dest: path.join(__dirname, '..', 'public', 'icons', 'android-chrome-512x512.png'), size: 512 },
  { dest: path.join(__dirname, '..', 'public', 'icons', 'apple-touch-icon.png'), size: 180 },
  { dest: path.join(__dirname, '..', 'public', 'icons', 'favicon-32x32.png'), size: 32 },
  { dest: path.join(__dirname, '..', 'public', 'icons', 'favicon-16x16.png'), size: 16 }
];

function findSourceLogo() {
  if (!fs.existsSync(logoDir)) return null;
  const files = fs.readdirSync(logoDir).filter(f => !f.startsWith('.'));
  if (files.length === 0) return null;
  // prefer a file that contains 'ChatGPT' or 'logo', otherwise take first
  let chosen = files.find(f => /chatgpt|logo|logo.png/i.test(f));
  if (!chosen) chosen = files[0];
  return path.join(logoDir, chosen);
}

const src = findSourceLogo();
if (!src) {
  console.error('No source logo found in public/logo/. Place your new logo file there and try again.');
  process.exit(1);
}

console.log('Using source logo:', src);
// Try to use sharp for resizing when available
let sharpAvailable = false;
let sharp;
try {
  sharp = require('sharp');
  sharpAvailable = true;
} catch (e) {
  sharpAvailable = false;
}

targets.forEach((t) => {
  const destDir = path.dirname(t.dest);
  try {
    fs.mkdirSync(destDir, { recursive: true });
  } catch (err) {
    console.error('Failed to create directory', destDir, err.message || err);
  }

  if (t.size && sharpAvailable) {
    // resize using sharp
    sharp(src)
      .resize(t.size, t.size, { fit: 'cover' })
      .toFile(t.dest)
      .then(() => console.log('Generated', t.dest))
      .catch((err) => console.error('Failed to generate', t.dest, err.message || err));
  } else {
    // fallback copy
    try {
      fs.copyFileSync(src, t.dest);
      console.log('Copied to', t.dest);
    } catch (err) {
      console.error('Failed to copy to', t.dest, err.message || err);
    }
  }
});

console.log('Logo application finished. Restart dev server if running.');
