const sharp = require('sharp');

async function measureAngles() {
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
          blobs.push({ cx: sumX / count, cy: sumY / count });
        }
      }
    }
  }

  const sections = {
    topLeft: blobs.filter(b => b.cy < 650 && b.cx < 650),
    topCenter: blobs.filter(b => b.cy < 650 && b.cx >= 650 && b.cx <= 1700),
    topRight: blobs.filter(b => b.cy < 650 && b.cx > 1700),
    bottomLeft: blobs.filter(b => b.cy >= 650 && b.cx < 500),
    bottomCenterLeft: blobs.filter(b => b.cy >= 650 && b.cx >= 500 && b.cx < 1180),
    bottomCenterRight: blobs.filter(b => b.cy >= 650 && b.cx >= 1180 && b.cx <= 1850),
    bottomRight: blobs.filter(b => b.cy >= 650 && b.cx > 1850),
  };

  // For each section, let's find the regression line angle of its rows!
  // In topLeft: 8 rows of 9 chairs. Let's find pairs of chairs in the same row.
  for (const [name, list] of Object.entries(sections)) {
    // PCA or angle of minimum variance or angle of row lines
    // Let's compute covariance matrix
    let meanX = 0, meanY = 0;
    for (const b of list) { meanX += b.cx; meanY += b.cy; }
    meanX /= list.length; meanY /= list.length;
    let sxx = 0, sxy = 0, syy = 0;
    for (const b of list) {
      const dx = b.cx - meanX;
      const dy = b.cy - meanY;
      sxx += dx * dx;
      sxy += dx * dy;
      syy += dy * dy;
    }
    const theta = 0.5 * Math.atan2(2 * sxy, sxx - syy);
    const deg = theta * 180 / Math.PI;
    console.log(`${name}: mean=(${Math.round(meanX)}, ${Math.round(meanY)}), PCA angle=${deg.toFixed(2)} deg`);
  }
}
measureAngles();
