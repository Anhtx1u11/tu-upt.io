// student.js
const students = {
  "K16THO0002": "Lê Duy An",
  "K16THO0001": "Lê Duy An",
  "K16THO0007": "Lê Quốc Chung",
  "K16THO0008": "Nguyễn Hồng Cung",
  "K16THO0009": "Nguyễn Hữu Đại",
  "K16THO0011": "Mang Huỳnh Tấn Dũng",
  "K16THO0012": "Nguyễn Hữu Dương",
  "K16THO0017": "Nguyễn Ngọc Hoài",
  "K16THO0018": "Nguyễn Huy Hoàng",
  "K16THO0019": "Trần Vũ Hoàng",
  "K16THO0020": "Đoàn Ngọc Quốc Huy",
  "K16THO0021": "Hồ Tấn Huy",
  "K16THO0022": "Lê Quốc Huy",
  "K16THO0024": "Phạm Đăng Huy",
  "K16THO0030": "Nguyễn Đăng Khoa",
  "K16THO0032": "Lê Thị Thanh Liên",
  "K16THO0038": "Nguyễn Thị Hồng Nhạn",
  "K16THO0039": "Lê Minh Nhật",
  "K16THO0040": "Võ Phùng Minh Nhật",
  "K16THO0041": "Vũ Minh Nhật",
  "K16THO0042": "Lê Ngọc Phi",
  "K16THO0043": "Lưu Văn Hoàng Phúc",
  "K16THO0044": "Nguyễn Bá Ngọc Hoàng Phương",
  "K16THO0049": "Trần Ngọc Nhật Tân",
  "K16THO0050": "Nguyễn Thanh Tấn",
  "K16THO0053": "Ngô Gia Thành",
  "K16THO0058": "Phạm Trường Thống",
  "K16THO0059": "Nguyễn Trần Vĩnh Thuận",
  "K16THO0060": "Thông Minh Thuận",
  "K16THO0073": "Nguyễn Trọng Tiến",
  "K16THO0061": "Lương Lê Tín",
  "K16THO0068": "Trần Minh Trực",
  "K16THO0069": "Trần Hữu Trung",
  "K16THO0070": "Nguyễn Anh Tú",
  "K16THO0071": "Lê Vũ",
  "K16THO0072": "Đoàn Quang Vương",

  // Dưới đây là 39 sinh viên mới
  "K16THO0003": "Nguyễn Bùi Đức",
  "K16THO0004": "Nguyễn Hoàng Anh",
  "K16THO0005": "Huỳnh Gia Bảo",
  "K16THO0006": "Nguyễn Thanh Bình",
  "K16THO0010": "Huỳnh Hoàng Đức",
  "K16THO0013": "Nguyễn Quốc Hải",
  "K16THO0014": "Võ Thanh Hậu",
  "K16THO0015": "Nguyễn Thành Hiếu",
  "K16THO0016": "Phạm Xuân Hiếu",
  "K16THO0025": "Phạm Văn Huy",
  "K16THO0026": "Phan Gia Huy",
  "K16THO0027": "Phùng Nhất Huy",
  "K16THO0028": "Trương Minh Khải",
  "K16THO0029": "Nguyễn Tuấn Khanh",
  "K16THO0023": "Ngô Lê Huy",
  "K16THO0031": "Phan Vũ Anh Khôi",
  "K16THO0035": "Phạm Ngọc Minh",
  "K16THO0036": "Nguyễn Nhật Nam",
  "K16THO0033": "Nguyễn Lưu Thành Lộc",
  "K16THO0037": "Lê Nhân",
  "K16THO0034": "Nguyễn Trần Đại Long",
  "K16THO0045": "Nguyễn Anh Quân",
  "K16THO0046": "Nguyễn Nhất Sinh",
  "K16THO0047": "Dương Tấn Tài",
  "K16THO0048": "Nguyễn Hữu Tài",
  "K16THO0051": "Trần Thanh Tấn",
  "K16THO0052": "Nguyễn Xuân Ngọc Thắm",
  "K16THO0074": "Đỗ Ngọc Thạch",
  "K16THO0054": "Trịnh Tấn Thành",
  "K16THO0055": "Nguyễn Quốc Thể",
  "K16THO0056": "Ngô Văn Thịnh",
  "K16THO0057": "Lê Văn Thống",
  "K16THO0062": "Phạm Trọng Tín",
  "K16THO0063": "Ngô Ngọc Bảo Trân",
  "K16THO0064": "Lê Phạm Hoàng Triều",
  "K16THO0065": "Lê Thị Mỹ Trinh",
  "K16THO0066": "Nguyễn Khúc Thanh Trọng",
  "K16THO0067": "Trần Hữu Trọng",
  "K16THO0075": "Nguyễn Hoàng Trung Hiên"
};


// Lấy MSSV từ query string, ví dụ: index.html?mssv=K16THO0042
function getMSSVFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('mssv');
}

document.addEventListener("DOMContentLoaded", () => {
  const mssv = getMSSVFromURL();
  const name = students[mssv];

  document.getElementById("student-name").textContent = name || "Không tìm thấy sinh viên";
  document.getElementById("student-id").textContent = mssv || "Không rõ";
});
