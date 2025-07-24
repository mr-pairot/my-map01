// clickpoint.js
let rippleInterval = null;
let currentPosition = null;
let centerDot = null;

function createSingleRipple() {
  if (!currentPosition) return;
  const point = map.latLngToContainerPoint(currentPosition);

  const ripple = document.createElement('div');
  ripple.className = 'ripple-effect';
  ripple.style.left = `${point.x}px`;
  ripple.style.top = `${point.y}px`;
  map.getContainer().appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 1500);
}

function startRippleEffect(latlng, options = {}) {
  clearInterval(rippleInterval);
  rippleInterval = null;
  const { interval = 1000 } = options;
  currentPosition = latlng;

  const point = map.latLngToContainerPoint(currentPosition);
  if (centerDot?.parentNode) {
    centerDot.parentNode.removeChild(centerDot);
  }

  centerDot = document.createElement('div');
  centerDot.className = 'ripple-center-dot';
  centerDot.style.left = `${point.x}px`;
  centerDot.style.top = `${point.y}px`;
  map.getContainer().appendChild(centerDot);

  rippleInterval = setInterval(createSingleRipple, interval);
  createSingleRipple();
  toggleFadeShrink('stopRippleBtn', true);

}

function stopRipples() {
  clearInterval(rippleInterval);
  rippleInterval = null;

  if (centerDot?.parentNode) {
    centerDot.parentNode.removeChild(centerDot);
    centerDot = null;
  }

  currentPosition = null;
  toggleFadeShrink('stopRippleBtn', false);
}

function toggleFadeShrink(id, show) {
  const el = document.getElementById(id);
  if (!el) return;

  if (show) {
    el.style.display = 'block';
    requestAnimationFrame(() => {
      el.classList.remove('fade-out');
      el.classList.add('fade-in');
    });
  } else {
    el.classList.remove('fade-in');
    el.classList.add('fade-out');

    setTimeout(() => {
      el.style.display = 'none';
    }, 600);
  }
}

function showCoordinatePopup(latlng) {
  const lat = latlng.lat.toFixed(6);
  const lng = latlng.lng.toFixed(6);
  const gmapLink = `https://www.google.com/maps/dir/${lat},${lng}`;

  const popupContent = `
  <div class="point-popup-content">
    <strong>พิกัด:</strong> ${lat} , ${lng}<br><br>
    <button class="point-popup-btn" onclick="navigator.clipboard.writeText('${lat},${lng}')">📋 คัดลอกพิกัด</button><br>
    <button class="point-popup-btn" onclick="window.open('${gmapLink}', '_blank')">🗺️ เปิดใน Google Maps</button>
  </div>
`;

  L.popup()
    .setLatLng(latlng)
    .setContent(popupContent)
    .openOn(map);
}

// ปรับตำแหน่ง dot ตามการเลื่อน/ซูม
function updateCenterDotPosition() {
  if (!currentPosition || !centerDot) return;
  const point = map.latLngToContainerPoint(currentPosition);
  centerDot.style.left = `${point.x}px`;
  centerDot.style.top = `${point.y}px`;
}
map.on('move', updateCenterDotPosition);
map.on('zoom', updateCenterDotPosition);

// คลิกซ้าย
map.on('click', (e) => {
  startRippleEffect(e.latlng, { interval: 1000 });
});

// คลิกขวา
map.on('contextmenu', function (e) {
  startRippleEffect(e.latlng, { interval: 500 });
  showCoordinatePopup(e.latlng);
});

let holdTimeout = null;

map.on('mousedown', function (e) {
  holdTimeout = setTimeout(() => {
    startRippleEffect(e.latlng, { interval: 500 });
    showCoordinatePopup(e.latlng);
  }, 2000);
});

map.on('mouseup', function () {
  clearTimeout(holdTimeout);
});

document.getElementById('stopRippleBtn').addEventListener('click', stopRipples);

// กด Spacebar/Esc เพื่อหยุด ripple
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'Escape') {
    stopRipples();
  }
});
