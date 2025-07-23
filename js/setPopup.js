// setPopup.js

function createPopupContent(props) {
  const code = props.Code || "ไม่ระบุ";
  const type = props.Type || "ไม่ระบุ";
  const status = props.Status || "ไม่ระบุ";
  const status_work = props.StatusWork || "ไม่ระบุ";

  const statusWorkText = (() => {
    switch (status_work) {
      case "#N/A":
        return "รอรับมอบพื้นที่";
      case "0":
        return "เข้าพื้นที่ไม่ได้";
      case "1":
        return "เข้าพื้นที่ได้";
      case "2":
        return "เข้าพื้นที่บางส่วน";
      default:
        return "ไม่ทราบสถานะ";
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

// ให้ฟังก์ชันนี้เป็น global (สำหรับ index.html ที่ไม่มี module)
window.createPopupContent = createPopupContent;
