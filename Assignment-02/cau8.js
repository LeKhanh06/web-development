// Yêu cầu: nạp jQuery (ví dụ jquery-3.7.1.min.js) trước file này trong HTML.
const $expressionInput = $('#expression');
const $answer = $('#answer');
let expression = '';
let justCalculated = false;

function calculate(source) {
    // Tách thành số và phép toán; không dùng eval để thực thi chuỗi người dùng.
    const tokens = source.match(/(?:\d+(?:\.\d*)?|\.\d+)|[+*/-]/g);
    if (!tokens || tokens.join('') !== source) throw new Error('Phép tính không hợp lệ');
    let position = 0;
    function readNumber() {
        let sign = 1;
        if (tokens[position] === '-') { sign = -1; position += 1; }
        else if (tokens[position] === '+') { position += 1; }
        const token = tokens[position];
        if (token === undefined || !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(token)) {
            throw new Error('Phép tính chưa đầy đủ');
        }
        position += 1;
        return sign * Number(token);
    }
    function readProduct() {
        let value = readNumber();
        // Nhân chia được xử lý trước, nên 2+3*4 cho ra 14.
        while (tokens[position] === '*' || tokens[position] === '/') {
            const operator = tokens[position++];
            const next = readNumber();
            if (operator === '/' && next === 0) throw new Error('Không thể chia cho 0');
            value = operator === '*' ? value * next : value / next;
        }
        return value;
    }
    let result = readProduct();
    while (position < tokens.length) {
        const operator = tokens[position++];
        if (operator !== '+' && operator !== '-') throw new Error('Phép tính không hợp lệ');
        const next = readProduct();
        result = operator === '+' ? result + next : result - next;
    }
    if (!Number.isFinite(result)) throw new Error('Kết quả vượt giới hạn');
    return Number(result.toPrecision(12));
}

function pressKey(key) {
    if (key === 'CE') {
        expression = '';
        $answer.text('0');
        justCalculated = false;
    } else if (key === 'Del') {
        expression = expression.slice(0, -1);
        justCalculated = false;
        $answer.text('0');
    } else if (key === '=') {
        try { $answer.text(String(calculate(expression))); justCalculated = true; }
        catch (error) { $answer.text(error.message); }
    } else {
        if (justCalculated) {
            // Gõ số bắt đầu phép tính mới; gõ toán tử dùng tiếp kết quả trước.
            expression = /^[+*/-]$/.test(key) ? $answer.text() : '';
            justCalculated = false;
        }
        if (key === '.') {
            const currentNumber = expression.split(/[+*/-]/).pop();
            if (currentNumber.includes('.')) return;
            if (currentNumber === '') expression += '0';
        }
        expression += key;
    }
    $expressionInput.val(expression);
}
$('.keys').first().on('click', 'button', function () {
    pressKey($(this).attr('data-key'));
});
$(document).on('keydown', function (event) {
    let key = event.key;
    if (key === 'Enter') key = '=';
    if (key === 'Backspace') key = 'Del';
    if (key === 'Escape') key = 'CE';
    if (/^[0-9.+*/=-]$/.test(key) || key === 'Del' || key === 'CE') {
        event.preventDefault();
        pressKey(key);
    }
});
