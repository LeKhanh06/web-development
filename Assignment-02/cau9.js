// Yêu cầu: nạp jQuery (ví dụ jquery-3.7.1.min.js) trước file này trong HTML.
const $track = $('#track');
const imageNames = Array.from({ length: 10 }, function (_, index) {
    return 'hoa-' + String(index + 1).padStart(2, '0') + '.jpg';
});
// Thêm 5 ảnh cuối ở đầu và 5 ảnh đầu ở cuối để trượt liên tục cả hai chiều.
const extendedImages = [...imageNames.slice(-5), ...imageNames, ...imageNames.slice(0, 5)];
extendedImages.forEach(function (name) {
    const $slide = $('<div>', { 'class': 'slide' });
    const $image = $('<img>', { alt: name });
    // one() chạy đúng một lần, tương đương { once: true }.
    $image.one('error', function () {
        // Ảnh dự phòng được tạo bằng SVG có chữ, không cần tải từ Internet.
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150"><rect width="200" height="150" fill="#ffedca"/><text x="100" y="78" text-anchor="middle" font-family="Arial" font-size="18">${name}</text></svg>`;
        $image.attr('src', 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
    });
    $image.attr('src', 'picture/' + name);
    $slide.append($image);
    $track.append($slide);
});
let current = 5;
let moving = false;
let paused = false;
function updatePosition(animate) {
    // Mỗi ảnh rộng 20% khung nhìn, nên mỗi lần chỉ dịch đúng một ảnh.
    $track.css({
        transition: animate ? 'transform .4s ease' : 'none',
        transform: `translateX(-${current * 20}%)`
    });
}
function move(direction) {
    if (moving) return;
    moving = true;
    current += direction;
    updatePosition(true);
}
$track.on('transitionend', function (event) {
    // propertyName không nằm trong đối tượng sự kiện của jQuery nên lấy từ originalEvent.
    if (event.originalEvent.propertyName !== 'transform') return;
    if (current >= 15) current -= 10;
    if (current < 5) current += 10;
    // Chuyển từ ảnh bản sao về ảnh thật không có hiệu ứng để không thấy giật ngược.
    updatePosition(false);
    moving = false;
});
$('#previous').on('click', function () { move(-1); });
$('#next').on('click', function () { move(1); });
$('#toggle-slide').on('click', function () {
    paused = !paused;
    $(this).text(paused ? 'Tiếp tục' : 'Tạm dừng');
});
setInterval(function () { if (!paused && !document.hidden) move(1); }, 3000);
updatePosition(false);
