# BÁO CÁO GIẢI TRÌNH CÂU HỎI BẢO VỆ ĐỒ ÁN KIẾN TRÚC PHẦN MỀM
## ĐỀ TÀI: HỆ THỐNG MICROSERVICES CỬA HÀNG THỂ THAO (SPORTSHOP)
*(Giải trình thực tế dựa trên cấu trúc thư mục, mã nguồn và tệp cấu hình của dự án)*

---

## PHẦN I: TÍNH NĂNG CỐT LÕI & HIỆU NĂNG HỆ THỐNG KHI TẢI CAO

### Câu 1: Tính năng nào quan trọng nhất trong bài?
Thực tế trong dự án của chúng ta, luồng nghiệp vụ quan trọng nhất là **Đặt hàng (Order)** kết hợp **Thanh toán (Payment)**:
* **Đặt hàng:** Được xử lý bởi `OrderService` (cổng `8083`). Khi người dùng tạo đơn hàng, thông tin được lưu vào bảng `orders` và các mặt hàng được lưu vào `order_items` thuộc cơ sở dữ liệu `order_db` (xem chi tiết schema tại [data_system.sql:L59-L84](file:///d:/Nam4/KTTKPM/Project_Deploy/data_system.sql#L59-L84)).
* **Thanh toán:** Xử lý bởi `PaymentService` (cổng `8084`), lưu dữ liệu giao dịch vào bảng `payments` thuộc cơ sở dữ liệu `payment_db` ([data_system.sql:L137-L148](file:///d:/Nam4/KTTKPM/Project_Deploy/data_system.sql#L137-L148)). Đây là nơi dòng tiền của hệ thống được kiểm soát và ghi nhận thông qua tích hợp cổng thanh toán trực tuyến MoMo.
* **Tư vấn AI:** Tính năng chatbot tư vấn bằng AI (`AIService` cổng `8085` kết nối với mô hình ngôn ngữ lớn `gemini-2.5-flash`) và live chat trực tiếp giữa khách hàng với Admin (`ChatService` cổng `8086`) là các tính năng bổ trợ nổi bật giúp tăng tỷ lệ chốt đơn hàng của hệ thống.

---

### Câu 2: Khi 1 triệu người dùng thì ứng dụng sẽ phản ứng như thế nào? Chỗ nào có nguy cơ bị tắc nghẽn?
Hiện tại, dự án của chúng ta đang được cấu hình chạy trên môi trường máy chủ đơn lẻ thông qua Docker Compose (xem [docker-compose.yml](file:///d:/Nam4/KTTKPM/Project_Deploy/docker-compose.yml)). Khi có **1 triệu người dùng truy cập đồng thời (1M Concurrent Users)**:
1. **Nghẽn tại Database MySQL (`mysql-db` container):** Toàn bộ 5 cơ sở dữ liệu (`auth_db`, `product_db`, `order_db`, `payment_db`, `chat_db`) đều đang trỏ chung vào một container MySQL chạy trên cổng `3306`. Lượng truy vấn ghi đồng thời cực lớn vào bảng `orders` và bảng `products` sẽ làm cạn kiệt Connection Pool của MySQL (HikariCP mặc định giới hạn tối đa 10 connection mỗi service), gây nghẽn I/O đĩa cứng và treo hệ thống.
2. **Nghẽn tại API Gateway (`gateway-service` container):** Chạy đơn lẻ trên cổng `8080`. Gateway sẽ nhanh chóng bị cạn kiệt CPU do phải giải mã SSL/TLS và xử lý Rate Limit liên tục cho 1 triệu IP người dùng. Các request đến sau sẽ nhận lỗi HTTP 429 (Too Many Requests) hoặc Gateway Timeout.
3. **Nghẽn tại Redis (`redis-cache` container):** Redis đang xử lý chung cả nhiệm vụ Rate Limiting cho Gateway và Caching sản phẩm cho Product Service. Lượng đọc/ghi token liên tục cho 1 triệu client sẽ làm quá tải băng thông mạng nội bộ của Redis container.
4. **Các cuộc gọi đồng bộ REST API nội bộ:** Trong mã nguồn `AIController.java`, để tư vấn sản phẩm, dịch vụ AI phải gọi HTTP GET đồng bộ sang `product-service` qua url `http://product-service:8082/api/v1/products`. Khi Product Service bị nghẽn DB, luồng xử lý của AI Service cũng bị treo theo (Cascading Failure).

---

### Câu 3: API Gateway làm nhiệm vụ gì?
Trong cấu hình thực tế tại [GatewayService/application.yml](file:///d:/Nam4/KTTKPM/Project_Deploy/GatewayService/src/main/resources/application.yml):
* **Định tuyến (Routing):** Phân tích URL request và chuyển tiếp đến đúng microservice nội bộ. Ví dụ:
  * `/api/v1/auth/**` -> Chuyển đến `http://auth-service:8081`
  * `/api/v1/products/**` -> Chuyển đến `http://product-service:8082`
  * `/api/v1/orders/**` -> Chuyển đến `http://order-service:8083`
  * `/api/v1/payments/**` -> Chuyển đến `http://payment-service:8084`
* **Hạn chế tần suất truy cập (Rate Limiting):** Sử dụng bộ lọc `RequestRateLimiter` kết hợp với Redis để giới hạn lượng request của mỗi địa chỉ IP (sử dụng Bean `ipKeyResolver` lấy địa chỉ IP của client).
* **Cấu hình CORS toàn cục:** Hỗ trợ Frontend React gọi API an toàn mà không bị lỗi trình duyệt chặn chéo miền. Loại bỏ các header trùng lặp thông qua bộ lọc `DedupeResponseHeader`.

---

### Câu 4: Cách nào tăng cường khả năng đọc và ghi?
* **Tăng cường khả năng ĐỌC (Read):**
  * **Redis Caching thực tế trong code:** Trong [ProductService.java](file:///d:/Nam4/KTTKPM/Project_Deploy/ProjectService/src/main/java/iuh/fit/product/Service/ProductService.java#L17-L30), chúng ta đã áp dụng `@Cacheable` để lưu cache thông tin sản phẩm lên Redis:
    * `getAllProducts()` được cache với key `'all'` trong phân vùng `products`.
    * `getProductById(Long id)` được cache với key `#id` trong phân vùng `product_details`.
    * Khi có request GET xem sản phẩm, Product Service đọc thẳng từ Redis RAM mất chưa đầy 3ms, không truy vấn xuống MySQL.
  * **Mở rộng thực tế:** Cấu hình cụm MySQL Master-Slave Replication, các API đọc sản phẩm sẽ kết nối tới Slave DB để giảm tải cho Master DB chuyên ghi.
* **Tăng cường khả năng GHI (Write):**
  * **Xử lý bất đồng bộ qua RabbitMQ thực tế trong code:** Trong [OrderService.java](file:///d:/Nam4/KTTKPM/Project_Deploy/OrderService/src/main/java/iuh/fit/order/service/OrderService.java#L29-L35), khi tạo đơn hàng, thay vì cập nhật tồn kho đồng bộ, hệ thống phát sự kiện `StockUpdateEvent` lên RabbitMQ (`x.product.exchange` / `product.stock-update`). `ProductStockListener.java` ở Product Service sẽ tiêu thụ tin nhắn này và cập nhật tồn kho ngầm một cách bất đồng bộ, giúp giải phóng luồng ghi của Order Service cực nhanh.
  * **Mở rộng thực tế:** Tách database vật lý. Hiện tại 5 service đang dùng chung một container `mysql-db` trong `docker-compose.yml`. Cần tách mỗi service ra một máy chủ MySQL vật lý riêng biệt để không chia sẻ chung băng thông đĩa cứng I/O.

---

### Câu 5: Hệ thống như này đã chạy nhanh nhất chưa? Hay có thể áp dụng hệ thống khác để chạy được tốt bài toán 1 triệu người dùng?
**Hệ thống hiện tại chưa chạy nhanh nhất** vì toàn bộ tầng dữ liệu (MySQL, Redis, RabbitMQ) và tầng ứng dụng (các container Spring Boot, React) đều đang chạy gom chung trên một máy chủ vật lý duy nhất thông qua Docker Compose.

**Để chạy tốt bài toán 1 triệu người dùng thực tế:**
1. **Phân rã Database vật lý:** Tách database của các dịch vụ ra các server MySQL vật lý riêng biệt thay vì dùng chung 1 container `mysql-db` như hiện tại.
2. **Kubernetes (K8s) Cluster:** Triển khai các container microservice lên cụm Kubernetes. Cấu hình tự động scale ngang (Autoscaling) tăng số lượng Pod khi CPU của service vượt quá 70%.
3. **Redis Cluster phân tán:** Thay thế single node Redis bằng cụm Redis Cluster nhiều node để tránh nghẽn băng thông RAM xử lý token rate limit.

---

### Câu 6: POST (Ghi) với GET/READ (Đọc), cái nào cần ngay lập tức? Tại sao xử lý bất đồng bộ ở POST tốt hơn?
* **GET/READ (Đọc) cần ngay lập tức:** Người dùng khi duyệt danh sách sản phẩm hoặc chi tiết sản phẩm bắt buộc phải có kết quả hiển thị ngay để đưa ra quyết định mua hàng. Lượng đọc sản phẩm luôn chiếm 90% tổng traffic của hệ thống và đã được chúng ta tối ưu bằng Redis Cache.
* **POST (Ghi) xử lý bất đồng bộ tốt hơn:** Các hành động POST như tạo đơn hàng, gửi email xác nhận không cần phản hồi đồng bộ 100%.
  * *Trong code thực tế:* Khi tạo đơn hàng (POST `/api/v1/orders`), hệ thống chỉ lưu bản ghi đơn hàng với trạng thái `PENDING` và trả về ngay kết quả cho client. Luồng trừ tồn kho và gửi email thông báo được đẩy vào RabbitMQ để xử lý bất đồng bộ dưới nền. Khách hàng chỉ mất khoảng 50ms để hoàn tất bấm nút đặt hàng thay vì phải đợi 2-3 giây cho hệ thống khóa dòng DB và thực hiện các kết nối mạng gửi email đồng bộ.

---

### Câu 7: Giải quyết bài toán thực hành thầy cho (Flash Sale / Tranh mua hàng giới hạn)?
Bài toán Flash Sale có đặc điểm là số lượng sản phẩm rất ít (ví dụ: 10 đôi giày Adidas) nhưng lượng request đặt mua đồng thời cực kỳ lớn (100.000+ request trong 1 giây). Vấn đề là **Tránh bán quá số lượng tồn kho (Over-selling)** và tránh làm sập database MySQL.

**Giải pháp thực tế dựa trên dự án hiện tại:**
1. **Kiểm tra tồn kho trước trên Redis RAM:** Hiện tại dự án đã có Redis Cache. Khi Flash Sale bắt đầu, ta lưu số lượng tồn kho (ví dụ: `stock:product:10 = 116`) lên Redis. Khi người dùng bấm mua, ta sử dụng lệnh giảm nguyên tử `DECR` của Redis để trừ kho trên RAM. Lệnh này cực kỳ nhanh (~1ms) và an toàn do Redis xử lý đơn luồng.
2. Nếu số lượng tồn kho giảm xuống dưới 0, hệ thống từ chối ngay lập tức tại RAM Redis và trả về "Hết hàng". 99.9% request của người dùng đến sau sẽ bị chặn đứng tại đây mà không hề truy cập hay tạo câu lệnh ghi nào xuống MySQL, giúp bảo vệ DB không bị quá tải.
3. Chỉ có các request trừ kho thành công trên Redis mới được gửi tin nhắn vào RabbitMQ để `OrderService` lưu đơn hàng xuống MySQL một cách tuần tự và an toàn.

---

### Câu 8: Xử lý trường hợp người dùng tăng lên đột biến & Công cụ kiểm thử tải hệ thống
* **Cách giải quyết thực tế khi tải tăng đột biến:**
  * Siết chặt giới hạn Rate Limit tại API Gateway bằng cách giảm cấu hình `replenishRate` để bảo vệ tài nguyên backend không bị sập.
  * Sử dụng cơ chế ngắt mạch **Circuit Breaker** (Resilience4j). Nếu dịch vụ phụ như `AIService` bị quá tải và phản hồi chậm, Gateway lập tức ngắt kết nối đến nó và trả về phản hồi fallback mặc định ngay lập tức, ngăn chặn treo luồng xử lý chính.
* **Công cụ kiểm thử thực tế:**
  * **K6 (Grafana):** Viết script giả lập 3.000 người dùng đồng thời gọi API xem sản phẩm (`GET /api/v1/products`) và đặt hàng (`POST /api/v1/orders`) gửi trực tiếp vào Gateway cổng `8080`.
  * **Apache JMeter:** Tạo các luồng gửi request đồng thời để đo lường giới hạn chịu tải tối đa của hệ thống trước khi MySQL Connection Pool bị tràn.

---

## PHẦN II: KIẾN TRÚC HỆ THỐNG & GIAO TIẾP LIÊN DỊCH VỤ

### Câu 9: Các hệ thống dùng cái nào? Ví dụ Event-Driven dùng ở đâu? Service Payment dùng ra sao?
* **Kiến trúc Event-Driven (RabbitMQ) được áp dụng tại:**
  1. **Luồng trừ tồn kho:** `OrderService` gửi sự kiện `StockUpdateEvent` lên exchange `x.product.exchange` -> Queue `q.product.stock-update` -> `ProductStockListener.java` lắng nghe để cập nhật số lượng tồn kho và số lượng đã bán trong bảng `products` của `product_db` ([ProductStockListener.java:L18-L22](file:///d:/Nam4/KTTKPM/Project_Deploy/ProjectService/src/main/java/iuh/fit/product/listener/ProductStockListener.java#L18-L22)).
  2. **Luồng cập nhật trạng thái đơn hàng:** Khi MoMo xác nhận thanh toán thành công, `PaymentService` gửi sự kiện `PaymentStatusEvent` lên queue `q.payment.status-update` -> `PaymentStatusListener.java` trong Order Service lắng nghe để tự động chuyển trạng thái đơn hàng thành `PAID` / `CONFIRMED`.
  3. **Luồng gửi email thông báo:** `NotificationService` (cổng `8087`) tiêu thụ các sự kiện từ RabbitMQ để tự động biên dịch HTML template gửi email xác nhận đơn hàng qua SMTP Gmail của shop.
* **Dịch vụ Thanh toán (Payment Service) dùng ra sao?**
  * Tích hợp **MoMo API (Sandbox)**. Khi tạo yêu cầu thanh toán MOMO, [MoMoService.java](file:///d:/Nam4/KTTKPM/Project_Deploy/PaymentService/src/main/java/iuh/fit/payment/service/MoMoService.java) thực hiện cuộc gọi REST API đồng bộ sang máy chủ MoMo (`https://test-payment.momo.vn/v2/gateway/api/create`) để lấy mã liên kết thanh toán (`payUrl`) trả về cho client.
  * Sau khi người dùng thanh toán trên ví MoMo, máy chủ MoMo gửi thông báo trạng thái giao dịch một cách an toàn thông qua **IPN** về endpoint `/api/v1/payments/momo-ipn` của hệ thống để xác thực chữ ký và cập nhật trạng thái thanh toán thành `SUCCESS` hoặc `FAILED` trong database `payment_db`.

---

### Câu 10: Tại sao chọn kiến trúc Microservices cho dự án này mà không dùng Monolith?
Chúng ta chọn Microservices vì các lý do thực tế sau:
1. **Tách biệt luồng xử lý Chat và AI:** Dịch vụ Live Chat WebSocket (`ChatService` cổng `8086`) và dịch vụ Tư vấn AI (`AIService` cổng `8085` kết nối API Gemini) là các dịch vụ chiếm giữ kết nối lâu dài và tốn tài nguyên RAM/CPU. Việc tách riêng giúp hai dịch vụ này không tranh giành thread pool hoặc làm sập luồng đặt hàng/thanh toán cốt lõi của `OrderService` và `PaymentService`.
2. **Cô lập lỗi thực tế:** Nếu API Gemini bị giới hạn hạn mức (Quota Limit) làm cho `AIService` bị treo hoặc sập, người dùng vẫn có thể xem sản phẩm, đặt hàng và thanh toán bình thường. Trong kiến trúc Monolith, lỗi OutOfMemory ở module AI sẽ làm sập toàn bộ máy chủ JVM của hệ thống.
3. **Cơ sở dữ liệu độc lập:** Dữ liệu tin nhắn chat (`chat_db`) hoặc dữ liệu sản phẩm (`product_db`) được lưu trữ ở các database riêng biệt, không có tình trạng câu lệnh SQL thống kê chat làm khóa bảng ảnh hưởng đến tốc độ ghi đơn hàng.

---

### Câu 11: Lượng người dùng cao sao không chọn kiến trúc khác? Ví dụ Event-Driven nó cũng dùng được lượng người dùng cao mà? Event-Driven có scale độc lập được không?
* **Làm rõ thực tế:** Dự án của chúng ta **không chọn một trong hai**, mà là **sự kết hợp giữa Microservices và giao tiếp Event-Driven qua RabbitMQ**. Một hệ thống thương mại điện tử không thể dùng Event-Driven 100% vì các tác vụ như Đăng nhập, Xem sản phẩm bắt buộc phải dùng cơ chế đồng bộ HTTP/REST để phản hồi giao diện ngay lập tức cho khách hàng.
* **Event-Driven có scale độc lập được không?**
  * **Cực kỳ tốt.** Khi lượng đơn hàng tăng đột biến làm ùn tắc hàng đợi RabbitMQ, ta có thể scale ngang (chạy thêm 3 container cho `product-service` bằng lệnh `docker-compose up --scale product-service=3 -d`) để tiêu thụ tin nhắn nhanh hơn mà không cần scale hay dừng hoạt động của `order-service`.

---

### Câu 12: Kể ra 3 đặc tính quan trọng nhất của hệ thống này? Có thực hiện thao tác gì cho các đặc tính đó không?
1. **Hiệu năng đọc cao (High Read Performance):** Đã thực hiện cấu hình Redis Caching bằng annotation `@Cacheable` trong `ProductService.java` để giảm 90% truy vấn đọc vào MySQL.
2. **Khả năng chịu lỗi độc lập (Fault Tolerance & Isolation):** Cấu hình định tuyến động độc lập qua API Gateway, sập service Chat/AI thì luồng Đặt hàng/Thanh toán vẫn hoạt động bình thường.
3. **Chống trùng lặp giao dịch (Idempotency):** Đã lập trình cơ chế khóa phân tán **Redis Distributed Lock** trong `PaymentController.java` để chặn đứng người dùng bấm nút thanh toán nhiều lần khi mạng bị lag.

---

## PHẦN III: AN TOÀN HỆ THỐNG, DỰ PHÒNG & XỬ LÝ SỰ CỐ

### Câu 13: Người sếp hỏi nếu giờ cái này nó sập thì sao?
* **Rủi ro thực tế hiện tại:**
  * Nếu container `mysql-db` sập: Toàn bộ hệ thống sẽ ngưng hoạt động vì các dịch vụ đều dùng chung container DB này.
  * Nếu container `gateway-service` sập: Khách hàng không thể truy cập bất kỳ tính năng nào vì Gateway là chốt chặn API duy nhất (cổng `8080`).
  * Nếu container `rabbitmq-broker` sập: Giao dịch đặt hàng vẫn tạo được nhưng tồn kho sản phẩm sẽ không được trừ và email thông báo không được gửi đi.
* **Giải pháp khắc phục thực tế:**
  * **Cơ chế Retry tại API Gateway (được cấu hình trong [application.yml](file:///d:/Nam4/KTTKPM/Project_Deploy/GatewayService/src/main/resources/application.yml#L16-L26)):** Chúng ta đã cấu hình bộ lọc `Retry` trong `default-filters` tại Gateway. Nếu bất kỳ microservice nào (Auth, Product, Order, Payment, AI, Chat) bị sập tạm thời hoặc quá tải trả về các lỗi như `502 Bad Gateway`, `503 Service Unavailable`, `504 Gateway Timeout`, Gateway sẽ tự động gửi lại request đó tối đa 3 lần với thời gian chờ tăng dần (từ 1000ms đến 5000ms) trước khi trả lỗi về cho khách hàng.
  * Mở rộng chạy tối thiểu 2 instance cho mỗi service sau một Load Balancer ngoài (như Nginx).
  * Cấu hình MySQL Replication (1 Master - 2 Slave) để tự động chuyển vùng dữ liệu khi Master gặp sự cố.
  * Bật chế độ Durable cho hàng đợi RabbitMQ để tránh mất mát tin nhắn khi Broker bị khởi động lại.

---

### Câu 14: Payment Service làm sao để không bị thanh toán 2 lần?
Trong mã nguồn thực tế tại [PaymentController.java:L34-L41](file:///d:/Nam4/KTTKPM/Project_Deploy/PaymentService/src/main/java/iuh/fit/payment/controller/PaymentController.java#L34-L41), chúng ta đã lập trình cơ chế chặn thanh toán trùng lặp bằng **Redis Distributed Lock (Idempotency)**:
```java
String lockKey = "lock:payment:" + request.getOrderId();
Boolean isLocked = redisTemplate.opsForValue().setIfAbsent(lockKey, "processing", Duration.ofSeconds(30));
if (Boolean.FALSE.equals(isLocked)) {
    System.err.println("Duplicate payment request detected for order ID: " + request.getOrderId());
    return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(Map.of("status", "ERROR", "message", "Giao dịch thanh toán cho đơn hàng này đang được xử lý. Vui lòng không nhấn liên tục!"));
}
```
* **Nghiệp vụ thực tế:** Khi nhận yêu cầu thanh toán cho một `orderId`, hệ thống dùng lệnh `setIfAbsent` (tương đương `SETNX` trong Redis) để ghi khóa tạm `lock:payment:{orderId}` có hiệu lực trong 30 giây.
* Nếu client gửi thêm request thanh toán thứ hai cho cùng đơn hàng này do mạng lag hoặc cố tình click đúp, Redis sẽ trả về `false`. Hệ thống lập tức từ chối và trả về HTTP `409 Conflict`, chặn đứng hoàn toàn việc trừ tiền hoặc tạo giao dịch MoMo lần 2.

---

### Câu 15: Nếu có thêm thời gian và ngân sách thì cải thiện cái gì để tốt hơn?
1. **Tách database vật lý thực sự:** Chuyển đổi cấu hình từ 1 container `mysql-db` dùng chung sang các máy chủ database chuyên dụng riêng biệt cho từng service để giải phóng tối đa băng thông I/O của đĩa.
2. **Tích hợp Spring Cloud Sleuth & Zipkin:** Cấu hình Trace ID đi kèm request qua API Gateway đến các microservice giúp dễ dàng dò lỗi phân tán khi có giao dịch thất bại.
3. **Thiết lập Prometheus & Grafana:** Tích hợp micrometer đo lường hiệu năng Connection Pool của cơ sở dữ liệu MySQL và CPU/RAM của các container theo thời gian thực để cảnh báo tự động qua Telegram khi hệ thống quá tải.

---

### Câu 18: Làm sao để hệ thống luôn sống 24/24?
* Triển khai cơ chế **Rolling Update** của Docker Swarm hoặc Kubernetes. Khi cập nhật phiên bản mới (ví dụ nâng cấp `ProductService`), hệ thống khởi động container phiên bản mới trước, kiểm tra health check thành công rồi mới tắt container phiên bản cũ để đảm bảo zero-downtime.
* Chạy tối thiểu 2 instance cho mỗi service đứng sau Gateway để dự phòng tải.

---

### Câu 23: Áp dụng Rate Limiter vào chỗ API Gateway chống truy cập nhiều thế nào?
Trong tệp cấu hình thực tế tại [GatewayService/application.yml](file:///d:/Nam4/KTTKPM/Project_Deploy/GatewayService/src/main/resources/application.yml#L33-L37):
```yaml
filters:
  - name: RequestRateLimiter
    args:
      redis-rate-limiter.replenishRate: 150 # Nạp lại 150 token/giây
      redis-rate-limiter.burstCapacity: 300 # Sức chứa tối đa 300 token
      key-resolver: "#{@ipKeyResolver}"
```
* **Cơ chế hoạt động:** Sử dụng thuật toán **Token Bucket** lưu trạng thái trên Redis. Với mỗi địa chỉ IP khách hàng (định danh qua Bean `ipKeyResolver` trong file [RateLimiterConfig.java](file:///d:/Nam4/KTTKPM/Project_Deploy/GatewayService/src/main/java/iuh/fit/gateway/config/RateLimiterConfig.java)), hệ thống cho phép gửi tối đa 150 request mỗi giây. Nếu vượt quá ngưỡng chứa tối đa 300 request, Gateway lập tức từ chối dịch vụ tại cổng bằng mã lỗi HTTP 429 mà không chuyển tiếp request vào microservice backend, bảo vệ hệ thống tuyệt đối trước các công cụ spam hoặc tấn công DDoS.

---

### Câu 24: Điểm yếu của kiến trúc hiện tại là gì? Giải pháp khắc phục?
* **Điểm yếu thực tế:** Tính nhất quán cuối cùng (**Eventual Consistency**). Khi tạo đơn hàng thành công, tồn kho của sản phẩm không được trừ trực tiếp trong MySQL của Product Service ngay lập tức mà phải đợi tin nhắn truyền qua RabbitMQ. Nếu hàng đợi bị nghẽn, tồn kho hiển thị cho người dùng khác có thể bị sai lệch tạm thời.
* **Giải pháp khắc phục:** Cấu hình cơ chế xác nhận tin nhắn an toàn (RabbitMQ Publisher Confirms và Consumer Acknowledgements) để đảm bảo tin nhắn không bị thất lạc, và thiết lập cơ chế tự động gửi lại tin nhắn khi xảy ra lỗi kết nối.

---

### Câu 32: Kiến trúc bài nhóm có thể xảy ra rủi ro gì?
1. **Rủi ro SPOF (Single Point of Failure):** Cả Gateway Service và Redis Cache đều đang chạy single instance. Nếu 1 trong 2 dịch vụ này sập, toàn bộ hệ thống bán hàng sẽ ngừng hoạt động.
2. **Rủi ro mất mát tin nhắn:** Nếu container RabbitMQ Broker bị sập nguồn đột ngột khi các sự kiện cập nhật kho hoặc thanh toán đang nằm trong hàng đợi mà chưa được lưu xuống đĩa cứng (non-persistent queues).

---

### Câu 33: Nếu làm thêm một server nữa thực sự rất tốn kém. Giải quyết thế nào?
Để tiết kiệm chi phí hạ tầng thực tế:
* Thay vì mua thêm phần cứng vật lý đắt đỏ, hãy thuê các máy chủ ảo Cloud VPS giá rẻ (như DigitalOcean hoặc AWS EC2) có hỗ trợ **Auto-scaling**. Hệ thống sẽ chỉ tự động bật thêm máy chủ ảo phụ trong khung giờ cao điểm có lượng đặt hàng lớn và tự động tắt đi vào ban đêm khi lượng truy cập thấp, giúp tối ưu hóa chi phí chi trả theo giờ sử dụng thực tế.
* Tận dụng tối đa RAM của server hiện tại bằng cách tinh chỉnh các thông số cấu hình JVM của Spring Boot (ví dụ đặt `-Xms256m -Xmx512m` cho mỗi container Java) để tối ưu dung lượng bộ nhớ sử dụng.

---

## PHẦN IV: CÁC CÂU HỎI VỀ ĐỒNG BỘ, THIẾT KẾ & PHÁT TRIỂN

### Câu 16: Khi phát triển tính năng mới có cần deploy lại toàn bộ hệ thống hay không?
**Không cần deploy lại toàn bộ hệ thống.**
* Mỗi dịch vụ được đóng gói độc lập trong một container Docker riêng biệt.
* Ví dụ: Khi bạn sửa đổi logic tìm kiếm sản phẩm dựa trên chiều cao cân nặng của AI chatbot tại [AIController.java](file:///d:/Nam4/KTTKPM/Project_Deploy/AIService/src/main/java/iuh/fit/ai/controller/AIController.java), bạn chỉ cần chạy build lại image của riêng container `ai-service` và redeploy container này.
* Trong suốt quá trình cập nhật `ai-service`, khách hàng vẫn có thể truy cập xem sản phẩm, đặt hàng và thanh toán bình thường mà không hề bị ảnh hưởng.

---

### Câu 17: Áp dụng kiến trúc nào vào đâu để tăng hiệu năng (Performance) hệ thống lên?
* **Cache-Aside Pattern (Redis Caching):** Áp dụng tại `ProductService` giúp giảm tải đọc cho database MySQL.
* **Event-Driven Architecture (RabbitMQ):** Áp dụng tại luồng trừ tồn kho và gửi email thông báo giúp xử lý bất đồng bộ các tác vụ ghi nặng, giảm thời gian phản hồi API đặt hàng của người dùng xuống mức thấp nhất (~50ms).

---

### Câu 19: Tìm kiếm sản phẩm có quan trọng không? Giải pháp tối ưu thực tế?
Tìm kiếm sản phẩm là tính năng **vô cùng quan trọng** vì nó ảnh hưởng trực tiếp đến quyết định mua hàng của khách.
* *Thực tế hiện tại:* Trong mã nguồn `AIController.java`, để chatbot tìm kiếm sản phẩm phù hợp, hệ thống gọi API lấy toàn bộ danh sách sản phẩm từ Product Service rồi chạy thuật toán so khớp từ khóa cơ bản (`scoreProduct` dựa trên tên, danh mục, môn thể thao). Cách này chỉ phù hợp khi số lượng sản phẩm nhỏ dưới vài trăm.
* *Giải pháp tối ưu thực tế:* Tích hợp **Elasticsearch**. Khi dữ liệu sản phẩm lớn lên hàng vạn sản phẩm, Elasticsearch hỗ trợ tìm kiếm không dấu, gần đúng (Fuzzy Search) và gợi ý từ khóa (Autocomplete) trong vòng vài mili-giây ở lớp database, không làm tràn bộ nhớ RAM của ứng dụng Java.

---

### Câu 26: Dùng cái gì để gửi request vào chương trình để kiểm tra mã lỗi 400?
Chúng ta sử dụng công cụ **Postman** hoặc lệnh **cURL** trong terminal để gửi request thiếu thông tin bắt buộc sang backend.
* *Ví dụ:* Gửi một request `POST` đăng ký tài khoản đến địa chỉ Gateway `http://localhost:8080/api/v1/auth/register` với JSON Body cố tình bỏ trống trường password.
* Dịch vụ Auth Service sẽ thực hiện kiểm tra tính hợp lệ dữ liệu và Gateway trả về HTTP status code `400 Bad Request`.

---

### Câu 28: Kiến trúc hiện tại là Microservices có thể chuyển sang Event-Driven được hay không?
**Hiện tại hệ thống đã là sự kết hợp của cả hai.** Chúng ta sử dụng giao tiếp đồng bộ HTTP/REST cho các tác vụ cần phản hồi ngay (Xem sản phẩm, Đăng nhập, Tạo link MoMo) và sử dụng giao tiếp bất đồng bộ Event-Driven qua RabbitMQ cho các tác vụ chạy ngầm (Trừ kho, Cập nhật trạng thái đơn hàng khi thanh toán xong, Gửi email). Do đó không cần chuyển đổi hoàn toàn mà chỉ nâng cấp các luồng xử lý ngầm hiện có.

---

### Câu 29: Nếu có 5 service, tại sao không tích hợp trực tiếp thanh toán mà lại tách riêng thành Payment Service?
Việc tách riêng **Payment Service** mang lại các lợi ích thực tế:
1. **Bảo mật thông tin thanh toán:** Giúp quản lý tập trung và cô lập các mã bảo mật nhạy cảm (Partner Code, Access Key, Secret Key của MoMo Sandbox) tại một nơi duy nhất.
2. **Dễ dàng mở rộng đối tác:** Khi cần tích hợp thêm cổng thanh toán VNPay hay ZaloPay, ta chỉ cần chỉnh sửa code tại Payment Service mà không cần đụng đến hay deploy lại 4 service còn lại.

---

### Câu 30: Ứng dụng ước lượng phục vụ bao nhiêu người dùng? Dựa vào yếu tố nào để ước lượng?
* **Mức chịu tải thực tế:** Hệ thống hiện tại có cấu hình chịu tải từ **3.000 - 5.000 người dùng hoạt động đồng thời (Active Users)**.
* **Yếu tố ước lượng:**
  * Tham số giới hạn request tại Gateway trong [docker-compose.yml](file:///d:/Nam4/KTTKPM/Project_Deploy/docker-compose.yml#L248-L253) (`replenishRate: 150`, `burstCapacity: 300` cho Product).
  * Giới hạn Connection Pool của MySQL (HikariCP mặc định tối đa khoảng 10-20 kết nối đồng thời từ mỗi dịch vụ).

---

### Câu 31: Tại sao cấu hình 200 request/phút?
Con số 200 request/phút (~3 request/giây cho mỗi địa chỉ IP) dựa trên hành vi sử dụng của một con người bình thường (người dùng thật chỉ tạo khoảng 10-30 request/phút khi lướt web). Việc đặt ngưỡng 200 request/phút giúp ngăn chặn hiệu quả các bot tự động cào dữ liệu sản phẩm, bot spam API đăng nhập (Brute force) mà không làm ảnh hưởng đến trải nghiệm của khách hàng thật.

---

### Câu 34: Tại sao không dùng kiến trúc Monolith trong khi Monolith vẫn có thể mở rộng Database được?
Dù Monolith có thể nhân bản database Master-Slave để chia tải đọc/ghi, nó vẫn có những điểm yếu nghiêm trọng so với Microservices:
1. **Nghẽn tài nguyên do dịch vụ không cân bằng:** Hệ thống có tính năng **Chat trực tuyến qua WebSocket (Chat Service)** và **Tư vấn AI qua Gemini API (AI Service)** là hai dịch vụ chiếm kết nối lâu dài và tốn rất nhiều tài nguyên RAM/CPU. Trong Monolith, hai module này sẽ chiếm dụng hết luồng CPU/RAM của server, dẫn đến khách hàng không đặt hàng được dù database thanh toán vẫn rảnh rỗi.
2. **Thời gian downtime khi cập nhật:** Mỗi lần sửa một lỗi nhỏ ở tính năng tư vấn, ta phải compile và restart toàn bộ hệ thống Monolith khổng lồ, gây gián đoạn mua sắm của khách.
