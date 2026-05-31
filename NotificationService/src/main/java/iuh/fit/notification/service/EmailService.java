package iuh.fit.notification.service;

import iuh.fit.notification.dto.OrderResponse;
import iuh.fit.notification.dto.OrderItemResponse;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import java.text.NumberFormat;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOrderPlacedEmail(String toEmail, OrderResponse order) {
        String subject = "Xác nhận đặt hàng thành công - Đơn hàng #" + order.getId();
        String htmlContent = buildOrderEmailHtml(order, "Đặt hàng thành công", "Cảm ơn bạn đã mua sắm tại Shop Sport. Đơn hàng của bạn đã được ghi nhận và đang được chuẩn bị!");
        sendEmail(toEmail, subject, htmlContent);
    }

    public void sendOrderDeliveredEmail(String toEmail, OrderResponse order) {
        String subject = "Đơn hàng #" + order.getId() + " đã giao thành công!";
        String htmlContent = buildOrderEmailHtml(order, "Giao hàng thành công", "Tin vui! Đơn hàng của bạn đã được đối tác vận chuyển giao thành công. Hy vọng bạn hài lòng với sản phẩm!");
        sendEmail(toEmail, subject, htmlContent);
    }

    private void sendEmail(String to, String subject, String content) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);
            mailSender.send(message);
            System.out.println("Email sent successfully to: " + to);
        } catch (Exception e) {
            System.err.println("Failed to send email via SMTP: " + e.getMessage());
            System.out.println("=========================================================================");
            System.out.println("   [MOCK EMAIL LOG] - SMTP not configured or failed to connect");
            System.out.println("   To:      " + to);
            System.out.println("   Subject: " + subject);
            System.out.println("   Body Preview:");
            System.out.println("-------------------------------------------------------------------------");
            // Print stripped HTML or just a readable version for logs
            System.out.println(content.replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim());
            System.out.println("-------------------------------------------------------------------------");
            System.out.println("   [END OF MOCK EMAIL LOG]");
            System.out.println("=========================================================================");
        }
    }

    private String buildOrderEmailHtml(OrderResponse order, String title, String description) {
        NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
        String formattedTotal = currencyFormat.format(order.getTotalAmount());

        double subtotal = 0;
        if (order.getItems() != null) {
            for (OrderItemResponse item : order.getItems()) {
                subtotal += item.getPrice() * item.getQuantity();
            }
        }
        double shipping = subtotal >= 500000 ? 0 : 30000;
        String formattedSubtotal = currencyFormat.format(subtotal);
        String formattedShipping = shipping == 0 ? "Miễn phí" : currencyFormat.format(shipping);

        StringBuilder itemsTableRows = new StringBuilder();
        if (order.getItems() != null) {
            for (OrderItemResponse item : order.getItems()) {
                String priceStr = currencyFormat.format(item.getPrice());
                String subtotalStr = currencyFormat.format(item.getPrice() * item.getQuantity());
                itemsTableRows.append(String.format(
                    "<tr>" +
                    "  <td style='padding: 12px; border-bottom: 1px solid #edf2f7; font-weight: bold;'>%s (Size: %s)</td>" +
                    "  <td style='padding: 12px; border-bottom: 1px solid #edf2f7; text-align: center;'>%d</td>" +
                    "  <td style='padding: 12px; border-bottom: 1px solid #edf2f7; text-align: right;'>%s</td>" +
                    "  <td style='padding: 12px; border-bottom: 1px solid #edf2f7; text-align: right; font-weight: bold;'>%s</td>" +
                    "</tr>",
                    item.getName(),
                    item.getSize() != null ? item.getSize() : "N/A",
                    item.getQuantity(),
                    priceStr,
                    subtotalStr
                ));
            }
        }

        return "<!DOCTYPE html>" +
               "<html>" +
               "<head>" +
               "  <meta charset='utf-8'>" +
               "  <title>" + title + "</title>" +
               "</head>" +
               "<body style='font-family: \"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif; background-color: #f7fafc; margin: 0; padding: 20px; color: #2d3748;'>" +
               "  <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;'>" +
               "    " +
               "    <!-- Header -->" +
               "    <div style='background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center; color: #ffffff;'>" +
               "      <h1 style='margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase;'>SHOP SPORT</h1>" +
               "      <p style='margin: 5px 0 0 0; font-size: 14px; font-weight: 600; opacity: 0.85;'>DỊCH VỤ THÔNG BÁO ĐƠN HÀNG</p>" +
               "    </div>" +
               "    " +
               "    <!-- Main Body -->" +
               "    <div style='padding: 30px;'>" +
               "      <h2 style='margin-top: 0; font-size: 20px; font-weight: 700; color: #1a202c;'>" + title + "!</h2>" +
               "      <p style='font-size: 15px; line-height: 1.6; color: #4a5568; margin-bottom: 25px;'>" + description + "</p>" +
               "      " +
               "      <!-- Info Card -->" +
               "      <div style='background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #edf2f7; margin-bottom: 25px;'>" +
               "        <h3 style='margin-top: 0; margin-bottom: 15px; font-size: 16px; font-weight: 700; text-transform: uppercase; color: #2b6cb0; border-bottom: 2px solid #ebf8ff; padding-bottom: 5px;'>Thông tin giao hàng</h3>" +
               "        <table style='width: 100%; border-collapse: collapse; font-size: 14px;'>" +
               "          <tr>" +
               "            <td style='padding: 6px 0; color: #718096; font-weight: 600; width: 120px;'>Mã đơn hàng:</td>" +
               "            <td style='padding: 6px 0; color: #2d3748; font-weight: 700;'>#" + order.getId() + "</td>" +
               "          </tr>" +
               "          <tr>" +
               "            <td style='padding: 6px 0; color: #718096; font-weight: 600;'>Người nhận:</td>" +
               "            <td style='padding: 6px 0; color: #2d3748; font-weight: 700;'>" + order.getUsername() + "</td>" +
               "          </tr>" +
               "          <tr>" +
               "            <td style='padding: 6px 0; color: #718096; font-weight: 600;'>Số điện thoại:</td>" +
               "            <td style='padding: 6px 0; color: #2d3748; font-weight: 700;'>" + order.getPhone() + "</td>" +
               "          </tr>" +
               "          <tr>" +
               "            <td style='padding: 6px 0; color: #718096; font-weight: 600;'>Địa chỉ nhận:</td>" +
               "            <td style='padding: 6px 0; color: #2d3748; font-weight: 700;'>" + order.getAddress() + "</td>" +
               "          </tr>" +
               "          <tr>" +
               "            <td style='padding: 6px 0; color: #718096; font-weight: 600;'>Trạng thái:</td>" +
               "            <td style='padding: 6px 0; color: #d69e2e; font-weight: 800; text-transform: uppercase;'>" + order.getStatus() + "</td>" +
               "          </tr>" +
               "        </table>" +
               "      </div>" +
               "      " +
               "      <!-- Items Table -->" +
               "      <h3 style='font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #1a202c;'>Chi tiết sản phẩm</h3>" +
               "      <table style='width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 25px;'>" +
               "        <thead>" +
               "          <tr style='background-color: #edf2f7; color: #4a5568; font-weight: 700;'>" +
               "            <th style='padding: 12px; text-align: left;'>Sản phẩm</th>" +
               "            <th style='padding: 12px; text-align: center; width: 60px;'>SL</th>" +
               "            <th style='padding: 12px; text-align: right; width: 100px;'>Đơn giá</th>" +
               "            <th style='padding: 12px; text-align: right; width: 110px;'>Thành tiền</th>" +
               "          </tr>" +
               "        </thead>" +
               "        <tbody>" +
                        itemsTableRows.toString() +
               "        </tbody>" +
               "      </table>" +
               "      " +
               "      <!-- Totals -->" +
               "      <div style='text-align: right; border-top: 2px solid #e2e8f0; padding-top: 15px;'>" +
               "        <p style='margin: 10px 0; font-size: 15px; color: #4a5568;'>" +
               "          <span style='font-weight: 600;'>Tạm tính:</span> " + formattedSubtotal +
               "        </p>" +
               "        <p style='margin: 10px 0; font-size: 15px; color: #4a5568;'>" +
               "          <span style='font-weight: 600;'>Phí giao hàng:</span> " + formattedShipping +
               "        </p>" +
               "        <p style='margin: 10px 0; font-size: 20px; color: #e53e3e; font-weight: 800;'>" +
               "          <span style='color: #2d3748; font-size: 16px; font-weight: 700; margin-right: 10px;'>TỔNG THANH TOÁN:</span>" +
                          formattedTotal +
               "        </p>" +
               "      </div>" +
               "    </div>" +
               "    " +
               "    <!-- Footer -->" +
               "    <div style='background-color: #f7fafc; padding: 25px; text-align: center; border-top: 1px solid #edf2f7; font-size: 12px; color: #a0aec0;'>" +
               "      <p style='margin: 0 0 5px 0;'>Email này được gửi tự động từ hệ thống cửa hàng SHOP SPORT.</p>" +
               "      <p style='margin: 0;'>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ hotline: 0398752911 email hỗ trợ: vandiem2004@gmail.com</p>" +
               "    </div>" +
               "  </div>" +
               "</body>" +
               "</html>";
    }
}
