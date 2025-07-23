// ฟังก์ชันกำหนด style polygon ตามค่า StatusWork
function getPolygonStyle(feature) {
  if (!feature || !feature.properties) {
    console.warn('Feature or properties missing:', feature);
    return defaultStyle();
  }
  
  const val = feature.properties["StatusWork"];
  console.log('Status value:', val, 'Type:', typeof val); // เพิ่ม debug
  
  if (val === "#N/A" || val === null || val === undefined || isNaN(val)) {
    return {
      color: "gray",
      weight: 1,
      opacity: 0.5,
      fillColor: "gray",
      fillOpacity: 0.5,
      dashArray: "5, 5"
    };
  }
  
  // เปลี่ยนเป็น Number เพื่อให้แน่ใจ
  const numVal = Number(val);
  
  const styleMap = {
    0: { color: "red", fillColor: "red", dashArray: null },
    1: { color: "green", fillColor: "green", dashArray: null },
    2: { color: "yellow", fillColor: "yellow", dashArray: null }
  };
  
  const style = styleMap[numVal] || defaultStyle();
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
