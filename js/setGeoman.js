let isGeomanVisible = false;

function setupGeomanToggle(map) {
  // สร้างปุ่มเครื่องมือ
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

  // ซ่อนไว้ก่อน
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
      btn.classList.add('move-right');
      btn.textContent = '⏪️'; // เปลี่ยนเป็นไอคอนยุบ
    } else {
      toolbar.classList.remove('show');
      btn.classList.remove('move-right');
      btn.textContent = '⏩️'; // เปลี่ยนเป็นไอคอนขยาย
    }
  });
}
