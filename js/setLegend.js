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

// Test Input
let parcelFeatures = []; // เก็บ features ทั้งหมด

// ฟังก์ชันสำหรับสร้าง popup content (แยกไว้เพื่อ reuse)
function getPopupContent(props) {
  const code = props.Code || "ไม่ระบุ";
  const type = props.Type || "ไม่ระบุ";
  const status = props.Status || "ไม่ระบุ";
  const status_work = props.StatusWork || "ไม่ระบุ";

  const statusWorkText = (() => {
    switch (status_work) {
      case "#N/A": return "รอรับมอบพื้นที่";
      case "0": return "เข้าพื้นที่ไม่ได้";
      case "1": return "เข้าพื้นที่ได้";
      case "2": return "เข้าพื้นที่บางส่วน";
      default: return "ไม่ทราบสถานะ";
    }
  })();

  return `
    <div class="custom-polygonLand-popup">
      <div><strong class="label">เลขแปลง  : </strong>
        <span class="parcel-code">${code}</span>
      </div>
      <div><strong class="label">ประเภทที่ดิน : </strong> ${type}</div>
      <div><strong class="label">สถานะส่งมอบ:</strong> 
        <span style="color:${getStatusColor(status)};">${status}</span>
      </div>
      <div><strong class="label">สถานะหน้างาน:</strong> 
        <span style="color:${getWorkStatusColor(status_work)};">${statusWorkText}</span>
      </div>
    </div>
  `;
}

// โหลด polygon.kml
fetch('polygon.kml')
  .then(res => res.text())
  .then(kmlText => {
    const parser = new DOMParser();
    const kml = parser.parseFromString(kmlText, 'text/xml');
    const track = new L.KML(kml);
    const geojsonLayer = L.geoJSON(track.toGeoJSON(), {
      onEachFeature: (feature, layer) => {
        const popupContent = getPopupContent(feature.properties);
        layer.bindPopup(popupContent);
        layer.feature = feature;
        parcelFeatures.push({ code: feature.properties.Code, layer });
      }
    }).addTo(map);

    // เติม <datalist>
    const parcelList = document.getElementById("parcelList");
    parcelFeatures.forEach(p => {
      const option = document.createElement("option");
      option.value = p.code;
      parcelList.appendChild(option);
    });
  });

// จัดการเมื่อเลือก/พิมพ์เลขแปลง
document.getElementById("searchBox").addEventListener("change", function () {
  const searchCode = this.value.trim();
  const found = parcelFeatures.find(p => p.code === searchCode);
  if (found) {
    const bounds = found.layer.getBounds();
    const center = bounds.getCenter();
    map.setView(center, 13);
    found.layer.openPopup();
  } else {
    alert("ไม่พบเลขแปลงนี้ในระบบ");
  }
});

