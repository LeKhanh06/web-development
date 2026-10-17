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

const $cartItems = $('#cart-items');
function updateCart() {
    let total = 0;
    let hasError = false;
    $cartItems.find('tr').each(function () {
        const $row = $(this);
        const $quantityInput = $row.find('.quantity');
        const $priceInput = $row.find('.price');
        const quantity = Number($quantityInput.val());
        const price = Number($priceInput.val());
        const valid = $quantityInput.val().trim() !== '' && $priceInput.val().trim() !== ''
            && Number.isInteger(quantity) && quantity >= 0 && Number.isFinite(price) && price >= 0;
        // Không cộng dữ liệu sai vào tổng, đồng thời báo để người dùng sửa ô nhập.
        // Hiển thị số liền nhau, không thêm dấu phân cách hoặc đơn vị, đúng mẫu đề.
        $row.find('.amount').text(valid ? String(quantity * price) : 'Không hợp lệ');
        if (valid) total += quantity * price;
        else hasError = true;
    });
    $('#cart-total').text(hasError ? 'Vui lòng sửa dữ liệu' : String(total));
    $('#cart-error').text(hasError ? 'Số lượng phải là số nguyên không âm; đơn giá phải là số không âm.' : '');
}
// input chạy ngay khi gõ hoặc tăng giảm, không cần chờ rời khỏi ô.
$cartItems.on('input', updateCart);
// Ủy quyền cho nút xóa nên dòng thêm sau này vẫn hoạt động.
$cartItems.on('click', 'button', function () {
    $(this).closest('tr').remove();
    updateCart();
});
updateCart();
