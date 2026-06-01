package iuh.fit.ai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AIController {

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        if (message == null || message.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message is empty"));
        }

        // Bỏ kết nối Gemini/OpenAI, dùng thuần if-else rules
        String response = getSmartFallbackResponse(message);
        return ResponseEntity.ok(Map.of("response", response));
    }

    private String getSmartFallbackResponse(String msg) {
        msg = msg.toLowerCase();
        
        // 1. Chào hỏi
        if (msg.contains("chào") || msg.contains("hello") || msg.contains("hi"))
            return "Xin chào! Tôi là SportyAI - Trợ lý ảo của Shop-Sport. Chúc bạn một ngày năng động! Bạn cần tôi tư vấn về sản phẩm hay dịch vụ nào không?";

        // 2. Tư vấn môn thể thao
        if (msg.contains("bóng đá") || msg.contains("đá banh") || msg.contains("giày đá bóng"))
            return "Với môn Vua, Shop-Sport đang có sẵn các dòng Nike Mercurial, Adidas X Crazyfast và Puma Future mới nhất. Bạn đá sân cỏ nhân tạo hay sân cỏ tự nhiên để mình tư vấn đế giày phù hợp?";
            
        if (msg.contains("cầu lông") || msg.contains("vợt") || msg.contains("yonex"))
            return "Về cầu lông, shop chuyên các dòng Yonex, Victor và Lining. Nếu bạn thích tấn công, Yonex Astrox là lựa chọn số 1. Nếu thích phòng thủ linh hoạt, hãy chọn dòng Arcsaber nhé!";

        if (msg.contains("bóng rổ") || msg.contains("giày bóng rổ"))
            return "Dòng giày bóng rổ của shop có độ bám sân cực tốt và đệm êm ái, đặc biệt là các mẫu Air Jordan và Nike LeBron. Bạn chơi ở vị trí nào (PG, SG hay Center) để mình chọn mẫu tốt nhất?";

        // 3. Tư vấn Size (Chi tiết hơn)
        if (msg.contains("size") || msg.contains("mặc gì") || msg.contains("cao") || msg.contains("nặng")) {
            if (msg.contains("m") || msg.contains("l") || msg.contains("xl"))
                return "Bảng size của shop: Size M (50-60kg), Size L (60-72kg), Size XL (72-85kg). Tuy nhiên tùy form áo (Slimfit hay Oversize) mà sẽ có chút khác biệt ạ.";
            return "Bạn hãy cho biết chiều cao và cân nặng nhé. Thông thường: Cao 1m65-1m72 nặng 60-70kg sẽ mặc cực đẹp Size L đấy ạ!";
        }

        // 4. Địa chỉ & Thông tin liên hệ
        if (msg.contains("địa chỉ") || msg.contains("ở đâu") || msg.contains("cửa hàng"))
            return "Shop-Sport tọa lạc tại: 12 Nguyễn Văn Bảo, Phường 4, Gò Vấp, TP.HCM. Mở cửa từ 8:00 - 22:00 tất cả các ngày trong tuần!";

        if (msg.contains("liên hệ") || msg.contains("số điện thoại") || msg.contains("sđt"))
            return "Bạn có thể gọi hotline: 0123.456.789 hoặc nhắn tin trực tiếp qua Fanpage để được hỗ trợ gấp nhé!";

        // 5. Thanh toán & Ship
        if (msg.contains("thanh toán") || msg.contains("chuyển khoản") || msg.contains("cod"))
            return "Shop hỗ trợ Thanh toán khi nhận hàng (COD), Chuyển khoản ngân hàng hoặc qua Ví điện tử. Đặc biệt miễn phí ship cho đơn hàng trên 500k!";

        if (msg.contains("bao lâu") || msg.contains("giao hàng") || msg.contains("ship"))
            return "Nội thành TP.HCM shop giao trong ngày hoặc ngày hôm sau. Các tỉnh thành khác sẽ từ 2-4 ngày làm việc tùy khu vực ạ.";

        // 6. Kiểm tra đơn hàng
        if (msg.contains("đơn hàng") || msg.contains("lịch sử") || msg.contains("kiểm tra"))
            return "Bạn có thể vào mục 'Lịch sử đơn hàng' trên thanh Menu sau khi đăng nhập để theo dõi trạng thái đơn hàng của mình nhé.";

        // 7. Khuyến mãi
        if (msg.contains("khuyến mãi") || msg.contains("giảm giá") || msg.contains("voucher"))
            return "Hiện shop đang có chương trình 'Mùa Hè Sôi Động': Giảm 10% cho toàn bộ sản phẩm Bóng đá và tặng kèm tất (vớ) thể thao cho đơn hàng từ 1 triệu đồng!";

        // 8. Tạm biệt
        if (msg.contains("tạm biệt") || msg.contains("bye") || msg.contains("cảm ơn"))
            return "Rất sẵn lòng giúp đỡ bạn! Nếu cần thêm thông tin gì, đừng ngần ngại hỏi tôi nhé. Chúc bạn có những giây phút thể thao tuyệt vời!";

        // Mặc định
        return "Chào bạn! Tôi là SportyAI. Tôi có thể tư vấn cho bạn về Size, Sản phẩm (Bóng đá, Cầu lông, Bóng rổ), thời gian giao hàng và chính sách thanh toán. Bạn cần tôi hỗ trợ gì ạ?";
    }
}
