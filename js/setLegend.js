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
  const fmtArea = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

legend.onAdd = function () {
  const div = L.DomUtil.create("div", "info legend");

  let html = `<strong>ข้อมูลพื้นที่เวนคืน</strong><br>`;
  if (latestDate !== "ไม่ระบุวันที่") {
    html += `<small>วันที่ ${latestDate}</small><br>`;
  }

  const item = (label, colorKey, statusKey) => {
    const data = statusSummary[statusKey] || { count: 0, area: 0 };
    return `
      <div class="legend-item">
        <i style="background: ${colorKey};${statusKey === 'รอรับมอบพื้นที่' ? ' border:1px dashed gray;' : ''}"></i>
        <div>
          ${label}<br>
          <small>${fmtCount.format(data.count)} แปลง (${fmtArea.format(data.area)} ตร.ม.)</small>
        </div>
      </div>`;
  };

  html += item("รอรับมอบพื้นที่", cGray, "#N/A");
  html += item("เข้าพื้นที่ไม่ได้", cRed, "0");
  html += item("เข้าพื้นที่ได้บางส่วน", cYellow, "2");
  html += item("เข้าพื้นที่ได้", cGreen, 1);

  // 👉 เพิ่มสรุปผลรวมด้านล่าง
  const total = Object.values(statusSummary).reduce(
    (sum, cur) => ({
      count: sum.count + cur.count,
      area: sum.area + cur.area
    }),
    { count: 0, area: 0 }
  );

  html += `<hr><div class="legend-total"><strong>รวม</strong> ${fmtCount.format(total.count)} แปลง (${fmtArea.format(total.area)} ตร.ม.)</div>`;

  div.innerHTML = html;
  return div;
};
