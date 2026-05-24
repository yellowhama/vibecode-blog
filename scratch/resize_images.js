import sharp from 'sharp';
import { resolve } from 'path';
import { renameSync, unlinkSync } from 'fs';

const images = [
  'public/images/posts/1-person-unicorn-tech-stack-2026.png',
  'public/images/posts/image-design-contract.png',
  'public/images/posts/zero-budget-marketing-agent.png'
];

async function resize() {
  for (const img of images) {
    const filePath = resolve(img);
    const tempPath = filePath + '.tmp.png';
    console.log(`Resizing ${filePath}...`);
    
    await sharp(filePath)
      .resize(1200, 630, {
        fit: 'cover',
        position: 'center'
      })
      .toFile(tempPath);
    
    unlinkSync(filePath);
    renameSync(tempPath, filePath);
    console.log(`Resized ${img} successfully.`);
  }
}

resize().catch(err => console.error(err));
