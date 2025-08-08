// setPatternLegend.js
// -- Update 2025-08 by Mr.pairot@gmail.com
// รวม setPattern.js + setLegend.js
// กำหนด style polygon + Legend งานส่งมอบพื้นที่

// ===== 1) ตั้งค่าสีเบื้องต้น =====
const cGreen  = "#00CC00";
const cYellow = "#FFD700";
const cRed    = "#FF0000";
const cGray   = "#778899";
const cBlue   = "#00FFFF";
const cDefault ="#fdfefeff"

// ===== 2) ฟังก์ชันสำหรับกำหนดสี StatusWork =====
function getWorkStatusColor(statusWork) {
  switch (statusWork) {
    case "0":  
      return { color: cRed, fillColor: cRed, dashArray: null };
    case "1":  
      return { color: cGreen, fillColor: cGreen, dashArray: null };
    case "2":  
      return { color: cYellow, fillColor: cYellow, dashArray: null }; 
    case "84": // รอส่งมอบ/ป่า
      return { color: cBlue, fillColor: cBlue, dashArray: "4, 4" }; 
    case "8":  // รอส่งมอบ/ทำสัญญาแล้ว
      return { color: cBlue, fillColor: cGray, dashArray: "3, 3" };
    case "9":  // รอส่งมอบ/ยังไม่ทำสัญญา
      return { color: cGray, fillColor: cGray, dashArray: "3, 3" };
    default:
      return { color: cDefault, fillColor: cDefault, dashArray: "4, 4" };
  }
}

// ===== 3) ฟังก์ชันกำหนด style polygon =====
function getPolygonStyle(feature) {
  if (!feature || !feature.properties) {
    console.warn('Feature or properties missing:', feature);
    return defaultStyle();
  }

  const val = feature.properties["StatusWork"];
  const style = getWorkStatusColor(val);

  return {
    color: style.color,
    weight: 1,
    opacity: 1,
    fillColor: style.fillColor,
    fillOpacity: 0.5,
    dashArray: style.dashArray
  };
}

function defaultStyle() {
  return {
    color: "black",
    weight: 1,
    opacity: 1,
    fillColor: "white",
    fillOpacity: 0.2,
    dashArray: "1, 4"
  };
}

// ===== 4) ฟังก์ชันสีสถานะตัวอักษร Popup =====
function getStatusColor(status) {
  switch (status) {
    case "ส่งมอบแล้ว":       return cGreen; 
    case "อยู่ระหว่างส่งมอบ": return cYellow; 
    case "ยังไม่ส่งมอบ":      return cRed; 
    default:                  return cGray; 
  }
}

// ===== 5) ฟังก์ชันสร้าง Legend =====
function addPolygonLandLegend(features) {
  const values = new Set();
  const updateDates = new Set();
  const statusSummary = {};

  features.forEach(feature => {
    if (feature.properties) {
      const status = feature.properties["StatusWork"];
      const area = parseFloat(feature.properties["Area"]) || 0;

      if (status !== undefined) {
        values.add(status);
        if (!statusSummary[status]) {
          statusSummary[status] = { count: 0, area: 0 };
        }
        statusSummary[status].count += 1;
        statusSummary[status].area += area;
      }

      if (feature.properties.update_date) {
        updateDates.add(feature.properties.update_date);
      }
    }
  });

  const latestDate = Array.from(updateDates).sort().pop() || "ไม่ระบุวันที่";
  const legend = L.control({ position: "topright" });

  // ฟอร์แมตตัวเลข
  const fmtCount = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0 });
  const fmtArea  = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "info legend");

    let html = `<strong style="font-weight:bold;">ข้อมูลพื้นที่เวนคืน</strong><br>`;
    if (latestDate !== "ไม่ระบุวันที่") {
      html += `<small>วันที่ ${latestDate}</small><br>`;
    }

    const item = (label, colorKey, statusKey, borderStyle = "") => {
      const data = statusSummary[statusKey] || { count: 0, area: 0 };
      return `
        <div class="legend-item">
          <i style="background: ${colorKey}; border:${borderStyle}"></i>
          <div>
            <strong style="font-weight:bold;">${label}</strong> <br>
            <small>${fmtCount.format(data.count)} แปลง (${fmtArea.format(data.area)} ตร.ม.)</small>
          </div>
        </div>`;
    };

    html += item("เข้าพื้นที่ไม่ได้", cRed, "0");
    html += item("เข้าพื้นที่ได้", cGreen, "1");
    html += item("เข้าพื้นที่ได้บางส่วน", cYellow, "2");
    html += item("รอส่งมอบ/ป่า", cBlue, "84");
    html += item("รอส่งมอบ/ทำสัญญาแล้ว", cGray, "8", `1px solid ${cBlue}`);
    html += item("รอส่งมอบ/ยังไม่ทำสัญญา", cGray, "9", `1px solid ${cGray}`);

    div.innerHTML = html;
    return div;
  };

  return legend;
}
