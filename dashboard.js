const canvas = document.getElementById('mixCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1280;
canvas.height = 720;

let overlays = [];
let dragTarget = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

// DRAG LOGIC
canvas.addEventListener('pointerdown', e => {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  for (let i = overlays.length - 1; i >= 0; i--) {
    const ov = overlays[i];
    let w = ov.w || 200, h = ov.h || 60;
    if (ov.type === 'text') {
      ctx.font = `${ov.size || 36}px sans-serif`;
      w = ctx.measureText(ov.text).width;
      h = ov.size || 36;
    }
    if (x >= ov.x && x <= ov.x + w && y >= ov.y - h && y <= ov.y) {
      dragTarget = ov;
      dragOffsetX = x - ov.x;
      dragOffsetY = y - ov.y;
      break;
    }
  }
});

canvas.addEventListener('pointermove', e => {
  if (!dragTarget) return;
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  dragTarget.x = x - dragOffsetX;
  dragTarget.y = y - dragOffsetY;
});

canvas.addEventListener('pointerup', () => dragTarget = null);
canvas.addEventListener('pointerleave', () => dragTarget = null);

function drawLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  overlays.forEach(ov => {
    if (ov.type === 'text') {
      ctx.font = `${ov.size || 36}px sans-serif`;
      ctx.fillStyle = ov.color || 'white';
      ctx.fillText(ov.text, ov.x, ov.y);
    }
    if (ov.type === 'image' && ov.img) {
      ctx.drawImage(ov.img, ov.x, ov.y, ov.w || 120, ov.h || 120);
    }
  });
  requestAnimationFrame(drawLoop);
}
requestAnimationFrame(drawLoop);

// Overlay controls
const overlayTextInput = document.getElementById('overlayText');
const addTextOverlayBtn = document.getElementById('addTextOverlay');
const overlayImageInput = document.getElementById('overlayImageInput');
const overlayList = document.getElementById('overlayList');

addTextOverlayBtn.onclick = () => {
  const text = overlayTextInput.value.trim();
  if (!text) return;
  overlays.push({ type: 'text', text, x: 40, y: 80, size: 40 });
  renderOverlayList();
};

overlayImageInput.onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  const img = new Image();
  img.onload = () => {
    overlays.push({ type: 'image', img, x: 60, y: 120, w: 140, h: 140 });
    renderOverlayList();
  };
  img.src = URL.createObjectURL(f);
};

function renderOverlayList() {
  overlayList.innerHTML = '';
  overlays.forEach((ov, i) => {
    const div = document.createElement('div');
    div.className = 'overlay-item';
    div.innerHTML = `${ov.type.toUpperCase()} <button data-i="${i}" class="del">Delete</button>`;
    div.querySelector('.del').onclick = () => { overlays.splice(i, 1); renderOverlayList(); };
    overlayList.appendChild(div);
  });
}
