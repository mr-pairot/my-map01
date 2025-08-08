// ==========================
// clickpoint.js
// ==========================

// หน่วงเวลารอให้ Google Sheet คำนวณ (มิลลิวินาที)
const delayMs = 1500;

let rippleInterval = null;
let currentPosition = null;
let centerDot = null;
let holdTimeout = null;

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
  
  const loadingPopup = L.popup()
    .setLatLng(latlng)
    .setContent('<div>กำลังโหลด...</div>')
    .openOn(map);

  const url = `https://script.google.com/macros/s/AKfycbyVtWXvvq-5db2oq4va7bnwIijGejTRz_bWfprWpsbxEr9M7xjz3Zeu4naXExGCtytW-g/exec?lat=${lat}&lng=${lng}`;

  fetch(url, { 
    method: "GET"
    // ไม่ต้องใช้ mode: 'no-cors'
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      throw new Error(data.error);
    }
    
    // Format ค่าตามเดิม
    let staFormatted = "-";
    if (!isNaN(data.sta) && data.sta !== null && data.sta !== "") {
      const staInt = Math.floor(parseFloat(data.sta));
      const km = Math.floor(staInt / 1000);
      const m = staInt % 1000;
      staFormatted = `${km}+${String(m).padStart(3, "0")}`;
    }
    
    let osFormatted = "-";
    if (!isNaN(data.os) && data.os !== null && data.os !== "") {
      osFormatted = parseFloat(data.os).toFixed(2);
    }
    
    const popupContent = `
      <div class="point-popup-content">
        <strong>พิกัด:</strong> ${lat} , ${lng}<br>
        <strong>Sta:</strong> ${staFormatted} <strong>O/S:</strong> ${osFormatted} m.<br><br>
        <button class="point-popup-btn" onclick="navigator.clipboard.writeText('${lat},${lng}')">📋 คัดลอกพิกัด</button><br>
        <button class="point-popup-btn" onclick="window.open('${gmapLink}', '_blank')">🗺️ เปิดใน Google Maps</button>
      </div>
    `;
    
    map.closePopup();
    L.popup()
      .setLatLng(latlng)
      .setContent(popupContent)
      .openOn(map);
  })
  .catch(err => {
    console.error('Error:', err);
    map.closePopup();
    L.popup()
      .setLatLng(latlng)
      .setContent(`<div>เกิดข้อผิดพลาด: ${err.message}</div>`)
      .openOn(map);
  });
}

// อัปเดตตำแหน่ง center dot เมื่อแผนที่เลื่อนหรือซูม
function updateCenterDotPosition() {
  if (!currentPosition || !centerDot) return;
  const point = map.latLngToContainerPoint(currentPosition);
  centerDot.style.left = `${point.x}px`;
  centerDot.style.top = `${point.y}px`;
}
map.on('move', updateCenterDotPosition);
map.on('zoom', updateCenterDotPosition);

// คลิกซ้าย -> ripple ปกติ
map.on('click', (e) => {
  startRippleEffect(e.latlng, { interval: 1000 });
});

// คลิกขวา -> ripple เร็ว + popup
map.on('contextmenu', function (e) {
  startRippleEffect(e.latlng, { interval: 500 });
  showCoordinatePopup(e.latlng);
});

// กดค้าง 2 วินาที -> ripple เร็ว + popup
map.on('mousedown', function (e) {
  holdTimeout = setTimeout(() => {
    startRippleEffect(e.latlng, { interval: 500 });
    showCoordinatePopup(e.latlng);
  }, 2000);
});
map.on('mouseup', function () {
  clearTimeout(holdTimeout);
});

// ปุ่มหยุด ripple
document.getElementById('stopRippleBtn').addEventListener('click', stopRipples);

// Spacebar หรือ ESC -> หยุด ripple
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'Escape') {
    stopRipples();
  }
});
