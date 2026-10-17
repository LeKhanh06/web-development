// Yêu cầu: nạp jQuery (ví dụ jquery-3.7.1.min.js) trước file này trong HTML.

// Các bài dùng chung cách định dạng tiền để không phải viết lại cùng một hàm.
function money(amount) {
  return (
    new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(
      amount,
    ) + " đ"
  );
}

// Số tiền không kèm chữ đ, dùng cho các dòng trong bảng như mẫu.
function moneyNumber(amount) {
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(
    amount,
  );
}

// Chuyển ký tự đặc biệt thành văn bản an toàn trước khi đưa dữ liệu vào innerHTML.
// Ví dụ tên khách có dấu < sẽ được hiển thị đúng, không bị hiểu là thẻ HTML.
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[character];
  });
}

function systemDate() {
  // Định dạng như mẫu: "Thứ 2, 05/08/2020, 13:00" (Chủ nhật hiển thị "Chủ nhật").
  const now = new Date();
  const pad = function (number) {
    return String(number).padStart(2, "0");
  };
  const weekday = now.getDay() === 0 ? "Chủ nhật" : "Thứ " + (now.getDay() + 1);

  return (
    weekday +
    ", " +
    pad(now.getDate()) +
    "/" +
    pad(now.getMonth() + 1) +
    "/" +
    now.getFullYear() +
    ", " +
    pad(now.getHours()) +
    ":" +
    pad(now.getMinutes())
  );
}

function displayDate(dateValue) {
  // Tách chuỗi yyyy-mm-dd để tránh ngày bị lệch khi chuyển múi giờ.
  return dateValue.split("-").reverse().join("/");
}

// Mở trang kết quả ngay trong sự kiện bấm nút để trình duyệt cho phép mở tab.
// Những dữ liệu người dùng nhập phải đi qua escapeHTML trước khi truyền vào đây.
function openResult(title, content) {
  const resultWindow = window.open("", "_blank");

  if (!resultWindow) {
    alert("Hãy cho phép cửa sổ bật lên (pop-up) rồi bấm lại để xem kết quả.");
    return;
  }

  // Sao chép CSS đã nhúng sang tab kết quả, không phụ thuộc file CSS bên ngoài.
  const resultStyles = ["common-style", "result-style", "exercise-style"]
    .map(function (id) {
      const $style = $("#" + id);
      return $style.length ? "<style>" + $style.text() + "</style>" : "";
    })
    .join("");

  const isRestaurantInvoice = title === "Hóa đơn";
  const pageClass =
    title === "CV cá nhân"
      ? "result-page cv-result"
      : isRestaurantInvoice
        ? "result-page restaurant-invoice"
        : "result-page";

  const printButton =
    '<button class="print-button" onclick="window.print()">In trang này</button>';

  resultWindow.document.write(
    `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHTML(title)}</title>${resultStyles}</head><body class="${pageClass}"><main><h1>${escapeHTML(title)}</h1>${content}${isRestaurantInvoice ? "" : printButton}</main></body></html>`,
  );
  resultWindow.document.close();
}

$("#tour-form").on("submit", function (event) {
  event.preventDefault();

  const adults = Number($("#adults").val());
  const children = Number($("#children").val());

  if (adults + children === 0) {
    alert("Đoàn phải có ít nhất một khách.");
    return;
  }

  const $tour = $("#tour");
  const adultPrice = Number($tour.val());

  // Trẻ em tính nửa giá; tính riêng hai nhóm rồi cộng lại để ra tổng đoàn.
  const childPrice = adultPrice / 2;
  const adultTotal = adults * adultPrice;
  const childTotal = children * childPrice;

  openResult(
    "Thông tin đăng ký",
    `
        <div class="result-box">
            <h2 class="info-title">Thông tin đăng ký</h2>

            <div class="info-row">
                <span>Ngày đăng ký:</span>
                <span>${systemDate()}</span>
            </div>

            <div class="info-row">
                <span>Nhân Viên</span>
                <span>Nguyễn Văn A</span>
            </div>

            <div class="info-row">
                <span>Họ tên khách</span>
                <span>${escapeHTML($("#tour-name").val())}</span>
            </div>

            <div class="info-row">
                <span>Địa chỉ</span>
                <span>${escapeHTML($("#address").val())}</span>
            </div>

            <div class="info-row">
                <span>Tour</span>
                <span>${escapeHTML($tour[0].selectedOptions[0].text)}</span>
            </div>

            <div class="info-row">
                <span>Ghi chú</span>
                <span>${escapeHTML($("#notes").val())}</span>
            </div>

            <h2 class="group-title">Số lượng khách đoàn</h2>

            <table>
                <tr>
                    <th></th>
                    <th>SL</th>
                    <th>Đơn giá</th>
                    <th>Thành Tiền</th>
                </tr>

                <tr>
                    <td>Người lớn</td>
                    <td>${adults}</td>
                    <td>${moneyNumber(adultPrice)}</td>
                    <td>${moneyNumber(adultTotal)}</td>
                </tr>

                <tr>
                    <td>Trẻ em</td>
                    <td>${children}</td>
                    <td>${moneyNumber(childPrice)}</td>
                    <td>${moneyNumber(childTotal)}</td>
                </tr>

                <tr>
                    <th colspan="2" class="total-label">Tổng tiền</th>
                    <th colspan="2" class="total-amount">${money(adultTotal + childTotal)}</th>
                </tr>
            </table>
        </div>
    `,
  );
});
