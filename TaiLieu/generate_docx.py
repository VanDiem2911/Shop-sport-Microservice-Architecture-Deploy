# -*- coding: utf-8 -*-
import docx
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('w:top', top), ('w:bottom', bottom), ('w:left', left), ('w:right', right)]:
        node = OxmlElement(m)
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def create_report():
    doc = docx.Document()
    
    # Page setup
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    # Style definitions
    style_normal = doc.styles['Normal']
    font = style_normal.font
    font.name = 'Arial'
    font.size = Pt(11)
    font.color.rgb = RGBColor(0x33, 0x41, 0x55) # Slate 700

    # Custom Colors
    PRIMARY_COLOR = RGBColor(30, 41, 59) # Slate 800
    SECONDARY_COLOR = RGBColor(59, 130, 246) # Blue 500
    DARK_BLUE = RGBColor(15, 23, 42) # Slate 900
    
    # ---------------------------------------------------------------------------
    # TITLE
    # ---------------------------------------------------------------------------
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_run = title_p.add_run("BÁO CÁO ĐÁNH GIÁ KIẾN TRÚC HỆ THỐNG")
    title_run.font.name = 'Arial'
    title_run.font.size = Pt(22)
    title_run.font.bold = True
    title_run.font.color.rgb = PRIMARY_COLOR
    title_p.paragraph_format.space_after = Pt(4)

    subtitle_p = doc.add_paragraph()
    subtitle_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sub_run = subtitle_p.add_run("HỆ THỐNG BÁN HÀNG THỂ THAO SPORTSHOP MICROSERVICES")
    sub_run.font.size = Pt(14)
    sub_run.font.bold = True
    sub_run.font.color.rgb = SECONDARY_COLOR
    subtitle_p.paragraph_format.space_after = Pt(30)

    # Overview box
    intro_p = doc.add_paragraph()
    intro_run = intro_p.add_run("Tóm tắt tài liệu: ")
    intro_run.bold = True
    intro_p.add_run(
        "Báo cáo này trình bày chi tiết về cấu trúc tổ chức dự án, thiết kế kiến trúc phân tán (C4 Model Context & Container), "
        "đánh giá ưu nhược điểm, so sánh kỹ thuật, các giải pháp đảm bảo thuộc tính kiến trúc (Availability, Performance, "
        "Fault Tolerance, Securities, Scalability), giải pháp DevOps (Docker-Compose, GitLab CI/CD) và việc ứng dụng "
        "trí tuệ nhân tạo (AI Agent) trong dự án Shop-Sport."
    )
    intro_p.paragraph_format.space_after = Pt(20)

    # ---------------------------------------------------------------------------
    # SECTION 1: PROJECT ORGANIZATION
    # ---------------------------------------------------------------------------
    h1 = doc.add_paragraph()
    h1_run = h1.add_run("1. TỔ CHỨC DỰ ÁN (PROJECT ORGANIZATION)")
    h1_run.font.size = Pt(14)
    h1_run.font.bold = True
    h1_run.font.color.rgb = PRIMARY_COLOR
    h1.paragraph_format.space_before = Pt(12)
    h1.paragraph_format.space_after = Pt(8)

    # 1.1 Agile-Scrum
    h2 = doc.add_paragraph()
    h2_run = h2.add_run("1.1 Quy trình phát triển Agile-Scrum")
    h2_run.font.size = Pt(12)
    h2_run.font.bold = True
    h2_run.font.color.rgb = SECONDARY_COLOR
    h2.paragraph_format.space_before = Pt(8)
    h2.paragraph_format.space_after = Pt(6)

    p = doc.add_paragraph(
        "Dự án được quản lý nghiêm ngặt theo phương pháp Agile/Scrum. Toàn bộ tính năng (Backlog) được phân bổ vào các Sprints kéo dài 2 tuần. "
        "Bảng công việc (Task Management) được cập nhật liên tục qua các trạng thái (To-Do, In-Progress, Testing, Done). Cụ thể:"
    )
    p.paragraph_format.space_after = Pt(8)

    # Sprint table
    table = doc.add_table(rows=5, cols=3)
    table.style = 'Table Grid'
    
    headers = ["Sprint", "Mục tiêu & Backlog Items", "Kết quả đầu ra (Deliverables)"]
    for i, title in enumerate(headers):
        cell = table.cell(0, i)
        cell.text = title
        set_cell_background(cell, "1E293B")
        set_cell_margins(cell)
        run = cell.paragraphs[0].runs[0]
        run.font.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)

    sprints = [
        ("Sprint 1 (Tuần 1-2)", "Thiết kế DB-per-Service. Xây dựng dịch vụ cốt lõi: AuthService (JWT/BCrypt), ProductService (JPA/MySQL), tạo khung React Frontend.", "Chạy thành công 2 service chính, xác thực đăng nhập trả về JWT, hiển thị giao diện trang chủ sản phẩm."),
        ("Sprint 2 (Tuần 3-4)", "Xây dựng OrderService, PaymentService (tích hợp MoMo), thiết lập API Gateway trung chuyển, đồng bộ giỏ hàng persistent.", "Định tuyến Gateway mượt mà, đặt hàng thành công, chuyển hướng thanh toán MoMo Sandbox và callback cập nhật trạng thái."),
        ("Sprint 3 (Tuần 5-6)", "Tích hợp Middleware: cài đặt Redis (Cache sản phẩm, Rate Limit ở Gateway, Distributed Lock cho Payment), thiết lập RabbitMQ đồng bộ tồn kho.", "Hệ thống không bị trùng lặp thanh toán khi lag, tồn kho tự động trừ bất đồng bộ, phản hồi Catalog nhanh < 5ms nhờ Redis cache."),
        ("Sprint 4 (Tuần 7-8)", "Xây dựng AIService (Gemini AI Agent), ChatService (WebSockets), NotificationService (RabbitMQ & SMTP Mail). Viết Docker-Compose & CI/CD.", "Chatbot AI hoạt động, chat thời gian thực hoạt động, tự động gửi email hóa đơn khi thanh toán, đóng gói Docker chạy toàn hệ thống.")
    ]

    for idx, (sp, backlog, deliv) in enumerate(sprints):
        row = table.rows[idx + 1]
        row.cells[0].text = sp
        row.cells[1].text = backlog
        row.cells[2].text = deliv
        for cell in row.cells:
            set_cell_margins(cell)
            if idx % 2 == 0:
                set_cell_background(cell, "F8FAFC")

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # 1.2 Functions
    h2 = doc.add_paragraph()
    h2_run = h2.add_run("1.2 Danh mục chức năng chính (Functions)")
    h2_run.font.size = Pt(12)
    h2_run.font.bold = True
    h2_run.font.color.rgb = SECONDARY_COLOR
    h2.paragraph_format.space_before = Pt(8)
    h2.paragraph_format.space_after = Pt(6)

    doc.add_paragraph("Các phân hệ chức năng nghiệp vụ của hệ thống bao gồm:")
    
    table_func = doc.add_table(rows=6, cols=3)
    table_func.style = 'Table Grid'
    
    headers_func = ["Phân hệ", "Chức năng Khách hàng (Customer)", "Chức năng Quản trị (Admin)"]
    for i, title in enumerate(headers_func):
        cell = table_func.cell(0, i)
        cell.text = title
        set_cell_background(cell, "1E293B")
        set_cell_margins(cell)
        run = cell.paragraphs[0].runs[0]
        run.font.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)

    funcs = [
        ("Tài khoản & Xác thực", "Đăng ký, Đăng nhập (Authentication), Đăng nhập bên thứ ba (Google OAuth2), Quản lý trang cá nhân.", "Quản lý tài khoản người dùng, phân quyền truy cập (Role-based Authorization: ADMIN/USER)."),
        ("Sản phẩm & Caching", "Xem danh mục, Xem chi tiết sản phẩm, Viết đánh giá sản phẩm (1-5 sao), Đọc nhanh sản phẩm từ Redis Cache.", "Quản lý danh mục (Category), thêm mới sản phẩm, quản lý kho hàng (Stock), cập nhật thông tin sản phẩm."),
        ("Đơn hàng & Giỏ hàng", "Quản lý giỏ hàng persistent (MySQL), đặt hàng, theo dõi lịch sử đơn hàng, xem chi tiết hóa đơn.", "Xem danh sách đơn hàng toàn hệ thống, cập nhật trạng thái đơn hàng (PENDING, PAID, CANCELLED)."),
        ("Thanh toán & Email", "Thanh toán an toàn qua ví MoMo (tích hợp Sandbox), nhận email hóa đơn và email cập nhật tự động.", "Xem lịch sử giao dịch và đối soát thanh toán trực tuyến qua các ID giao dịch của ví MoMo."),
        ("AI & Chat", "Hỏi đáp tự động chọn size/chính sách với Trợ lý AI (SportyAI), Chat WebSocket trực tiếp với tư vấn viên.", "Khung chat tập trung tiếp nhận và trả lời khách hàng thời gian thực qua WebSocket.")
    ]

    for idx, (module, cust, adm) in enumerate(funcs):
        row = table_func.rows[idx + 1]
        row.cells[0].text = module
        row.cells[1].text = cust
        row.cells[2].text = adm
        for cell in row.cells:
            set_cell_margins(cell)
            if idx % 2 == 0:
                set_cell_background(cell, "F8FAFC")

    doc.add_paragraph().paragraph_format.space_after = Pt(20)

    # ---------------------------------------------------------------------------
    # SECTION 2: ARCHITECTURE STYLES
    # ---------------------------------------------------------------------------
    h1 = doc.add_paragraph()
    h1_run = h1.add_run("2. THIẾT KẾ KIẾN TRÚC (ARCHITECTURE STYLES)")
    h1_run.font.size = Pt(14)
    h1_run.font.bold = True
    h1_run.font.color.rgb = PRIMARY_COLOR
    h1.paragraph_format.space_before = Pt(12)
    h1.paragraph_format.space_after = Pt(8)

    # 2.1 C4 Models
    h2 = doc.add_paragraph()
    h2_run = h2.add_run("2.1 Mô tả mô hình kiến trúc C4 Model")
    h2_run.font.size = Pt(12)
    h2_run.font.bold = True
    h2_run.font.color.rgb = SECONDARY_COLOR
    h2.paragraph_format.space_before = Pt(8)
    h2.paragraph_format.space_after = Pt(6)

    doc.add_paragraph(
        "Hệ thống áp dụng chuẩn thiết kế C4 Model giúp trực quan hóa kiến trúc theo các tầng phân rã:\n"
        "• Cấp độ 1 (Context Diagram): Xác định biên hệ thống. Khách hàng và Admin tương tác với SportShop System. "
        "SportShop System tự động giao tiếp với các hệ thống ngoài gồm MoMo Payment Gateway, SMTP Mail Server (Gmail), "
        "Google OAuth và Gemini AI API.\n"
        "• Cấp độ 2 (Container Diagram): Phân rã hệ thống thành các dịch vụ. Khách hàng giao tiếp qua React Frontend SPA. "
        "Các API request đi qua cổng API Gateway (Spring Cloud Gateway) cổng 8080. Gateway xác thực JWT và định tuyến "
        "đến 7 Microservices chạy độc lập ở Backend. Thông tin được lưu tại 5 Database MySQL riêng biệt (auth_db, product_db, "
        "order_db, payment_db, chat_db). RabbitMQ Broker đồng bộ tồn kho và email bất đồng bộ. Redis lưu trữ cache và lock phân tán."
    )
    
    # 2.2 Pros/Cons
    h2 = doc.add_paragraph()
    h2_run = h2.add_run("2.2 Phân tích ưu/nhược điểm (Advantages & Disadvantages)")
    h2_run.font.size = Pt(12)
    h2_run.font.bold = True
    h2_run.font.color.rgb = SECONDARY_COLOR
    h2.paragraph_format.space_before = Pt(8)
    h2.paragraph_format.space_after = Pt(6)

    doc.add_paragraph(
        "• Ưu điểm (Advantages): Tự do công nghệ (có thể dùng Python phát triển AIService mà không ảnh hưởng Java ở các service khác); "
        "Khả năng scale độc lập (chỉ scale Product Service khi đợt sale tăng truy vấn); Cách ly lỗi tốt (Chat sập không ảnh hưởng luồng mua sắm).\n"
        "• Nhược điểm (Disadvantages): Vận hành phức tạp (CI/CD, giám sát nhiều node container); Trễ mạng (gọi HTTP chéo phát sinh latency); "
        "Tính nhất quán dữ liệu khó đảm bảo hơn (đòi hỏi giao tiếp Event-Driven qua RabbitMQ thay vì các lệnh join bảng)."
    )

    # 2.3 Compare Monolith
    h2 = doc.add_paragraph()
    h2_run = h2.add_run("2.3 So sánh và lý do lựa chọn (Monolith vs Microservices)")
    h2_run.font.size = Pt(12)
    h2_run.font.bold = True
    h2_run.font.color.rgb = SECONDARY_COLOR
    h2.paragraph_format.space_before = Pt(8)
    h2.paragraph_format.space_after = Pt(6)

    table_comp = doc.add_table(rows=5, cols=4)
    table_comp.style = 'Table Grid'
    
    headers_comp = ["Tiêu chí", "Kiến trúc Monolith", "Kiến trúc Microservices (Chọn)", "Lý do chọn cho SportShop"]
    for i, title in enumerate(headers_comp):
        cell = table_comp.cell(0, i)
        cell.text = title
        set_cell_background(cell, "1E293B")
        set_cell_margins(cell)
        run = cell.paragraphs[0].runs[0]
        run.font.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)

    comps = [
        ("Độ phức tạp ban đầu", "Rất thấp, dễ bắt đầu", "Cao, cần cấu hình nhiều", "Chấp nhận phức tạp ban đầu để dễ phát triển độc lập về sau."),
        ("Khả năng Scale", "Phải scale toàn bộ ứng dụng", "Scale riêng biệt từng service", "Tối ưu vì Product và Order là 2 dịch vụ chịu tải nhiều nhất, cần scale độc lập."),
        ("Cách ly lỗi", "Thấp, sập 1 module sập cả app", "Cao, cô lập lỗi trong service", "Giữ cho hệ thống luôn hoạt động (High Availability) ngay cả khi lỗi dịch vụ phụ."),
        ("Thời gian Deploy", "Lâu (phải build lại toàn bộ)", "Nhanh (chỉ build service sửa)", "Giúp team áp dụng GitLab CI/CD tự động build nhanh chóng cho từng module.")
    ]

    for idx, (crit, mono, micro, reason) in enumerate(comps):
        row = table_comp.rows[idx + 1]
        row.cells[0].text = crit
        row.cells[1].text = mono
        row.cells[2].text = micro
        row.cells[3].text = reason
        for cell in row.cells:
            set_cell_margins(cell)
            if idx % 2 == 0:
                set_cell_background(cell, "F8FAFC")

    # 2.4 Trade-off
    h2 = doc.add_paragraph()
    h2_run = h2.add_run("2.4 Đánh đổi kiến trúc (Trade-offs)")
    h2_run.font.size = Pt(12)
    h2_run.font.bold = True
    h2_run.font.color.rgb = SECONDARY_COLOR
    h2.paragraph_format.space_before = Pt(8)
    h2.paragraph_format.space_after = Pt(6)

    doc.add_paragraph(
        "• Hiệu năng vs Chi phí: Tích hợp Redis Caching tăng tốc độ truy vấn sản phẩm đáng kể, giảm tải MySQL DB từ 120ms xuống < 5ms, "
        "đổi lại tốn chi phí RAM vật lý để duy trì Redis Server.\n"
        "• Nhất quán vs Độ trễ: Đồng bộ tồn kho bất đồng bộ qua RabbitMQ giúp trả về kết quả đặt hàng ngay cho khách (độ trễ cực thấp), "
        "đánh đổi lại việc tồn kho có thể bị trễ nhẹ (Eventual Consistency).\n"
        "• Độ phức tạp vs Khả năng mở rộng: Tách DB-per-service giúp scale không giới hạn, đổi lại logic code giỏ hàng persistent phức tạp "
        "hơn vì không thể JOIN liên DB."
    )

    # 2.5 Situational Q&A
    h2 = doc.add_paragraph()
    h2_run = h2.add_run("2.5 Trả lời câu hỏi tình huống kiến trúc (Contextual Q&A)")
    h2_run.font.size = Pt(12)
    h2_run.font.bold = True
    h2_run.font.color.rgb = SECONDARY_COLOR
    h2.paragraph_format.space_before = Pt(8)
    h2.paragraph_format.space_after = Pt(6)

    qas = [
        ("Tải cao đột biến (Flash Sale)?", "Gateway chặn spam qua Redis Rate Limiter (lỗi 429). Hệ thống tự scale-out product-service và order-service. 90% đọc từ Redis Cache bảo vệ MySQL."),
        ("Một service bị sập (Fault Tolerance)?", "Gateway cách ly service lỗi (Ví dụ sập Chat, các phần khác vẫn hoạt động). Gateway tự động Retry từ 1-5s. Docker tự động restart container."),
        ("Cách hệ thống hoạt động liên tục 24/7 (Availability)?", "Chạy tối thiểu 2 instances/dịch vụ trên các node khác nhau. Gateway liên tục kiểm tra liveness/readiness, gỡ bỏ node lỗi khỏi routing table. Cấu hình DB Master-Slave."),
        ("Bảo mật hệ thống được xử lý thế nào?", "API Gateway làm trung tâm xác thực (JWT Filter). Mật khẩu băm BCrypt. Giới hạn lưu lượng (Rate limiting) tại Gateway ngăn chặn Ddos.")
    ]

    for q, a in qas:
        p_q = doc.add_paragraph()
        run_q = p_q.add_run(f"Hỏi: {q}")
        run_q.bold = True
        p_a = doc.add_paragraph()
        p_a.add_run(f"Đáp: {a}")
        p_a.paragraph_format.left_indent = Inches(0.25)
        p_a.paragraph_format.space_after = Pt(8)

    doc.add_paragraph().paragraph_format.space_after = Pt(20)

    # ---------------------------------------------------------------------------
    # SECTION 3: ARCHITECTURE CHARACTERISTICS
    # ---------------------------------------------------------------------------
    h1 = doc.add_paragraph()
    h1_run = h1.add_run("3. ĐẶC TRƯNG KIẾN TRÚC (ARCHITECTURE CHARACTERISTICS)")
    h1_run.font.size = Pt(14)
    h1_run.font.bold = True
    h1_run.font.color.rgb = PRIMARY_COLOR
    h1.paragraph_format.space_before = Pt(12)
    h1.paragraph_format.space_after = Pt(8)

    chars = [
        ("Availability 24/7", "Cấu hình Docker Restart Policy: always. Tích hợp bộ kiểm tra sức khỏe liveness/readiness ở Gateway. Load balancer điều phối request qua các instance sống để đảm bảo hoạt động liên tục."),
        ("Performance Redis", "Sử dụng Redis cache danh sách sản phẩm và chi tiết sản phẩm. Cấu hình Distributed Lock (opsForValue().setIfAbsent) ngăn chặn trùng giao dịch thanh toán khi lag mạng."),
        ("Rate Limiter Client", "Ứng dụng cơ chế vô hiệu hóa nút bấm đặt hàng/thanh toán (disabled=loading) tại giao diện React khi đang gửi request để tránh khách hàng spam API."),
        ("Retry 3-5s", "Gateway tích hợp bộ lọc Retry cho product-service để tự động gọi lại 3 lần với khoảng cách 1-5s khi gặp sự cố tạm thời, nâng cao tính chịu lỗi (Fault Tolerance)."),
        ("Rate Limiter Server", "Cấu hình RequestRateLimiter sử dụng Redis Token Bucket tại API Gateway giới hạn lượng request cho từng API (ví dụ AI: 10/20, Product: 150/300) bảo vệ server khỏi bị quá tải."),
        ("JWT Security", "Tất cả giao dịch riêng tư đều bắt buộc đính kèm JWT Token. API Gateway giải mã và kiểm tra chữ ký token. Mật khẩu lưu trữ băm BCrypt bảo mật cao."),
        ("Scalability", "Tất cả các dịch vụ microservices được thiết kế không lưu trạng thái (Stateless), cho phép dễ dàng nhân bản mở rộng theo chiều ngang (Horizontal Scaling) bằng Load Balancer.")
    ]

    for char_title, char_desc in chars:
        p_char = doc.add_paragraph()
        run_title = p_char.add_run(f"• {char_title}: ")
        run_title.bold = True
        p_char.add_run(char_desc)
        p_char.paragraph_format.space_after = Pt(6)

    doc.add_paragraph().paragraph_format.space_after = Pt(20)

    # ---------------------------------------------------------------------------
    # SECTION 4: DEVOPS
    # ---------------------------------------------------------------------------
    h1 = doc.add_paragraph()
    h1_run = h1.add_run("4. DEVOPS & TRIỂN KHAI (DEVOPS & DEPLOYMENT)")
    h1_run.font.size = Pt(14)
    h1_run.font.bold = True
    h1_run.font.color.rgb = PRIMARY_COLOR
    h1.paragraph_format.space_before = Pt(12)
    h1.paragraph_format.space_after = Pt(8)

    doc.add_paragraph(
        "• Maintainability: Mã nguồn được thiết kế sạch sẽ, rõ ràng (Clean Code). Chia cấu trúc thư mục phân lớp chuẩn mực: "
        "Controller, Service, Repository, Entity, Config, Listener, Dto giúp dễ nâng cấp, bảo trì.\n"
        "• Docker-Compose: Tệp cấu hình docker-compose.yml đặt tại thư mục gốc cho phép khởi chạy đồng bộ toàn bộ hạ tầng gồm "
        "MySQL DB, Redis Cache, RabbitMQ Broker và 8 containers dịch vụ bằng một lệnh duy nhất: docker-compose up -d.\n"
        "• GitLab CI/CD: Dự án tích hợp pipeline CI/CD tự động (.gitlab-ci.yml) chia làm 3 stage chính: Build (biên dịch code Java JARs & Node dist), "
        "Package (đóng gói Docker images và push lên DockerHub), Deploy (SSH kết nối VPS để pull và restart các container tự động).\n"
        "• Deploy: Hệ thống được triển khai thực tế trên VPS Cloud chạy Ubuntu Linux ổn định, phân phối cổng 80 cho Client và 8080 cho Gateway."
    )

    doc.add_paragraph().paragraph_format.space_after = Pt(20)

    # ---------------------------------------------------------------------------
    # SECTION 5: ARTIFICIAL INTELLIGENCE
    # ---------------------------------------------------------------------------
    h1 = doc.add_paragraph()
    h1_run = h1.add_run("5. ỨNG DỤNG TRÍ TUỆ NHÂN TẠO (ARTIFICIAL INTELLIGENCE)")
    h1_run.font.size = Pt(14)
    h1_run.font.bold = True
    h1_run.font.color.rgb = PRIMARY_COLOR
    h1.paragraph_format.space_before = Pt(12)
    h1.paragraph_format.space_after = Pt(8)

    doc.add_paragraph(
        "• AI Apply: Hệ thống tích hợp trợ lý ảo thông minh SportyAI trực tiếp hỗ trợ khách hàng. Giúp tăng tỷ lệ chuyển đổi đơn hàng nhờ tư vấn trực tuyến.\n"
        "• AI Agent Workflow: Trợ lý SportyAI được thiết kế theo cơ chế Cognitive Agent tự hành:\n"
        "  1. Câu hỏi khách hàng được kiểm tra qua bộ luật cục bộ Rule Engine (hàm getSmartFallbackResponse()) để phản hồi ngay lập tức và miễn phí "
        "cho các chủ đề quen thuộc (size, ship, payment, hello).\n"
        "  2. Nếu không khớp luật, Agent tự động kích hoạt Cognitive Reasoning, nạp context sản phẩm của shop từ Product Service làm ngữ cảnh "
        "và gửi yêu cầu sang Google Gemini AI API để tạo câu trả lời thông minh, tự nhiên dưới định dạng Markdown hiển thị sinh động lên ChatWidget."
    )

    doc.save("Bao_Cao_Kien_Truc.docx")
    print("Report generated successfully as Bao_Cao_Kien_Truc.docx!")

if __name__ == "__main__":
    create_report()
