const sharp = require('sharp');
const fs = require('fs');

async function buildCanonicalSeats() {
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

  console.log('Total valid seat blobs:', blobs.length);

  // 1. topLeft: 8 rows of 9 seats. Rotated by ~8.8 deg.
  const radTopLeft = 8.8 * Math.PI / 180;
  const topLeft = blobs.filter(b => b.cy < 650 && b.cx < 650).map(b => ({
    ...b,
    rotX: b.cx * Math.cos(-radTopLeft) - b.cy * Math.sin(-radTopLeft),
    rotY: b.cx * Math.sin(-radTopLeft) + b.cy * Math.cos(-radTopLeft),
    rotation: 8.8,
    section: 'topLeft'
  }));
  topLeft.sort((a, b) => a.rotY - b.rotY);
  const topLeftRows = [];
  for (let i = 0; i < 8; i++) {
    const rowSeats = topLeft.slice(i * 9, (i + 1) * 9);
    rowSeats.sort((a, b) => b.rotX - a.rotX); // right-to-left
    topLeftRows.push(rowSeats);
  }

  // 2. topRight: 8 rows of 9 seats.
  const radTR = -13.2 * Math.PI / 180;
  const topRight = blobs.filter(b => b.cy < 650 && b.cx > 1700).map(b => ({
    ...b,
    rotX: b.cx * Math.cos(-radTR) - b.cy * Math.sin(-radTR),
    rotY: b.cx * Math.sin(-radTR) + b.cy * Math.cos(-radTR),
    rotation: -13.2,
    section: 'topRight'
  }));
  topRight.sort((a, b) => a.rotY - b.rotY);
  const topRightRows = [];
  for (let i = 0; i < 8; i++) {
    const rowSeats = topRight.slice(i * 9, (i + 1) * 9);
    rowSeats.sort((a, b) => b.rotX - a.rotX); // right-to-left
    topRightRows.push(rowSeats);
  }

  // 3. topCenter: 106 seats.
  const topCenterCounts = [11, 12, 13, 13, 14, 14, 14, 15];
  const topCenter = blobs.filter(b => b.cy < 650 && b.cx >= 650 && b.cx <= 1700).map(b => ({
    ...b,
    rotation: 0,
    section: 'topCenter'
  }));
  topCenter.sort((a, b) => a.cy - b.cy);
  const topCenterRows = [];
  let tcIdx = 0;
  for (const count of topCenterCounts) {
    const rowSeats = topCenter.slice(tcIdx, tcIdx + count);
    tcIdx += count;
    rowSeats.sort((a, b) => b.cx - a.cx); // right-to-left
    topCenterRows.push(rowSeats);
  }

  // 4. bottomLeft: 48 seats (8 rows of 6). Rotated by ~3-4 deg.
  let bestAngleBL = 0, minVarBL = 1e9;
  for (let a = 0; a <= 10; a += 0.2) {
    const rad = a * Math.PI / 180;
    const pts = blobs.filter(b => b.cy >= 650 && b.cx < 500).map(b => ({
      ...b,
      ry: b.cx * Math.sin(-rad) + b.cy * Math.cos(-rad),
    }));
    pts.sort((p1, p2) => p1.ry - p2.ry);
    let varSum = 0;
    for (let r = 0; r < 8; r++) {
      const row = pts.slice(r * 6, (r + 1) * 6);
      const mean = row.reduce((s, p) => s + p.ry, 0) / 6;
      varSum += row.reduce((s, p) => s + (p.ry - mean) ** 2, 0);
    }
    if (varSum < minVarBL) {
      minVarBL = varSum;
      bestAngleBL = a;
    }
  }
  console.log('Best angle for bottomLeft:', bestAngleBL.toFixed(2), 'deg');

  const radBL = bestAngleBL * Math.PI / 180;
  const bottomLeft = blobs.filter(b => b.cy >= 650 && b.cx < 500).map(b => ({
    ...b,
    rotX: b.cx * Math.cos(-radBL) - b.cy * Math.sin(-radBL),
    rotY: b.cx * Math.sin(-radBL) + b.cy * Math.cos(-radBL),
    rotation: bestAngleBL,
    section: 'bottomLeft'
  }));
  bottomLeft.sort((a, b) => a.rotY - b.rotY);
  const bottomLeftRows = [];
  for (let i = 0; i < 8; i++) {
    const rowSeats = bottomLeft.slice(i * 6, (i + 1) * 6);
    rowSeats.sort((a, b) => b.rotX - a.rotX); // right-to-left
    bottomLeftRows.push(rowSeats);
  }

  // 5. bottomRight: 48 seats (8 rows of 6). Rotated by ~ -3 to -5 deg.
  let bestAngleBR = 0, minVarBR = 1e9;
  for (let a = -10; a <= 0; a += 0.2) {
    const rad = a * Math.PI / 180;
    const pts = blobs.filter(b => b.cy >= 650 && b.cx > 1850).map(b => ({
      ...b,
      ry: b.cx * Math.sin(-rad) + b.cy * Math.cos(-rad),
    }));
    pts.sort((p1, p2) => p1.ry - p2.ry);
    let varSum = 0;
    for (let r = 0; r < 8; r++) {
      const row = pts.slice(r * 6, (r + 1) * 6);
      const mean = row.reduce((s, p) => s + p.ry, 0) / 6;
      varSum += row.reduce((s, p) => s + (p.ry - mean) ** 2, 0);
    }
    if (varSum < minVarBR) {
      minVarBR = varSum;
      bestAngleBR = a;
    }
  }
  console.log('Best angle for bottomRight:', bestAngleBR.toFixed(2), 'deg');

  const radBR = bestAngleBR * Math.PI / 180;
  const bottomRight = blobs.filter(b => b.cy >= 650 && b.cx > 1850).map(b => ({
    ...b,
    rotX: b.cx * Math.cos(-radBR) - b.cy * Math.sin(-radBR),
    rotY: b.cx * Math.sin(-radBR) + b.cy * Math.cos(-radBR),
    rotation: bestAngleBR,
    section: 'bottomRight'
  }));
  bottomRight.sort((a, b) => a.rotY - b.rotY);
  const bottomRightRows = [];
  for (let i = 0; i < 8; i++) {
    const rowSeats = bottomRight.slice(i * 6, (i + 1) * 6);
    rowSeats.sort((a, b) => b.rotX - a.rotX); // right-to-left
    bottomRightRows.push(rowSeats);
  }

  // 6. bottomCenterRight and bottomCenterLeft:
  // Rows: J, K, L: 8; M, N, P, Q: 9; R, S: 10
  const lowerCenterCounts = [8, 8, 8, 9, 9, 9, 9, 10, 10];
  const bcr = blobs.filter(b => b.cy >= 650 && b.cx >= 1180 && b.cx <= 1850).map(b => ({
    ...b,
    rotation: 0,
    section: 'bottomCenterRight'
  }));
  bcr.sort((a, b) => a.cy - b.cy);
  const bcrRows = [];
  let bcrIdx = 0;
  for (const count of lowerCenterCounts) {
    const rowSeats = bcr.slice(bcrIdx, bcrIdx + count);
    bcrIdx += count;
    rowSeats.sort((a, b) => b.cx - a.cx); // right-to-left
    bcrRows.push(rowSeats);
  }

  const bcl = blobs.filter(b => b.cy >= 650 && b.cx >= 500 && b.cx < 1180).map(b => ({
    ...b,
    rotation: 0,
    section: 'bottomCenterLeft'
  }));
  bcl.sort((a, b) => a.cy - b.cy);
  const bclRows = [];
  let bclIdx = 0;
  for (const count of lowerCenterCounts) {
    const rowSeats = bcl.slice(bclIdx, bclIdx + count);
    bclIdx += count;
    rowSeats.sort((a, b) => b.cx - a.cx); // right-to-left
    bclRows.push(rowSeats);
  }

  console.log('Lower rows clustered successfully!');
  const lowerLetters = ['J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S'];
  for (let i = 0; i < 9; i++) {
    const letter = lowerLetters[i];
    const r = i < 8 ? bottomRightRows[i].length : 0;
    const cr = bcrRows[i].length;
    const cl = bclRows[i].length;
    const l = i < 8 ? bottomLeftRows[i].length : 0;
    console.log(`Row ${letter}: Right=${r}, CenterRight=${cr}, CenterLeft=${cl}, Left=${l}, Total=${r + cr + cl + l}`);
  }

  // Now, assemble all canonical seats with exact id, label, block, rowName, number, x, y, rotation!
  const allCanonicalSeats = [];

  // Upper: A to H
  const upperLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  for (let i = 0; i < 8; i++) {
    const rowName = upperLetters[i];
    const right = topRightRows[i];
    const center = topCenterRows[i];
    const left = topLeftRows[i];
    let num = 1;

    for (const s of right) {
      allCanonicalSeats.push({
        id: `seat-${rowName}-${num}`,
        label: `${rowName}${num}`,
        block: 'RIGHT',
        rowName,
        number: num,
        x: Math.round(s.cx * 10) / 10,
        y: Math.round(s.cy * 10) / 10,
        rotation: s.rotation,
        status: 'available',
        heldUntil: null
      });
      num++;
    }

    for (const s of center) {
      allCanonicalSeats.push({
        id: `seat-${rowName}-${num}`,
        label: `${rowName}${num}`,
        block: 'CENTER',
        rowName,
        number: num,
        x: Math.round(s.cx * 10) / 10,
        y: Math.round(s.cy * 10) / 10,
        rotation: s.rotation,
        status: 'available',
        heldUntil: null
      });
      num++;
    }

    for (const s of left) {
      allCanonicalSeats.push({
        id: `seat-${rowName}-${num}`,
        label: `${rowName}${num}`,
        block: 'LEFT',
        rowName,
        number: num,
        x: Math.round(s.cx * 10) / 10,
        y: Math.round(s.cy * 10) / 10,
        rotation: s.rotation,
        status: 'available',
        heldUntil: null
      });
      num++;
    }
  }

  // Lower: J to S
  for (let i = 0; i < 9; i++) {
    const rowName = lowerLetters[i];
    const right = i < 8 ? bottomRightRows[i] : [];
    const cr = bcrRows[i];
    const cl = bclRows[i];
    const left = i < 8 ? bottomLeftRows[i] : [];
    let num = 1;

    // For row S: right has 0 seats, but middle starts at 7!
    if (rowName === 'S') {
      num = 7;
    }

    for (const s of right) {
      allCanonicalSeats.push({
        id: `seat-${rowName}-${num}`,
        label: `${rowName}${num}`,
        block: 'RIGHT',
        rowName,
        number: num,
        x: Math.round(s.cx * 10) / 10,
        y: Math.round(s.cy * 10) / 10,
        rotation: s.rotation,
        status: 'available',
        heldUntil: null
      });
      num++;
    }

    for (const s of cr) {
      allCanonicalSeats.push({
        id: `seat-${rowName}-${num}`,
        label: `${rowName}${num}`,
        block: 'CENTER_RIGHT',
        rowName,
        number: num,
        x: Math.round(s.cx * 10) / 10,
        y: Math.round(s.cy * 10) / 10,
        rotation: s.rotation,
        status: 'available',
        heldUntil: null
      });
      num++;
    }

    for (const s of cl) {
      allCanonicalSeats.push({
        id: `seat-${rowName}-${num}`,
        label: `${rowName}${num}`,
        block: 'CENTER_LEFT',
        rowName,
        number: num,
        x: Math.round(s.cx * 10) / 10,
        y: Math.round(s.cy * 10) / 10,
        rotation: s.rotation,
        status: 'available',
        heldUntil: null
      });
      num++;
    }

    for (const s of left) {
      allCanonicalSeats.push({
        id: `seat-${rowName}-${num}`,
        label: `${rowName}${num}`,
        block: 'LEFT',
        rowName,
        number: num,
        x: Math.round(s.cx * 10) / 10,
        y: Math.round(s.cy * 10) / 10,
        rotation: s.rotation,
        status: 'available',
        heldUntil: null
      });
      num++;
    }
  }

  console.log('Total canonical seats generated:', allCanonicalSeats.length);
  console.log('Sample seat 1 (A1):', allCanonicalSeats[0]);
  console.log('Sample seat 29 (A29):', allCanonicalSeats[28]);
  console.log('Sample seat S7:', allCanonicalSeats.find(s => s.label === 'S7'));
  console.log('Sample seat S26:', allCanonicalSeats.find(s => s.label === 'S26'));

  fs.writeFileSync('scratch/canonical_seats.json', JSON.stringify(allCanonicalSeats, null, 2));
  console.log('Saved to scratch/canonical_seats.json');
}

buildCanonicalSeats();
