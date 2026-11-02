import sharp from 'sharp';
import fs from 'fs';

async function generateFavicons() {
  const emblemPath = 'public/logo-emblem.png';
  if (!fs.existsSync(emblemPath)) {
    console.error('Emblem not found at', emblemPath);
    return;
  }

  console.log('Using emblem:', emblemPath);

  // Helper to create circular/square icon with dark background for maximum contrast on Google Search (white background) and browser tabs
  async function createFaviconBadge(size) {
    // We want a dark circle/rounded square so it looks like a premium badge
    // Safe padding so that a circular clip from Google Search doesn't touch the emblem edges
    const padding = Math.round(size * 0.16);
    const emblemSize = Math.max(8, size - (padding * 2));

    const resizedEmblem = await sharp(emblemPath)
      .resize({
        width: emblemSize,
        height: emblemSize,
        fit: 'inside'
      })
      .png()
      .toBuffer();

    // Create a circular dark badge with subtle glowing border
    const radius = Math.floor(size / 2);
    const circleSvg = Buffer.from(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${radius}" cy="${radius}" r="${radius}" fill="#0B0F17" />
        <circle cx="${radius}" cy="${radius}" r="${radius - 1}" fill="none" stroke="#7C3AED" stroke-width="${Math.max(1, Math.round(size * 0.03))}" stroke-opacity="0.6" />
      </svg>
    `);

    const badge = await sharp(circleSvg)
      .composite([
        {
          input: resizedEmblem,
          gravity: 'center'
        }
      ])
      .png()
      .toBuffer();

    return badge;
  }

  // Generate at standard sizes: 16, 32, 48, 96, 180, 192, 512
  const fav16 = await createFaviconBadge(16);
  const fav32 = await createFaviconBadge(32);
  const fav48 = await createFaviconBadge(48);
  const fav96 = await createFaviconBadge(96);
  const fav180 = await createFaviconBadge(180);
  const fav192 = await createFaviconBadge(192);
  const fav512 = await createFaviconBadge(512);

  await sharp(fav16).toFile('public/favicon-16x16.png');
  await sharp(fav32).toFile('public/favicon-32x32.png');
  await sharp(fav48).toFile('public/favicon-48x48.png');
  await sharp(fav180).toFile('public/apple-touch-icon.png');
  await sharp(fav192).toFile('public/android-chrome-192x192.png');
  await sharp(fav512).toFile('public/android-chrome-512x512.png');
  console.log('Saved PNG icons');

  // Helper to generate ICO file containing 16, 32, 48
  function createIco(images) {
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0); // reserved
    header.writeUInt16LE(1, 2); // type 1 = ICO
    header.writeUInt16LE(images.length, 4); // count
    
    let offset = 6 + images.length * 16;
    const entries = [];
    const buffers = [];
    
    for (const img of images) {
      const entry = Buffer.alloc(16);
      entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
      entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
      entry.writeUInt8(0, 2); // color palette
      entry.writeUInt8(0, 3); // reserved
      entry.writeUInt16LE(1, 4); // color planes
      entry.writeUInt16LE(32, 6); // bpp
      entry.writeUInt32LE(img.buffer.length, 8); // size
      entry.writeUInt32LE(offset, 12); // offset
      
      entries.push(entry);
      buffers.push(img.buffer);
      offset += img.buffer.length;
    }
    
    return Buffer.concat([header, ...entries, ...buffers]);
  }

  const icoBuffer = createIco([
    { width: 16, height: 16, buffer: fav16 },
    { width: 32, height: 32, buffer: fav32 },
    { width: 48, height: 48, buffer: fav48 }
  ]);
  fs.writeFileSync('public/favicon.ico', icoBuffer);
  console.log('Saved public/favicon.ico');

  // Generate SVG favicon as well
  const b64 = fav96.toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
  <image width="96" height="96" href="data:image/png;base64,${b64}" />
</svg>`;
  fs.writeFileSync('public/favicon.svg', svgContent, 'utf-8');
  console.log('Saved public/favicon.svg');
}

generateFavicons().catch(err => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});
