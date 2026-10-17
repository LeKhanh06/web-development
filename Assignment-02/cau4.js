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
    const isTicket = title === 'Thông tin vé';
    const pageClass = title === 'CV cá nhân' ? 'result-page cv-result'
        : isRestaurantInvoice ? 'result-page restaurant-invoice'
        : isTicket ? 'result-page ticket-invoice' : 'result-page';
    const printButton = '<button class="print-button" onclick="window.print()">In trang này</button>';
    resultWindow.document.write(`<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHTML(title)}</title>${resultStyles}</head><body class="${pageClass}"><main><h1>${escapeHTML(title)}</h1>${content}${isRestaurantInvoice || isTicket ? '' : printButton}</main></body></html>`);
    resultWindow.document.close();
}

// Giữ select thật để không đổi cách chọn ghế; chỉ thay thanh cuộn của trình duyệt.
const $seatSelect = $('#seats');
const seatSelect = $seatSelect[0];
const $seatWrapper = $('<div>', { 'class': 'seat-scroll' });
$seatSelect.before($seatWrapper);
$seatWrapper.append($seatSelect);
const $seatScrollbar = $('<div>', { 'class': 'seat-scrollbar' });
$seatScrollbar.html('<button type="button" class="seat-scroll-up" aria-label="Cuộn ghế lên"></button><div class="seat-scroll-track"><div class="seat-scroll-thumb" role="scrollbar" tabindex="0" aria-label="Cuộn danh sách ghế" aria-controls="seats" aria-orientation="vertical" aria-valuemin="0"></div></div><button type="button" class="seat-scroll-down" aria-label="Cuộn ghế xuống"></button>');
$seatWrapper.append($seatScrollbar);
const $seatTrack = $seatScrollbar.find('.seat-scroll-track');
const $seatThumb = $seatScrollbar.find('.seat-scroll-thumb');

function updateSeatScrollbar() {
    const maximum = Math.max(0, seatSelect.scrollHeight - seatSelect.clientHeight);
    const trackHeight = $seatTrack[0].clientHeight;
    // Con trượt chiếm 68% rãnh theo mẫu; phần rãnh còn lại vẫn ánh xạ toàn bộ danh sách.
    const thumbHeight = maximum > 0 ? trackHeight * 0.68 : trackHeight;
    $seatThumb.css({
        height: thumbHeight + 'px',
        top: (maximum ? seatSelect.scrollTop / maximum * (trackHeight - thumbHeight) : 0) + 'px'
    });
    $seatThumb.attr('aria-valuemax', String(maximum));
    $seatThumb.attr('aria-valuenow', String(Math.round(seatSelect.scrollTop)));
}

function scrollSeats(distance) {
    seatSelect.scrollTop += distance;
    updateSeatScrollbar();
}

$seatScrollbar.find('.seat-scroll-up').on('click', function () { scrollSeats(-23); });
$seatScrollbar.find('.seat-scroll-down').on('click', function () { scrollSeats(23); });
$seatSelect.on('scroll', updateSeatScrollbar);
// Giữ addEventListener gốc cho wheel vì cần { passive: false } để preventDefault hoạt động,
// và jQuery không chép deltaMode/deltaY sang đối tượng sự kiện của nó.
$seatScrollbar[0].addEventListener('wheel', function (event) {
    event.preventDefault();
    const distance = event.deltaMode === 1 ? event.deltaY * 23
        : event.deltaMode === 2 ? event.deltaY * seatSelect.clientHeight : event.deltaY;
    scrollSeats(distance);
}, { passive: false });

let seatDrag = null;
$seatThumb.on('pointerdown', function (event) {
    if (event.button !== 0) return;
    event.preventDefault();
    $seatThumb[0].focus({ preventScroll: true });
    seatDrag = { startY: event.clientY, startScroll: seatSelect.scrollTop };
    $seatThumb[0].setPointerCapture(event.originalEvent.pointerId);
});
$seatThumb.on('pointermove', function (event) {
    if (!seatDrag) return;
    const travel = $seatTrack[0].clientHeight - $seatThumb[0].getBoundingClientRect().height;
    const maximum = seatSelect.scrollHeight - seatSelect.clientHeight;
    seatSelect.scrollTop = seatDrag.startScroll + (travel > 0 ? (event.clientY - seatDrag.startY) / travel * maximum : 0);
    updateSeatScrollbar();
});
$seatThumb.on('lostpointercapture', function () { seatDrag = null; });
$seatThumb.on('pointerup', function (event) { seatDrag = null; $seatThumb[0].releasePointerCapture(event.originalEvent.pointerId); });
$seatThumb.on('pointercancel', function () { seatDrag = null; });
$seatTrack.on('pointerdown', function (event) {
    if (event.target === $seatThumb[0]) return;
    scrollSeats(event.clientY < $seatThumb[0].getBoundingClientRect().top ? -seatSelect.clientHeight : seatSelect.clientHeight);
});
$seatThumb.on('keydown', function (event) {
    const distances = { ArrowUp: -23, ArrowDown: 23, PageUp: -seatSelect.clientHeight, PageDown: seatSelect.clientHeight, Home: -seatSelect.scrollHeight, End: seatSelect.scrollHeight };
    if (Object.hasOwn(distances, event.key)) { event.preventDefault(); scrollSeats(distances[event.key]); }
});
new ResizeObserver(updateSeatScrollbar).observe($seatWrapper[0]);
updateSeatScrollbar();

$('#ticket-form').on('submit', function (event) {
    event.preventDefault();
    const $showtime = $('#showtime');
    const $room = $('#room');
    const seats = [...$('#seats')[0].selectedOptions];
    // Đơn giá một ghế = giá của suất chiếu nhân hệ số phòng.
    const ticketPrice = Number($showtime.val()) * Number($room.val());
    const rows = seats.map(function (seat) {
        return `<tr><td>${escapeHTML(seat.text)}</td><td>${money(ticketPrice)}</td></tr>`;
    }).join('');
    openResult('Thông tin vé', `<table class="ticket-info"><tbody><tr><td>Khách hàng</td><td>${escapeHTML($('#customer').val())}</td></tr><tr><td>Ngày chiếu</td><td>${displayDate($('#show-date').val())}</td></tr><tr><td>Phim</td><td>${escapeHTML($('#movie').val())}</td></tr><tr><td>Suất chiếu</td><td>${escapeHTML($showtime[0].selectedOptions[0].text)}</td></tr><tr><td>Phòng chiếu</td><td>${escapeHTML($room[0].selectedOptions[0].text)}</td></tr></tbody></table><table class="ticket-seats"><thead><tr><th>Ghế</th><th>Giá Vé</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><th>Tổng tiền</th><th>${money(ticketPrice * seats.length)}</th></tr></tfoot></table>`);
});
