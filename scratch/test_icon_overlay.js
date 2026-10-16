const sharp = require('sharp');
const fs = require('fs');

async function testIconOverlay() {
  const seats = JSON.parse(fs.readFileSync('scratch/canonical_seats.json', 'utf8'));

  // SVG glyph
  // In 25x23, backrest center is (12.5, 9.37).
  // Scaled 2x: scale(2), center is (25, 18.74).
  const seatDef = `
    <g id="chair">
      <path d="M22.5212 19.9765V20.4708C22.5212 21.4727 21.6521 22.2848 20.5798 22.2848H4.42492C3.35266 22.2848 2.48351 21.4727 2.48351 20.4708V19.9765C2.48351 18.9746 3.35266 18.1625 4.42492 18.1625H20.5798C21.6521 18.1625 22.5212 18.9746 22.5212 19.9765Z" stroke="#000" stroke-width="0.8"/>
      <path d="M2.7386 18.5197H2.21901C1.11368 18.5197 0.220916 17.6856 0.220916 16.6528L0.220916 2.08776C0.220916 1.05497 1.11368 0.2208 2.21901 0.2208H2.7386C3.84393 0.2208 4.73669 1.05497 4.73669 2.08776L4.73669 16.6528C4.73669 17.6856 3.84393 18.5197 2.7386 18.5197Z" stroke="#000" stroke-width="0.8"/>
      <path d="M22.7809 18.5197H22.2614C21.156 18.5197 20.2633 17.6856 20.2633 16.6528V2.08776C20.2633 1.05497 21.156 0.2208 22.2614 0.2208H22.7809C23.8863 0.2208 24.7791 1.05497 24.7791 2.08776V16.6528C24.7838 17.6856 23.8863 18.5197 22.7809 18.5197Z" stroke="#000" stroke-width="0.8"/>
      <path d="M22.5212 2.71893V16.0261C22.5212 17.306 21.4112 18.3432 20.0413 18.3432H4.9587C3.58884 18.3432 2.47878 17.306 2.47878 16.0261V2.71893C2.47878 1.43897 3.58884 0.401765 4.9587 0.401765H20.0413C21.4112 0.401765 22.5212 1.43897 22.5212 2.71893Z" stroke="#000" stroke-width="0.8"/>
    </g>
  `;

  // Render a sample of seats with green stroke to test overlay match
  const sampleSeats = [seats[0], seats[28], seats[50], seats[100], seats[200], seats[300], seats[400], seats[505]];
  const chairs = sampleSeats.map(s => `
    <g transform="translate(${s.x}, ${s.y}) rotate(${s.rotation}) translate(-25, -18.74) scale(2)" fill="rgba(0, 255, 0, 0.4)">
      <use href="#chair" stroke="green"/>
    </g>
  `).join('\n');

  const svg = `<svg width="2371" height="1344" xmlns="http://www.w3.org/2000/svg">
    <defs>${seatDef}</defs>
    ${chairs}
  </svg>`;

  await sharp('Designs/SEAT 2.png')
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .toFile('scratch/icon_overlay_test.png');

  console.log('Saved test overlay to scratch/icon_overlay_test.png');
}

testIconOverlay();
