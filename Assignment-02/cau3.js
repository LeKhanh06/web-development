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

const dishes = [
    { name: 'Bún bò', price: 20000 }, { name: 'Hủ tiếu', price: 18000 },
    { name: 'Bánh canh', price: 17000 }, { name: 'Phở bò', price: 19000 },
    { name: 'Nuôi', price: 15000 }, { name: 'Bánh mì thịt', price: 12000 },
    { name: 'Bánh cuốn', price: 15000 }
];
// Mỗi phần tử lưu riêng giỏ món của một bàn, tránh cộng nhầm giữa các bàn.
const orders = [{}, {}, {}];
const $dishSelect = $('#dish');
dishes.forEach(function (dish, index) {
    $dishSelect.append(new Option(dish.name, index));
});
function updateClock() {
    const now = new Date();
    const weekday = now.getDay() === 0 ? 'Chủ nhật' : 'Thứ ' + (now.getDay() + 1);
    $('#clock').text(`${weekday}, ${now.toLocaleDateString('vi-VN')}, ${now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}`);
}
updateClock();
setInterval(updateClock, 1000);

function renderTables() {
    $('#tables').html(orders.map(function (order, tableIndex) {
        let total = 0;
        const rows = Object.keys(order).map(function (dishIndex) {
            const dish = dishes[dishIndex];
            const quantity = order[dishIndex];
            const amount = quantity * dish.price;
            total += amount;
            // readonly vì số lượng được tăng bằng dropdown, tiền được tính tự động.
            return `<tr><td>${dish.name}</td><td><input type="text" readonly aria-label="Số lượng ${dish.name}" value="${quantity}"></td><td><input type="text" readonly aria-label="Tiền ${dish.name}" value="${money(amount)}"></td><td><button type="button" data-table="${tableIndex}" data-dish="${dishIndex}">Xóa</button></td></tr>`;
        }).join('');
        return `<article><h2>Bàn ${tableIndex + 1}</h2><table><colgroup><col class="order-dish-column"><col class="order-quantity-column"><col class="order-amount-column"><col class="order-delete-column"></colgroup><thead><tr><th>Món</th><th>SL</th><th>Tiền</th><th aria-label="Thao tác"></th></tr></thead><tbody>${rows || '<tr><td colspan="4">Chưa có món</td></tr>'}</tbody><tfoot><tr><th>Tổng tiền</th><td colspan="3">${money(total)}</td></tr></tfoot></table><button type="button" data-print="${tableIndex}">In hóa đơn</button></article>`;
    }).join(''));
}
// prop('value') cho đúng giá trị '' như select.value, không bị trả về null như val() khi không có option nào được chọn.
$dishSelect.on('change', function () {
    if ($dishSelect.prop('value') === '') return;
    const order = orders[Number($('#table-number').val())];
    const dishIndex = $dishSelect.prop('value');
    order[dishIndex] = (order[dishIndex] || 0) + 1;
    renderTables();
    // Trả về lựa chọn trống để chọn lại cùng một món vẫn phát sinh change.
    $dishSelect.prop('value', '');
});
// Đặt sự kiện ủy quyền trên phần tử cha vì các nút con được tạo lại sau mỗi lần render.
// Dùng attr('data-...') thay vì data() để giữ nguyên chuỗi, không bị jQuery tự đổi '0' thành số 0.
$('#tables').on('click', 'button', function () {
    const $button = $(this);
    if ($button.attr('data-dish') !== undefined) {
        delete orders[Number($button.attr('data-table'))][$button.attr('data-dish')];
        renderTables();
    } else if ($button.attr('data-print') !== undefined) {
        const tableIndex = Number($button.attr('data-print'));
        const order = orders[tableIndex];
        if (Object.keys(order).length === 0) { alert('Bàn chưa có món để in.'); return; }
        let total = 0;
        const rows = Object.keys(order).map(function (dishIndex) {
            const amount = dishes[dishIndex].price * order[dishIndex];
            total += amount;
            return `<tr><td>${dishes[dishIndex].name}</td><td>${order[dishIndex]}</td><td>${new Intl.NumberFormat('vi-VN').format(amount)}</td></tr>`;
        }).join('');
        const now = new Date();
        const weekday = now.getDay() === 0 ? 'Chủ nhật' : 'Thứ ' + (now.getDay() + 1);
        const invoiceDate = `${weekday}, ${now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}, ${now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
        openResult('Hóa đơn', `<table class="invoice-details"><tbody><tr><td>Ngày hóa đơn:</td><td>${invoiceDate}</td></tr><tr><td>Nhân viên</td><td>Nguyễn Văn A</td></tr><tr><td>Bàn</td><td>Số ${tableIndex + 1}</td></tr></tbody></table><table class="invoice-items"><colgroup><col class="invoice-dish-column"><col class="invoice-quantity-column"><col class="invoice-amount-column"></colgroup><thead><tr><th>Món</th><th>SL</th><th>Thành Tiền</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><th>Tổng tiền</th><td colspan="2">${money(total)}</td></tr></tfoot></table>`);
    }
});
renderTables();

// Select gốc vẫn lưu giá trị và phát change như trước; dropdown chỉ thay phần hiển thị.
function createOrderDropdown(selectId) {
    const $select = $('#' + selectId);
    const options = [...$select[0].options].filter(function (option) { return !option.hidden; });
    const $wrapper = $('<div>', { 'class': 'order-dropdown' + (selectId === 'dish' ? ' dish-dropdown' : '') });
    const $control = $('<button>', {
        type: 'button', 'class': 'order-combobox', id: selectId + '-control', role: 'combobox',
        'aria-haspopup': 'listbox', 'aria-expanded': 'false'
    });
    const $label = $('label[for="' + selectId + '"]');
    $label.attr('for', $control.attr('id'));
    $label.attr('id', selectId + '-label');
    $control.attr('aria-labelledby', $label.attr('id'));
    const $caption = $('<span>');
    // Hiển thị món đầu thay cho lời nhắc; chưa thêm món cho đến khi người dùng chọn.
    $caption.text(selectId === 'dish' && $select.prop('value') === ''
        ? options[0].text : $select[0].selectedOptions[0].text);
    $control.append($caption);
    const $list = $('<div>', { 'class': 'order-options', id: selectId + '-options', role: 'listbox' });
    $list.attr('aria-labelledby', $label.attr('id'));
    $list.prop('hidden', true);
    $control.attr('aria-controls', $list.attr('id'));
    let selectedIndex = options.findIndex(function (option) { return option.selected; });
    let activeIndex = Math.max(0, selectedIndex);

    function highlight() {
        $list.children().each(function (index) {
            $(this).toggleClass('is-active', index === activeIndex);
            $(this).attr('aria-selected', String(index === selectedIndex));
        });
        if (!$list.prop('hidden')) $control.attr('aria-activedescendant', $list.children().eq(activeIndex).attr('id'));
    }

    function close() {
        $list.prop('hidden', true);
        $control.attr('aria-expanded', 'false');
        $control.removeAttr('aria-activedescendant');
    }

    function open() {
        activeIndex = Math.max(0, selectedIndex);
        $list.prop('hidden', false);
        $control.attr('aria-expanded', 'true');
        highlight();
    }

    function choose(index) {
        selectedIndex = index;
        $caption.text(options[index].text);
        $select.prop('value', options[index].value);
        // Gọi cùng xử lý chọn bàn/món hiện có, kể cả chọn lại cùng một món.
        $select.trigger('change');
        highlight();
        close();
        $control[0].focus({ preventScroll: true });
    }

    options.forEach(function (option, index) {
        const $item = $('<div>', { 'class': 'order-option', id: selectId + '-option-' + index, role: 'option' });
        $item.text(option.text);
        $item.on('pointermove', function () { activeIndex = index; highlight(); });
        $item.on('click', function () { choose(index); });
        $list.append($item);
    });
    highlight();
    $control.on('click', function () { if ($list.prop('hidden')) open(); else close(); });
    $control.on('keydown', function (event) {
        if (event.key === 'Escape' || event.key === 'Tab') {
            if (event.key === 'Escape') event.preventDefault();
            close();
        } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
            event.preventDefault();
            if ($list.prop('hidden')) open();
            else if (event.key === 'ArrowDown') activeIndex = Math.min(activeIndex + 1, options.length - 1);
            else if (event.key === 'ArrowUp') activeIndex = Math.max(activeIndex - 1, 0);
            if (event.key === 'Home') activeIndex = 0;
            if (event.key === 'End') activeIndex = options.length - 1;
            highlight();
        } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if ($list.prop('hidden')) open(); else choose(activeIndex);
        } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            const index = options.findIndex(function (option) {
                return option.text.toLocaleLowerCase('vi-VN').startsWith(event.key.toLocaleLowerCase('vi-VN'));
            });
            if (index >= 0) { event.preventDefault(); if ($list.prop('hidden')) open(); activeIndex = index; highlight(); }
        }
    });
    // Bấm dropdown bên cạnh vẫn giữ danh sách này mở; chỉ đóng khi bấm ngoài nhóm.
    $(document).on('click', function (event) {
        if (!$(event.target).closest('.order-dropdown').length) close();
    });
    $wrapper.append($control, $list);
    $select.after($wrapper);
    $select.prop('hidden', true);
}

createOrderDropdown('table-number');
createOrderDropdown('dish');
