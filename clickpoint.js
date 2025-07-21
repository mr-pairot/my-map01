let rippleInterval = null;
let currentPosition = null;
let centerDot = null;

// ฟังก์ชันสร้าง ripple
const createSingleRipple = () => {
  if (!currentPosition) return;

  const point = map.latLngToContainerPoint(currentPosition);

  const ripple = document.createElement('div');
  ripple.className = 'ripple-effect';
  ripple.style.left = `${point.x}px`;
  ripple.style.top = `${point.y}px`;

  map.getContainer().appendChild(ripple);

  setTimeout(() => {
    if (ripple.parentNode) {
      ripple.parentNode.removeChild(ripple);
    }
  }, 1500);
};

// ฟังก์ชันหยุด ripple ทั้งหมด
const stopRipples = () => {
  clearInterval(rippleInterval);
  rippleInterval = null;

  if (centerDot && centerDot.parentNode) {
    centerDot.parentNode.removeChild(centerDot);
    centerDot = null;
  }
  currentPosition = null;
};

// เมื่อคลิกแผนที่
map.on('click', (e) => {
  stopRipples();

  currentPosition = e.latlng;

  const point = map.latLngToContainerPoint(currentPosition);

  // สร้างจุดกลาง
  centerDot = document.createElement('div');
  centerDot.className = 'ripple-center-dot';
  centerDot.style.left = `${point.x}px`;
  centerDot.style.top = `${point.y}px`;
  map.getContainer().appendChild(centerDot);

  // เริ่มวง ripple ใหม่
  rippleInterval = setInterval(createSingleRipple, 1000);
  createSingleRipple();
});

// ปุ่มหยุด ripple
document.getElementById('stopRippleBtn').addEventListener('click', stopRipples);

// รองรับ Spacebar เพื่อหยุด ripple ด้วย
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    stopRipples();
  }
});


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

// คลิกขวา
map.on('contextmenu', function(e) {
    showCoordinatePopup(e.latlng);
});

// คลิกค้างนาน 2 วิ
let holdTimeout = null;

map.on('mousedown', function(e) {
    holdTimeout = setTimeout(() => {
        showCoordinatePopup(e.latlng);
    }, 2000);
});

map.on('mouseup', function() {
    clearTimeout(holdTimeout);
});

function updateCenterDotPosition() {
  if (!currentPosition || !centerDot) return;
  const point = map.latLngToContainerPoint(currentPosition);
  centerDot.style.left = `${point.x}px`;
  centerDot.style.top = `${point.y}px`;
}
// เมื่อแผนที่ถูกเลื่อนหรือซูม ให้ขยับ centerDot ตาม
map.on('move', updateCenterDotPosition);
map.on('zoom', updateCenterDotPosition);
