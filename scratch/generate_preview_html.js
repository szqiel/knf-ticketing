const fs = require('fs');
const seats = JSON.parse(fs.readFileSync('scratch/canonical_seats.json', 'utf8'));

const seatButtons = seats.map(s => {
  const leftPct = (s.x / 2371 * 100).toFixed(4);
  const topPct = (s.y / 1344 * 100).toFixed(4);
  const widthPct = (50 / 2371 * 100).toFixed(4);
  return `
    <button
      class="seat"
      style="left: ${leftPct}%; top: ${topPct}%; width: ${widthPct}%; transform: translate(-50%, -50%) rotate(${s.rotation}deg);"
      aria-label="Seat ${s.label}"
      title="${s.label}"
    >
      <svg viewBox="0 0 25 23" class="seat-icon">
        <path d="M22.5212 19.9765V20.4708C22.5212 21.4727 21.6521 22.2848 20.5798 22.2848H4.42492C3.35266 22.2848 2.48351 21.4727 2.48351 20.4708V19.9765C2.48351 18.9746 3.35266 18.1625 4.42492 18.1625H20.5798C21.6521 18.1625 22.5212 18.9746 22.5212 19.9765Z" fill="currentColor" stroke="#000" stroke-width="0.5"/>
        <path d="M2.7386 18.5197H2.21901C1.11368 18.5197 0.220916 17.6856 0.220916 16.6528L0.220916 2.08776C0.220916 1.05497 1.11368 0.2208 2.21901 0.2208H2.7386C3.84393 0.2208 4.73669 1.05497 4.73669 2.08776L4.73669 16.6528C4.73669 17.6856 3.84393 18.5197 2.7386 18.5197Z" fill="currentColor" stroke="#000" stroke-width="0.5"/>
        <path d="M22.7809 18.5197H22.2614C21.156 18.5197 20.2633 17.6856 20.2633 16.6528V2.08776C20.2633 1.05497 21.156 0.2208 22.2614 0.2208H22.7809C23.8863 0.2208 24.7791 1.05497 24.7791 2.08776V16.6528C24.7838 17.6856 23.8863 18.5197 22.7809 18.5197Z" fill="currentColor" stroke="#000" stroke-width="0.5"/>
        <path d="M22.5212 2.71893V16.0261C22.5212 17.306 21.4112 18.3432 20.0413 18.3432H4.9587C3.58884 18.3432 2.47878 17.306 2.47878 16.0261V2.71893C2.47878 1.43897 3.58884 0.401765 4.9587 0.401765H20.0413C21.4112 0.401765 22.5212 1.43897 22.5212 2.71893Z" fill="currentColor" stroke="#000" stroke-width="0.5"/>
      </svg>
    </button>
  `;
}).join('\n');

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #FFFEEC; display: flex; justify-content: center; padding: 40px; font-family: sans-serif; }
  .canvas {
    position: relative;
    width: 1200px;
    aspect-ratio: 2371 / 1344;
    background: #FFFEF2;
    border: 1px solid #B8B8B2;
    border-radius: 32px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  }
  .screen-bar {
    position: absolute;
    top: 3%;
    left: 15%;
    width: 70%;
    height: 4px;
    background: #111;
    border-radius: 2px;
  }
  .screen-label {
    position: absolute;
    top: 4.5%;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.3em;
    color: #111;
  }
  .seat-container {
    position: absolute;
    inset: 0;
  }
  .seat {
    position: absolute;
    aspect-ratio: 25 / 23;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    color: #FFFFFF;
    transition: transform 0.1s ease, color 0.1s ease;
  }
  .seat:hover {
    color: #CCE3FF;
    z-index: 10;
  }
  .seat-icon {
    width: 100%;
    height: 100%;
    display: block;
  }
</style>
</head>
<body>
  <div class="canvas">
    <div class="screen-bar"></div>
    <div class="screen-label">S C R E E N</div>
    <div class="seat-container">
      ${seatButtons}
    </div>
  </div>
</body>
</html>
`;

fs.writeFileSync('scratch/seat_map_preview.html', html);
console.log('Saved preview to scratch/seat_map_preview.html');
