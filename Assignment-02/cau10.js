// Yêu cầu: nạp jQuery (ví dụ jquery-3.7.1.min.js) trước file này trong HTML.
const $tasks = $('#tasks');
function updateEmptyMessage() {
    $('#empty-message').prop('hidden', $tasks.children().length > 0);
}
$('#todo-form').on('submit', function (event) {
    event.preventDefault();
    const $input = $('#new-task');
    const text = $input.val().trim();
    if (!text) return;
    const $item = $('<li>');
    const $checkbox = $('<input>', { type: 'checkbox', 'aria-label': 'Hoàn thành: ' + text });
    // text() hiển thị nguyên văn, nên nhập ký tự HTML cũng không chạy mã.
    const $label = $('<span>').text(text);
    const $removeButton = $('<button>', { type: 'button', 'aria-label': 'Xóa: ' + text }).text('×');
    $checkbox.on('change', function () {
        $item.toggleClass('done', $checkbox.prop('checked'));
    });
    $label.on('click', function () {
        $checkbox.prop('checked', !$checkbox.prop('checked'));
        $item.toggleClass('done', $checkbox.prop('checked'));
    });
    $removeButton.on('click', function () {
        $item.remove();
        updateEmptyMessage();
    });
    $item.append($checkbox, $label, $removeButton);
    $tasks.append($item);
    $input.val('');
    $input.trigger('focus');
    updateEmptyMessage();
});
