// setGeoman.js

let isGeomanVisible = false;

function setupGeomanToggle(map) {
  // สร้าง control ตอนเริ่ม
  map.pm.addControls({
    position: 'topleft',
    drawMarker: true,
    drawPolygon: true,
    drawPolyline: true,
    drawCircle: true,
    drawRectangle: true,
    drawCircleMarker: false,
    editMode: false,
    dragMode: true,
    cutPolygon: false,
    deleteLayer: true,
    rotateMode: false,
    oneBlock: true
  });

  // ซ่อนไว้ก่อน (ไม่ให้แสดง control ตอนโหลด)
  setTimeout(() => {
    document.querySelector('.leaflet-pm-toolbar')?.classList.remove('show');
  }, 100);

  const btn = document.getElementById('geoBtn');

  btn.addEventListener('click', () => {
    const toolbar = document.querySelector('.leaflet-pm-toolbar');
    if (!toolbar) return;

    isGeomanVisible = !isGeomanVisible;

    if (isGeomanVisible) {
      toolbar.classList.add('show');
      btn.innerText = '⬆️';
      btn.style.transform = 'translateX(260px)';  // หรือ translateY(200px)
    } else {
      toolbar.classList.remove('show');
      btn.innerText = '⬇️';
      btn.style.transform = 'translateX(0)';      // หรือ translateY(0)
    }
  });
}
