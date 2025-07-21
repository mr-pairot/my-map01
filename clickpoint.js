let rippleInterval = null;
let currentPosition = null;
let centerDot = null;

// ฟังก์ชันสร้าง ripple เดี่ยว
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

// เริ่ม ripple ที่ตำแหน่ง latlng และกำหนดความเร็ว
function startRippleEffect(latlng, options = {}) {
  stopRipples(); // ล้างของเดิม

  const { interval = 1000 } = options;
  currentPosition = latlng;

  const point = map.latLngToContainerPoint(currentPosition);
  centerDot = document.createElement('div');
  centerDot.className = 'ripple-center-dot';
  centerDot.style.left = `${point.x}px`;
  centerDot.style.top = `${point.y}px`;
  map.getContainer().appendChild(centerDot);

  rippleInterval = setInterval(createSingleRipple, interval);
  createSingleRipple();
}

// หยุด ripple ทั้งหมด
function stopRipples() {
  clearInterval(rippleInterval);
  rippleInterval = null;

  if (centerDot?.parentNode) {
    centerDot.parentNode.removeChild(centerDot);
    centerDot = null;
  }

  currentPosition = null;
}

// แสดง popup พร้อมปุ่มคัดลอก
function showCoordinatePopup(latlng) {
  const lat = latlng.lat.toFixed(6);
  const lng = latlng.lng.toFixed(6);
  const gmapLink = `https://www.google.com/maps/dir/${lat},${lng}`;

  const popupContent = `
    <div style="font-size: 13px;">
      <strong>Lat:</strong> ${lat}<br>
      <strong>Lng:</strong> ${lng}<br>
      <a href="${gmapLink}" target="_blank">🔗 เปิดใน Google Maps</a><br>
      <button onclick="navigator.clipboard.writeText('${lat},${lng}')">📋 คัดลอกพิกัด</button><br>
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
  startRippleEffect(e.latlng, { interval: 1200 });
});

// คลิกขวา
map.on('contextmenu', function(e) {
    startRippleEffect(e.latlng, { interval: 500 });
    showCoordinatePopup(e.latlng);
});

// คลิกค้างนาน 2 วิ
let holdTimeout = null;

map.on('mousedown', function(e) {
    holdTimeout = setTimeout(() => {
        startRippleEffect(e.latlng, { interval: 500 });
        showCoordinatePopup(e.latlng);
    }, 2000);
});

map.on('mouseup', function() {
    clearTimeout(holdTimeout);
});

