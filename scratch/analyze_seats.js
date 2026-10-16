const sharp = require('sharp');

async function inspectAllRows() {
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

  const upper = blobs.filter(b => b.cy < 650);
  const lower = blobs.filter(b => b.cy >= 650);

  function clusterRows(list, dyThresh = 25) {
    list.sort((a, b) => a.cy - b.cy);
    const rows = [];
    for (const b of list) {
      let r = rows.find(r => Math.abs(r.cy - b.cy) < dyThresh);
      if (!r) {
        r = { cy: b.cy, count: 0, items: [] };
        rows.push(r);
      }
      r.count++;
      r.items.push(b);
    }
    return rows;
  }

  const uLeftRows = clusterRows(upper.filter(b => b.cx < 650));
  const uCenterRows = clusterRows(upper.filter(b => b.cx >= 650 && b.cx <= 1700));
  const uRightRows = clusterRows(upper.filter(b => b.cx > 1700));

  const lLeftRows = clusterRows(lower.filter(b => b.cx < 500));
  const lCenterLeftRows = clusterRows(lower.filter(b => b.cx >= 500 && b.cx < 1180));
  const lCenterRightRows = clusterRows(lower.filter(b => b.cx >= 1180 && b.cx <= 1850));
  const lRightRows = clusterRows(lower.filter(b => b.cx > 1850));

  console.log('Upper Rows (8 rows):');
  for (let i = 0; i < 8; i++) {
    const l = uLeftRows[i]?.count || 0;
    const c = uCenterRows[i]?.count || 0;
    const r = uRightRows[i]?.count || 0;
    console.log(`Row ${i} (${String.fromCharCode(65 + i)}): Left=${l}, Center=${c}, Right=${r}, Total=${l + c + r}`);
  }

  console.log('\nLower Rows (9 rows):');
  const lowerLetters = ['J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S'];
  for (let i = 0; i < 9; i++) {
    const l = lLeftRows[i]?.count || 0;
    const cl = lCenterLeftRows[i]?.count || 0;
    const cr = lCenterRightRows[i]?.count || 0;
    const r = lRightRows[i]?.count || 0;
    console.log(`Row ${i} (${lowerLetters[i]}): Left=${l}, CenterLeft=${cl}, CenterRight=${cr}, Right=${r}, Total=${l + cl + cr + r}`);
  }
}

inspectAllRows();
