// 1. Chỉ định URL duy nhất được phép truy cập trang này
const allowedReferrer = 'https://anhtu1.id.vn/A-Main/t.anh/chon.html';

// 2. Kiểm tra trang trước đó
if (!document.referrer.startsWith(allowedReferrer)) {
    // 3. Chuyển hướng nếu không hợp lệ
    window.location.href = 't.anh/block.html';
}
