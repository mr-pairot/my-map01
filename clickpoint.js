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
            <button onclick="navigator.clipboard.writeText('${gmapLink}')">📋 คัดลอกลิงก์</button>
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
