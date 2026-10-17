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
    const printButton = '<button class="print-button" onclick="window.print()">In trang này</button>';
    resultWindow.document.write(`<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHTML(title)}</title>${resultStyles}</head><body class="${pageClass}"><main><h1>${escapeHTML(title)}</h1>${content}${isRestaurantInvoice ? '' : printButton}</main></body></html>`);
    resultWindow.document.close();
}

function calculateSalary() {
    // val() trả về chuỗi; Number chuyển sang số để thực hiện phép tính.
    const salary = Number($('#salary').val());
    const coefficient = Number($('#coefficient').val());
    // Hiển thị số liền nhau, không thêm dấu phân cách hoặc đơn vị, đúng mẫu đề.
    $('#salary-result').text(String(salary * coefficient));
}

$('#salary-form').on('submit', function (event) {
    // Ngăn tải lại trang để kết quả vẫn hiển thị ngay dưới form.
    event.preventDefault();
    calculateSalary();
});

// Tính từ dữ liệu mặc định để lúc mở trang đã có kết quả 3200000 như hình mẫu.
calculateSalary();

// stepUp/stepDown tôn trọng bước 0.1 và giới hạn min, không tự cộng số thập phân.
// stepUp/stepDown là phương thức của phần tử DOM gốc nên lấy bằng [0].
$('#coefficient-up').on('click', function () {
    $('#coefficient')[0].stepUp();
});
$('#coefficient-down').on('click', function () {
    $('#coefficient')[0].stepDown();
});
