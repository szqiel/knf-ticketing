const sharp = require('sharp');
const fs = require('fs');

async function verify() {
  const seats = JSON.parse(fs.readFileSync('scratch/canonical_seats.json', 'utf8'));
  console.log(`Checking ${seats.length} seats...`);

  // Create an SVG with red dots and labels at each seat (x, y)
  const svgElements = seats.map(s => `
    <circle cx="${s.x}" cy="${s.y}" r="6" fill="red" opacity="0.8"/>
    <text x="${s.x}" y="${s.y - 10}" font-family="Arial" font-size="11" font-weight="bold" fill="blue" text-anchor="middle">${s.label}</text>
  `).join('\n');

  const svg = `<svg width="2371" height="1344" xmlns="http://www.w3.org/2000/svg">
    ${svgElements}
  </svg>`;

  await sharp('Designs/SEAT 2.png')
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .toFile('scratch/seat_alignment_verification.png');

  console.log('Saved verification overlay to scratch/seat_alignment_verification.png');
}

verify();
