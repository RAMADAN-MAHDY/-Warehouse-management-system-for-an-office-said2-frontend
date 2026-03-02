const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const input = path.join(__dirname, '../public/logo.png');
const outputDir = path.join(__dirname, '../public/icons');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
];

async function generateIcons() {
    try {
        for (const { name, size } of sizes) {
            await sharp(input)
                .resize(size, size)
                .toFile(path.join(outputDir, name));
            console.log(`Generated ${name}`);
        }
        
        // Also copy the 32x32 to public/favicon.ico (browsers support png as ico)
        await sharp(input)
            .resize(32, 32)
            .toFile(path.join(__dirname, '../public/favicon.ico'));
        console.log('Generated favicon.ico (as PNG 32x32)');

        // Replace src/app/favicon.ico as well
        await sharp(input)
            .resize(32, 32)
            .toFile(path.join(__dirname, '../src/app/favicon.ico'));
        console.log('Updated src/app/favicon.ico');

    } catch (err) {
        console.error('Error generating icons:', err);
    }
}

generateIcons();
