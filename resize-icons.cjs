const sharp = require('sharp');
const fs = require('fs');

async function resizeIcons() {
  const inputImage = '111.png';

  // Check if input exists
  if (!fs.existsSync(inputImage)) {
    console.error('Error: 111.png not found');
    process.exit(1);
  }

  console.log('Resizing icons from 111.png...');

  try {
    // icon-192.png (192x192)
    await sharp(inputImage)
      .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile('public/icon-192.png');
    console.log('✓ Created public/icon-192.png');

    // icon-512.png (512x512)
    await sharp(inputImage)
      .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile('public/icon-512.png');
    console.log('✓ Created public/icon-512.png');

    // apple-touch-icon.png (180x180)
    await sharp(inputImage)
      .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile('public/apple-touch-icon.png');
    console.log('✓ Created public/apple-touch-icon.png');

    // favicon.ico (32x32 for simplicity, browsers will scale)
    await sharp(inputImage)
      .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile('public/favicon.png');
    console.log('✓ Created public/favicon.png');

    // Also create 16x16 version
    await sharp(inputImage)
      .resize(16, 16, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile('public/favicon-16.png');
    console.log('✓ Created public/favicon-16.png');

    console.log('\n✅ All icons created successfully!');
  } catch (error) {
    console.error('Error resizing images:', error);
    process.exit(1);
  }
}

resizeIcons();
