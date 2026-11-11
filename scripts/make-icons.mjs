import sharp from 'sharp';
for (const s of [180, 192, 512]) await sharp('public/icon.svg', { density: 300 }).resize(s, s).png().toFile(`public/icon-${s}.png`);
