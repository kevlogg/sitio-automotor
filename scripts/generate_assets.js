import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateAll() {
  const sourcePath = 'C:/Users/loggi/.gemini/antigravity-ide/brain/46120322-910f-4f78-b7bc-95a3d1bce80d/.user_uploaded/media_1793229902025.png';
  
  console.log('Processing source image:', sourcePath);
  
  // 1. Clean faint ghost alpha pixels (< 15) to 0
  const { data, info } = await sharp(sourcePath).raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 15) {
      data[i + 3] = 0;
    }
  }
  
  // 2. Trim full logo
  const trimmedFullBuffer = await sharp(data, { raw: info }).trim().png().toBuffer();
  const trimmedFullMeta = await sharp(trimmedFullBuffer).metadata();
  console.log('Trimmed Full Logo:', trimmedFullMeta.width, 'x', trimmedFullMeta.height);
  
  // Save logo.png and logofrase.png
  await sharp(trimmedFullBuffer).png({ quality: 100, compressionLevel: 9 }).toFile('public/logo.png');
  await sharp(trimmedFullBuffer).png({ quality: 100, compressionLevel: 9 }).toFile('public/logofrase.png');
  console.log('Saved public/logo.png and public/logofrase.png');
  
  // 3. Extract SA emblem alone (rows 0 to 404)
  const emblemBuffer = await sharp(trimmedFullBuffer)
    .extract({ left: 0, top: 0, width: trimmedFullMeta.width, height: 405 })
    .trim()
    .png()
    .toBuffer();
  const emblemMeta = await sharp(emblemBuffer).metadata();
  console.log('Emblem:', emblemMeta.width, 'x', emblemMeta.height);
  await sharp(emblemBuffer).toFile('public/logo-emblem.png');
  console.log('Saved public/logo-emblem.png');
  
  // Helper to create square icon with emblem centered on transparent or dark background
  async function createSquareIcon(size, paddingRatio = 0.08, bg = null) {
    const pad = Math.round(size * paddingRatio);
    const targetDim = size - (pad * 2);
    
    const resizedEmblem = await sharp(emblemBuffer)
      .resize({
        width: targetDim,
        height: targetDim,
        fit: 'inside'
      })
      .png()
      .toBuffer();
      
    const canvas = sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: bg || { r: 0, g: 0, b: 0, alpha: 0 }
      }
    });
    
    return canvas.composite([{ input: resizedEmblem, gravity: 'center' }]).png().toBuffer();
  }
  
  // Helper for full logo square/rectangle icon
  async function createSquareFullLogo(size, paddingRatio = 0.15, bg = '#0B0F17') {
    const pad = Math.round(size * paddingRatio);
    const targetDim = size - (pad * 2);
    
    const resizedLogo = await sharp(trimmedFullBuffer)
      .resize({
        width: targetDim,
        height: targetDim,
        fit: 'inside'
      })
      .png()
      .toBuffer();
      
    const canvas = sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: bg
      }
    });
    
    return canvas.composite([{ input: resizedLogo, gravity: 'center' }]).png().toBuffer();
  }

  // 4. Generate Favicons:
  // For 16, 32, 48: The SA emblem with subtle padding
  const fav16 = await createSquareIcon(16, 0.04);
  const fav32 = await createSquareIcon(32, 0.04);
  const fav48 = await createSquareIcon(48, 0.04);
  
  await sharp(fav16).toFile('public/favicon-16x16.png');
  await sharp(fav32).toFile('public/favicon-32x32.png');
  await sharp(fav48).toFile('public/favicon-48x48.png');
  console.log('Saved favicons 16x16, 32x32, 48x48');
  
  // 5. Generate apple-touch-icon (180x180): Deep dark luxury background with emblem + branding
  const appleTouch = await createSquareIcon(180, 0.12, '#0B0F17');
  await sharp(appleTouch).toFile('public/apple-touch-icon.png');
  console.log('Saved public/apple-touch-icon.png');
  
  // 6. Generate android-chrome-192x192 & 512x512
  const pwa192 = await createSquareFullLogo(192, 0.15, '#0B0F17');
  const pwa512 = await createSquareFullLogo(512, 0.15, '#0B0F17');
  await sharp(pwa192).toFile('public/android-chrome-192x192.png');
  await sharp(pwa512).toFile('public/android-chrome-512x512.png');
  console.log('Saved public/android-chrome-192x192.png and 512x512.png');
  
  // 7. Helper to generate ICO file
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
  
  // 8. Generate favicon.svg (SVG with base64 PNG embedding of emblem)
  const emblemBase64 = emblemBuffer.toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${emblemMeta.width} ${emblemMeta.height}">
  <image width="${emblemMeta.width}" height="${emblemMeta.height}" href="data:image/png;base64,${emblemBase64}" />
</svg>`;
  fs.writeFileSync('public/favicon.svg', svgContent, 'utf-8');
  console.log('Saved public/favicon.svg');
  
  // 9. Generate og-image.png (1200x630 social share card)
  const ogWidth = 1200;
  const ogHeight = 630;
  const resizedForOg = await sharp(trimmedFullBuffer)
    .resize({ width: 680, height: 360, fit: 'inside' })
    .png()
    .toBuffer();
    
  const ogMeta = await sharp(resizedForOg).metadata();
  const leftPos = Math.round((ogWidth - ogMeta.width) / 2);
  const topPos = Math.round((ogHeight - ogMeta.height - 80) / 2);
    
  const glowSvg = Buffer.from(
    `<svg width="${ogWidth}" height="${ogHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgGlow" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stop-color="#7C3AED" stop-opacity="0.30" />
          <stop offset="50%" stop-color="#4C1D95" stop-opacity="0.12" />
          <stop offset="100%" stop-color="#0B0F17" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="#0B0F17" />
      <rect width="100%" height="100%" fill="url(#bgGlow)" />
      <text x="50%" y="515" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="700" fill="#E2E8F0" letter-spacing="4" text-anchor="middle">EL MARKETPLACE AUTOMOTOR PREMIUM DE ARGENTINA</text>
      <text x="50%" y="555" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#94A3B8" letter-spacing="2" text-anchor="middle">AUTOS · CAMIONETAS · MOTOS · NÁUTICA · UTILITARIOS</text>
    </svg>`
  );
  
  const ogCard = await sharp(glowSvg)
    .composite([
      { input: resizedForOg, top: topPos, left: leftPos }
    ])
    .png()
    .toBuffer();
    
  await sharp(ogCard).toFile('public/og-image.png');
  console.log('Saved public/og-image.png (1200x630)');
  console.log('All branding assets generated successfully!');
}

generateAll().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
