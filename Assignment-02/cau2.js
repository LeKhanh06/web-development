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

// Giữ select làm nguồn dữ liệu cho phần tính tiền, chỉ thay giao diện hiển thị.
function createMenuListbox(selectId) {
    const $select = $('#' + selectId);
    const options = [...$select[0].options];
    const $listbox = $('<div>', { 'class': 'menu-listbox', role: 'listbox', 'aria-multiselectable': 'true' });
    const $label = $('label[for="' + selectId + '"]');
    $label.attr('id', selectId + '-label');
    $listbox.attr('aria-labelledby', $label.attr('id'));

    const items = options.map(function (option, index) {
        const $item = $('<div>', { 'class': 'menu-list-option', role: 'option' });
        $item.prop('tabIndex', index === 0 ? 0 : -1);
        $item.text(option.text);
        $item.attr('aria-selected', String(option.selected));
        $listbox.append($item);
        return $item;
    });

    function focusItem(index) {
        items.forEach(function ($item, itemIndex) {
            $item.prop('tabIndex', itemIndex === index ? 0 : -1);
        });
        // preventScroll chỉ có ở focus() gốc nên gọi trên phần tử DOM.
        items[index][0].focus({ preventScroll: true });
    }

    function toggleItem(index) {
        options[index].selected = !options[index].selected;
        // change đồng bộ trạng thái xám với dữ liệu selectedOptions đang có.
        $select.trigger('change');
    }

    $select.on('change', function () {
        items.forEach(function ($item, index) {
            $item.attr('aria-selected', String(options[index].selected));
        });
    });

    items.forEach(function ($item, index) {
        $item.on('click', function () {
            focusItem(index);
            toggleItem(index);
        });
        $item.on('keydown', function (event) {
            if (event.key === ' ' || event.key === 'Enter') {
                event.preventDefault();
                toggleItem(index);
            } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
                event.preventDefault();
                let nextIndex = index;
                if (event.key === 'ArrowDown') nextIndex = Math.min(index + 1, items.length - 1);
                if (event.key === 'ArrowUp') nextIndex = Math.max(index - 1, 0);
                if (event.key === 'Home') nextIndex = 0;
                if (event.key === 'End') nextIndex = items.length - 1;
                focusItem(nextIndex);
            } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
                event.preventDefault();
                options.forEach(function (option) { option.selected = true; });
                $select.trigger('change');
            }
        });
    });

    $label.on('click', function (event) {
        event.preventDefault();
        focusItem(items.findIndex(function ($item) { return $item.prop('tabIndex') === 0; }));
    });
    $select.after($listbox);
    $select.prop('hidden', true);
}

createMenuListbox('foods');
createMenuListbox('drinks');

$('#menu-form').on('submit', function (event) {
    event.preventDefault();
    // selectedOptions chỉ chứa các món đang được chọn trong select multiple.
    const selected = [...$('#foods')[0].selectedOptions, ...$('#drinks')[0].selectedOptions];
    if (selected.length === 0) {
        $('#bill').text('Vui lòng chọn ít nhất một món.');
        return;
    }
    let subtotal = 0;
    let rows = '';
    selected.forEach(function (option) {
        subtotal += Number(option.value);
        rows += `<tr><td>${escapeHTML(option.text)}</td><td>${Number(option.value)}</td></tr>`;
    });
    // Chỉ cộng phụ thu một lần trên tổng tiền các món khi đặt ban đêm.
    const isNight = $('input[name="time"]:checked').val() === 'night';
    const surcharge = isNight ? subtotal * 0.1 : 0;
    // Chỉ tạo dòng phụ thu khi thực sự có tiền phụ thu.
    const surchargeRow = surcharge > 0
        ? `<tr><td>Phụ thu ban đêm (10%)</td><td>${surcharge}</td></tr>` : '';
    $('#bill').html(`<table class="form-table"><tr><th>Các món đã dùng</th><th>Tiền</th></tr>${rows}${surchargeRow}<tr><th>Tổng tiền</th><th>${subtotal + surcharge} đồng</th></tr></table>`);
});
