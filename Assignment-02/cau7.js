// Yêu cầu: nạp jQuery (ví dụ jquery-3.7.1.min.js) trước file này trong HTML.

// Các bài dùng chung cách định dạng tiền để không phải viết lại cùng một hàm.
function money(amount) {
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(amount) + ' đ';
}

// Chuyển ký tự đặc biệt thành văn bản an toàn trước khi đưa dữ liệu vào innerHTML.
// Ví dụ tên khách có dấu < sẽ được hiển thị đúng, không bị hiểu là thẻ HTML.
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
}

function systemDate() {
    return new Date().toLocaleString('vi-VN', {
        weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function displayDate(dateValue) {
    // Tách chuỗi yyyy-mm-dd để tránh ngày bị lệch khi chuyển múi giờ.
    return dateValue.split('-').reverse().join('/');
}

// Mở trang kết quả ngay trong sự kiện bấm nút để trình duyệt cho phép mở tab.
// Những dữ liệu người dùng nhập phải đi qua escapeHTML trước khi truyền vào đây.
function openResult(title, content) {
    const resultWindow = window.open('', '_blank');
    if (!resultWindow) {
        alert('Hãy cho phép cửa sổ bật lên (pop-up) rồi bấm lại để xem kết quả.');
        return;
    }
    // Sao chép CSS đã nhúng sang tab kết quả, không phụ thuộc file CSS bên ngoài.
    const resultStyles = ['common-style', 'result-style', 'exercise-style'].map(function (id) {
        const $style = $('#' + id);
        return $style.length ? '<style>' + $style.text() + '</style>' : '';
    }).join('');
    const isRestaurantInvoice = title === 'Hóa đơn';
    const pageClass = title === 'CV cá nhân' ? 'result-page cv-result'
        : isRestaurantInvoice ? 'result-page restaurant-invoice' : 'result-page';
    resultWindow.document.write(`<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHTML(title)}</title>${resultStyles}</head><body class="${pageClass}"><main><h1>${escapeHTML(title)}</h1>${content}</main></body></html>`);
    resultWindow.document.close();
}

const $skillsContainer = $('#skills');
let skillCount = 0;
// Ví dụ có sẵn (chữ xám mờ) cho tên kỹ năng, người dùng gõ vào là tự đè lên.
const skillExamples = ['Node JS', 'Angular', 'Adobe Photoshop'];
function addSkill() {
    skillCount += 1;
    const example = skillExamples[(skillCount - 1) % skillExamples.length];
    const $skill = $('<div>', { 'class': 'skill' });
    // Mỗi ô có id riêng để label luôn trỏ đúng ô, kể cả khi thêm nhiều kỹ năng.
    $skill.html(`<label for="skill-name-${skillCount}">Tên kỹ năng</label><input id="skill-name-${skillCount}" class="skill-name" placeholder="${example}" required><label for="skill-level-${skillCount}">Mức độ</label><input id="skill-level-${skillCount}" class="skill-level" type="range" min="0" max="100" step="10" value="50"><output>50%</output>`);
    $skillsContainer.append($skill);
}
$('#add-skill').on('click', addSkill);
$skillsContainer.on('input', '.skill-level', function () {
    $(this).parent().find('output').text(this.value + '%');
});
addSkill();
let avatarData = '';
let avatarLoading = false;
$('#avatar').on('change', function () {
    avatarData = '';
    const file = this.files[0];
    if (!file) { avatarLoading = false; return; }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        alert('Hãy chọn ảnh JPG, PNG, WebP hoặc GIF.');
        $(this).val('');
        return;
    }
    // Đọc ảnh thành data URL để trang CV mới hiển thị được ảnh vừa chọn.
    // FileReader là API trình duyệt, jQuery không có bản thay thế nên giữ nguyên.
    const reader = new FileReader();
    avatarLoading = true;
    reader.onload = function () { avatarData = reader.result; avatarLoading = false; };
    reader.onerror = function () { avatarLoading = false; alert('Không đọc được ảnh. Hãy chọn lại.'); };
    reader.readAsDataURL(file);
});
$('#cv-form').on('submit', function (event) {
    event.preventDefault();
    if (avatarLoading) { alert('Ảnh đang được đọc, vui lòng bấm Đăng ký lại sau một lát.'); return; }
    const skills = $skillsContainer.find('.skill').map(function () {
        const $skill = $(this);
        const name = $skill.find('.skill-name').val();
        const level = Number($skill.find('.skill-level').val());
        // progress biểu diễn mức độ 0–100 bằng thanh tiến trình trên CV.
        return `<div class="cv-skill"><div class="cv-skill-name">${escapeHTML(name)}</div><div class="cv-bar" role="progressbar" aria-label="${escapeHTML(name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${level}"><div class="cv-bar-fill" style="width:${level}%">${level}%</div></div></div>`;
    }).get().join('');
    const imageSource = avatarData || new URL('picture/avatar.jpg', location.href).href;
    // Biểu tượng SVG nhúng sẵn (không phụ thuộc thư viện icon bên ngoài).
    const icon = function (path) { return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`; };
    const iconJob = icon('M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z');
    const iconHome = icon('M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z');
    const iconMail = icon('M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z');
    const iconPhone = icon('M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z');
    const iconStar = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 2h3v7.3l6.3-3.6 1.5 2.6-6.3 3.7 6.3 3.7-1.5 2.6-6.3-3.6V22h-3v-7.3l-6.3 3.6-1.5-2.6 6.3-3.7-6.3-3.7 1.5-2.6 6.3 3.6z"/></svg>';
    // Font Roboto nạp không chặn trang: mất mạng thì tự dùng Arial.
    const fontLink = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" media="print" onload="this.media='all'">`;
    // Thứ tự theo mẫu: nghề nghiệp, địa chỉ, email, điện thoại.
    openResult('CV cá nhân', `${fontLink}<article class="cv-card"><img src="${escapeHTML(imageSource)}" alt="Ảnh đại diện" onerror="this.hidden=true"><h2>${escapeHTML($('#full-name').val())}</h2><ul class="cv-info"><li>${iconJob}<span>${escapeHTML($('#job').val())}</span></li><li>${iconHome}<span>${escapeHTML($('#cv-address').val())}</span></li><li>${iconMail}<span>${escapeHTML($('#email').val())}</span></li><li>${iconPhone}<span>${escapeHTML($('#cv-phone').val())}</span></li></ul><h3 class="cv-skills-title">${iconStar}<span>Kỹ năng</span></h3>${skills}</article>`);
});
