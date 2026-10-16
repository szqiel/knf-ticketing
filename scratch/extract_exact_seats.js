const sharp = require('sharp');
const fs = require('fs');

async function extractSeats() {
  const { data, info } = await sharp('Designs/SEAT 2.png').raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;
  const isWhite = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      if (data[idx] > 240 && data[idx+1] > 240 && data[idx+2] > 240 && data[idx+3] > 240) {
        isWhite[y * w + x] = 1;
      }
    }
  }

  const visited = new Uint8Array(w * h);
  const blobs = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (isWhite[y * w + x] === 1 && visited[y * w + x] === 0) {
        let minX = x, maxX = x, minY = y, maxY = y, count = 0;
        let sumX = 0, sumY = 0;
        const queue = [y * w + x];
        visited[y * w + x] = 1;
        while (queue.length > 0) {
          const curr = queue.pop();
          const cx = curr % w;
          const cy = Math.floor(curr / w);
          count++;
          sumX += cx;
          sumY += cy;
          if (cx < minX) minX = cx;
          if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;
          if (cx > 0 && isWhite[curr - 1] === 1 && visited[curr - 1] === 0) { visited[curr - 1] = 1; queue.push(curr - 1); }
          if (cx < w - 1 && isWhite[curr + 1] === 1 && visited[curr + 1] === 0) { visited[curr + 1] = 1; queue.push(curr + 1); }
          if (cy > 0 && isWhite[curr - w] === 1 && visited[curr - w] === 0) { visited[curr - w] = 1; queue.push(curr - w); }
          if (cy < h - 1 && isWhite[curr + w] === 1 && visited[curr + w] === 0) { visited[curr + w] = 1; queue.push(curr + w); }
        }
        const bw = maxX - minX + 1;
        const bh = maxY - minY + 1;
        if (bw >= 25 && bh >= 20) {
          blobs.push({ minX, maxX, minY, maxY, bw, bh, count, cx: sumX / count, cy: sumY / count });
        }
      }
    }
  }

  console.log('Extracted main blobs:', blobs.length);

  // Classify each blob into one of 7 sections:
  // Upper (cy < 650):
  // - topLeft: cx < 650 (72)
  // - topCenter: 650 <= cx <= 1700 (106)
  // - topRight: cx > 1700 (72)
  // Lower (cy >= 650):
  // - bottomLeft: cx < 500 (48)
  // - bottomCenterLeft: 500 <= cx < 1180 (80)
  // - bottomCenterRight: 1180 <= cx <= 1850 (80)
  // - bottomRight: cx > 1850 (48)
  const sections = {
    topLeft: blobs.filter(b => b.cy < 650 && b.cx < 650),
    topCenter: blobs.filter(b => b.cy < 650 && b.cx >= 650 && b.cx <= 1700),
    topRight: blobs.filter(b => b.cy < 650 && b.cx > 1700),
    bottomLeft: blobs.filter(b => b.cy >= 650 && b.cx < 500),
    bottomCenterLeft: blobs.filter(b => b.cy >= 650 && b.cx >= 500 && b.cx < 1180),
    bottomCenterRight: blobs.filter(b => b.cy >= 650 && b.cx >= 1180 && b.cx <= 1850),
    bottomRight: blobs.filter(b => b.cy >= 650 && b.cx > 1850),
  };

  for (const [k, v] of Object.entries(sections)) {
    console.log(`Section ${k}: ${v.length} seats`);
  }
}

extractSeats();
