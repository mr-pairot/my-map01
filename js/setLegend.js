// setLegend.js - Updated version
const cGreen ="#00CC00";
const cYellow ="#FFD700";
const cRed ="#FF0000";
const cGray ="#778899";
//ฟังก์ชันสีสถานะตัวอักษร Popup
function getStatusColor(status) {
  switch (status) {
    case "ส่งมอบแล้ว": return cGreen; // เขียว
    case "อยู่ระหว่างส่งมอบ": return cYellow; // เหลือง
    case "ยังไม่ส่งมอบ": return cRed; // แดง
    default: return cGray; // เทา
  }
}

function getWorkStatusColor(statusWork) {
  switch (statusWork) {
    case "0": return cRed; // แดง
    case "1": return cGreen; // เขียว
    case "2": return cYellow; // ส้ม
    case "#N/A": return cGray; // เทา
    default: return cGray; // เทา
  }
}


function addPolygonLandLegend(features) {
  const values = new Set();
  const updateDates = new Set();
  
  features.forEach(feature => {
    if (feature.properties) {
      const val = feature.properties["StatusWork"];
      if (val !== undefined) {
        values.add(val);
      }
      
      if (feature.properties.update_date) {
        updateDates.add(feature.properties.update_date);
      }
    }
  });
  
  const latestDate = Array.from(updateDates).sort().pop() || "ไม่ระบุวันที่";
  
  const legend = L.control({ position: "topright" }); // เปลี่ยนตำแหน่ง
  
  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "info legend");
    
    let html = `<strong>ข้อมูลพื้นที่เวนคืน</strong><br>`;
    if (latestDate !== "ไม่ระบุวันที่") {
      html += `<small>วันที่ ${latestDate}</small><br>`;
    }
    
  html += `
  <div class="legend-item"><i style="background: ${cGray}; border:1px dashed gray;"></i><span>รอรับมอบพื้นที่</span></div>
  <div class="legend-item"><i style="background: ${cRed};"></i><span>เข้าพื้นที่ไม่ได้</span></div>
  <div class="legend-item"><i style="background: ${cYellow};"></i><span>เข้าพื้นที่ได้บางส่วน</span></div>
  <div class="legend-item"><i style="background: ${cGreen};"></i><span>เข้าพื้นที่ได้</span></div>
  
`;
   
    div.innerHTML = html;
    return div;
  };
  
  return legend;
}
