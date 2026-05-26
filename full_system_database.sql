-- ==========================================================
-- SCRIPT XOÁ VÀ TẠO LẠI TOÀN BỘ DATABASE TỪ ĐẦU (FULL RESET)
-- ==========================================================

-- ==========================================================
-- 1. DATABASE CHO AUTH SERVICE (Port 8081)
-- ==========================================================
DROP DATABASE IF EXISTS auth_db;
CREATE DATABASE auth_db;
USE auth_db;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    role VARCHAR(50) DEFAULT 'ROLE_USER'
);

-- Tài khoản test mặc định (password: 123456)
INSERT INTO users (id, username, password, email, role) VALUES 
(1, 'admin', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.7uHowLi', 'admin@shop-sport.com', 'ROLE_ADMIN'),
(2, 'user1', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.7uHowLi', 'user1@gmail.com', 'ROLE_USER');


-- ==========================================================
-- 2. DATABASE CHO PRODUCT SERVICE (Port 8082)
-- ==========================================================
DROP DATABASE IF EXISTS product_db;
CREATE DATABASE product_db;
USE product_db;

CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DOUBLE NOT NULL,
    stock INT DEFAULT 0,
    image_url VARCHAR(1000),
    sport VARCHAR(255),
    category_id BIGINT,
    sold_quantity INT DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255),
    content TEXT,
    rating INT,
    created_at DATETIME,
    product_id BIGINT,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Insert categories
INSERT INTO categories (id, name, description) VALUES 
(1, 'Giày', 'Giày thể thao các loại'),
(2, 'Áo', 'Áo thể thao chất lượng cao'),
(3, 'Quần', 'Quần đùi, quần dài tập luyện'),
(4, 'Vợt', 'Vợt cầu lông, vợt tennis chuyên nghiệp'),
(5, 'Bóng', 'Bóng đá, bóng rổ thi đấu'),
(6, 'Phụ kiện', 'Tất, balo, đai chạy bộ, quấn cán');

-- Insert san pham voi anh THAT 100% va thong so sold_quantity, stock, sport
INSERT INTO products (name, description, price, stock, image_url, sport, category_id, sold_quantity) VALUES
-- SOCCER (Bóng đá) - 20 products
('Giày Nike Mercurial Vapor 15 Elite FG', 'Giày đá bóng cỏ tự nhiên cao cấp Elite FG', 6500000, 30, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/6e254825-e316-4afe-bd7e-5cce856818bb/ZOOM%2BVAPOR%2B15%2BELITE%2BFG.png', 'Bóng đá', 1, 120),
('Giày Adidas Predator Accuracy.3 TF', 'Kiểm soát bóng tối ưu - Core Black', 2200000, 25, 'https://assets.adidas.com/images/w_600,f_auto,q_auto/8a691408efc2407996feaf5d01153022_9366/Predator_Accuracy.3_Turf_Boots_Black_GW7080_22_model.jpg', 'Bóng đá', 1, 85),
('Áo đấu Real Madrid Home 24/25', 'Áo thi đấu sân nhà chính hãng Adidas', 2200000, 50, 'https://assets.adidas.com/images/w_600,f_auto,q_auto/78b62417f1e042aeb25e3353d278de3b_9366/Ao_DJau_San_Nha_Authentic_Real_Madrid_24-25_trang_IX8095_HM1.jpg', 'Bóng đá', 2, 250),
('Quả bóng Adidas Euro 2024', 'Bóng thi đấu chính thức Fussballliebe', 3500000, 40, 'https://product.hstatic.net/1000061481/product/tai_xuong__85__ea85d0569ec4440c981723b18a487c7e_master_b3200e9a8d54470eb863ac0596c45bb5_1024x1024.jpg', 'Bóng đá', 5, 40),
('Tất bóng đá Nike Grip Strike', 'Tất chống trượt chuyên nghiệp Nike Strike', 450000, 200, 'https://product.hstatic.net/1000061481/product/291bc0957a8146c8b412b36c009ddb61_1c87980d01934ae2b8fee568d1b90961_master.jpeg', 'Bóng đá', 6, 500),
('Giày Puma Future Ultimate FG/AG', 'Kiểm soát trận đấu với thế hệ Future mới nhất', 5800000, 18, 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/107355/01/sv01/fnd/EEA/fmt/png', 'Bóng đá', 1, 92),
('Giày Nike Phantom GX II Academy TF', 'Cảm giác bóng tuyệt vời trên sân cỏ nhân tạo', 2400000, 35, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/4b3c7b39-8ce5-4b36-a197-28d8b9bbffae/phantom-gx-2-academy-tf-low-top-football-boot-h9cQJv.png', 'Bóng đá', 1, 140),
('Giày Adidas Copa Pure.2 Elite FG', 'Chất liệu da cao cấp, ôm chân hoàn hảo', 4800000, 15, 'https://assets.adidas.com/images/w_600,f_auto,q_auto/a4bd0bf04de84b659c0490b4d4554b73_9366/Giay_Da_Bong_Copa_Pure.2_Elite_Firm_Ground_trang_IE7488_01_standard.jpg', 'Bóng đá', 1, 60),
('Áo thun tập luyện Nike Dri-FIT Academy', 'Công nghệ thấm hút mồ hôi, co giãn tối đa', 750000, 80, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/db15d481-9b1f-4cb1-97b7-5a1ecf15d2a8/dri-fit-academy-football-top-jBq1qC.png', 'Bóng đá', 2, 320),
('Quần short bóng đá Adidas Squadra 21', 'Chất liệu tái chế Aeroready thân thiện môi trường', 500000, 120, 'https://assets.adidas.com/images/w_600,f_auto,q_auto/9d77e4cfcfc24e4d8fb8ac710116f194_9366/Quan_Short_Squadra_21_DJen_GN5776_01_laydown.jpg', 'Bóng đá', 3, 410),
('Áo đấu Manchester United Home 24/25', 'Áo đấu Quỷ Đỏ sân nhà bản mới nhất', 2200000, 60, 'https://assets.adidas.com/images/w_600,f_auto,q_auto/c627b03657cb484d85208f0a6d5952d7_9366/Ao_DJau_San_Nha_Manchester_United_24-25_DJo_IT1968_HM1.jpg', 'Bóng đá', 2, 280),
('Áo đấu Arsenal Home 24/25', 'Phiên bản thi đấu sân nhà pháo thủ Emirates', 2200000, 45, 'https://assets.adidas.com/images/w_600,f_auto,q_auto/e1cb02722b514d3da9f4ff89658ee042_9366/Ao_DJau_San_Nha_Authentic_Arsenal_24-25_Do_IT6142_HM1.jpg', 'Bóng đá', 2, 190),
('Bọc ống đồng Nike Mercurial Lite', 'Bảo vệ ống chân siêu nhẹ, đàn hồi tốt', 650000, 90, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/cbfbdec6-11f8-410a-83eb-5fa7a14e9e04/mercurial-lite-football-shin-guards-p2jQ1D.png', 'Bóng đá', 6, 210),
('Găng tay thủ môn Adidas Predator Pro', 'Độ bám dính cực đỉnh trong mọi thời tiết', 3200000, 10, 'https://assets.adidas.com/images/w_600,f_auto,q_auto/dc0460c5cb2f43cdb71cafd2008fb539_9366/Gang_Tay_Thu_Mon_Predator_Pro_Xanh_la_IA0862_01_laydown.jpg', 'Bóng đá', 6, 35),
('Quả bóng Puma Orbita La Liga 1', 'Bóng thi đấu chính thức tại giải vô địch Tây Ban Nha', 3400000, 15, 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/084105/01/fnd/EEA/fmt/png', 'Bóng đá', 5, 28),
('Quần short bóng đá Nike Dri-FIT Strike', 'Vải dệt cao cấp, hỗ trợ bứt tốc vượt trội', 850000, 70, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/6ecbe248-be22-482a-bc91-91a59051fb86/dri-fit-strike-football-shorts-S7bN8M.png', 'Bóng đá', 3, 160),
('Balo bóng đá Nike Academy Team', 'Ngăn chứa giày riêng biệt, dung tích 30L rộng rãi', 1200000, 40, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/df97cf64-325d-4f18-b2a8-12d8a0c28330/academy-team-football-backpack-30l-wDrqDq.png', 'Bóng đá', 6, 85),
('Giày Puma King Top FG', 'Huyền thoại da thật êm ái cổ điển', 3900000, 12, 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/105607/01/sv01/fnd/EEA/fmt/png', 'Bóng đá', 1, 40),
('Áo khoác bóng đá Adidas Tiro 23', 'Phong cách thể thao đường phố năng động', 1800000, 30, 'https://assets.adidas.com/images/w_600,f_auto,q_auto/e6f1406e2ea84b6fba30af5d00fc1665_9366/Ao_Khoac_Tap_Luyen_Tiro_23_League_Xanh_duong_HS7489_01_laydown.jpg', 'Bóng đá', 2, 75),
('Bơm bóng mini Adidas Pocket Pump', 'Nhỏ gọn, tiện lợi mang theo mọi lúc mọi nơi', 350000, 150, 'https://assets.adidas.com/images/w_600,f_auto,q_auto/01f41d3b07114cf39e76adf700c9ccbd_9366/Bom_Tay_Tiro_Den_HN8169_01_laydown.jpg', 'Bóng đá', 6, 120),

-- BASKETBALL (Bóng rổ) - 20 products
('Giày Jordan 1 Retro High OG', 'Biểu tượng văn hóa sát thủ OG High huyền thoại', 5500000, 15, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto,q_auto:eco/e9f39007-8854-4632-9c3f-c30983d8e579/air-jordan-1-retro-high-og-shoes-G9p6pL.png', 'Bóng rổ', 1, 210),
('Giày Nike LeBron XXI', 'Sức mạnh và tốc độ của Nhà vua LeBron James', 4900000, 20, 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/e94411f1-3ecf-45b6-b520-25da502e97aa/lebron-xxi-queen-conch-basketball-shoes-v4VstW.png', 'Bóng rổ', 1, 95),
('Áo Jersey Lakers - LeBron James', 'Áo đấu Los Angeles Lakers số 23 Icon Edition', 2800000, 30, 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/be991ec7-53c8-472e-9d21-f050b1626084/los-angeles-lakers-icon-edition-2022-23-dri-fit-nba-swingman-jersey-6MvVd0.png', 'Bóng rổ', 2, 150),
('Quả bóng rổ Wilson NBA Official', 'Bóng thi đấu chính thức NBA từ Wilson', 3200000, 25, 'https://images.wilson.com/f_auto,q_auto/v1/wilson/products/basketball/ball/nba/official-game-ball/wtb7500id-side.jpg', 'Bóng rổ', 5, 60),
('Giày Adidas Dame 8 EXTPLY', 'Giày bóng rổ chữ ký Damian Lillard', 3600000, 14, 'https://assets.adidas.com/images/w_600,f_auto,q_auto/e6ea87ba8d6c4a30a7d5af80011bbad7_9366/Giay_Dame_8_EXTPLY_trang_ID5676_01_standard.jpg', 'Bóng rổ', 1, 48),
('Giày Puma MB.03 LaFrance', 'Giày bóng rổ siêu cá tính của LaMelo Ball', 4200000, 10, 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/379231/01/sv01/fnd/EEA/fmt/png', 'Bóng rổ', 1, 74),
('Áo Jersey Golden State Warriors - Curry', 'Áo thi đấu Stephen Curry số 30 chính hãng', 2800000, 22, 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/3b679469-42b7-4c74-9f44-777085ef72b4/golden-state-warriors-icon-edition-dri-fit-nba-swingman-jersey-hJxlM8.png', 'Bóng rổ', 2, 110),
('Quần short bóng rổ Nike Dri-FIT Elite', 'Vải lưới thoáng khí, tối ưu cử động nhảy', 1100000, 50, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/df30e84b-f73b-48c0-bc66-3d237b607062/dri-fit-elite-mens-nba-basketball-shorts.png', 'Bóng rổ', 3, 145),
('Quả bóng rổ Wilson Evolution', 'Bóng da vi sợi được yêu thích nhất tại các phòng tập', 1950000, 40, 'https://images.wilson.com/f_auto,q_auto/v1/wilson/products/basketball/ball/evolution/wtb0516-angled.jpg', 'Bóng rổ', 5, 180),
('Vớ bóng rổ Nike Elite Crew', 'Đệm chân dày, chống trượt chấn thương', 420000, 150, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/6ecbe248-be22-482a-bc91-91a59051fb86/dri-fit-strike-football-shorts-S7bN8M.png', 'Bóng rổ', 6, 320),
('Giày Nike Giannis Immortality 3', 'Phong cách quái thú Hy Lạp, bám sân cực tốt', 2500000, 18, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/354b3ea5-b590-4826-b816-efc4e97a3a60/giannis-immortality-3-basketball-shoes-v4VstW.png', 'Bóng rổ', 1, 80),
('Giày Adidas Harden Vol 8', 'Đột phá thiết kế hiện đại cùng James Harden', 4500000, 12, 'https://assets.adidas.com/images/w_600,f_auto,q_auto/a4bd0bf04de84b659c0490b4d4554b73_9366/IE7488_01_standard.jpg', 'Bóng rổ', 1, 55),
('Băng chặn mồ hôi đầu Nike NBA', 'Chất liệu thun co giãn thêu logo NBA nổi tiếng', 350000, 100, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/4b3c7b39-8ce5-4b36-a197-28d8b9bbffae/nba-headband.png', 'Bóng rổ', 6, 175),
('Balo bóng rổ Nike Elite Pro', 'Thiết kế mở nắp túi dạng vali tiện dụng', 2400000, 25, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/b5a411f1-3ecf-45b6-b520-25da502e97aa/elite-pro-backpack.png', 'Bóng rổ', 6, 68),
('Áo hoodie bóng rổ Nike Standard Issue', 'Giữ ấm cơ thể hoàn hảo ngoài sân bóng', 2100000, 30, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/e94411f1-3ecf-45b6-b520-25da502e97aa/dri-fit-standard-issue-hoodie.png', 'Bóng rổ', 2, 45),
('Quần đùi bóng rổ Adidas Crossover', 'Chất vải thể thao nhẹ, thông thoáng tuyệt đối', 1200000, 45, 'https://assets.adidas.com/images/w_600,f_auto,q_auto/78b62417f1e042aeb25e3353d278de3b_9366/Crossover_Shorts.jpg', 'Bóng rổ', 3, 90),
('Giày Jordan Tatum 2', 'Thiết kế tối ưu trọng lượng của Jayson Tatum', 3900000, 14, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/6ecbe248-be22-482a-bc91-91a59051fb86/tatum-2-basketball-shoes.png', 'Bóng rổ', 1, 62),
('Giày Nike KD16', 'Bảo vệ gót chân và phản hồi năng lượng tối đa', 4200000, 16, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/e9f39007-8854-4632-9c3f-c30983d8e579/kd16-basketball-shoes.png', 'Bóng rổ', 1, 88),
('Lưới vành rổ Wilson Heavy Duty', 'Lưới dù cao cấp chống chịu mọi thời tiết ngoài trời', 450000, 60, 'https://images.wilson.com/f_auto,q_auto/v1/wilson/products/basketball/accessories/net/wtb7500id-net.jpg', 'Bóng rổ', 6, 130),
('Quả bóng rổ Nike Everyday Playground', 'Bóng cao su bền bỉ chuyên chơi sân Outdoor', 600000, 80, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/3b679469-42b7-4c74-9f44-777085ef72b4/everyday-playground-basketball.png', 'Bóng rổ', 5, 210),

-- BADMINTON (Cầu lông) - 20 products
('Vợt Yonex Astrox 100ZZ Kurenai', 'Siêu phẩm tấn công huyền thoại Kurenai chính hãng', 4500000, 10, 'https://yoneverest.com/wp-content/uploads/2021/05/Yonex-Astrox-100-ZZ-Kurenai.jpg', 'Cầu lông', 4, 75),
('Giày Yonex Power Cushion 65Z3', 'Giày cầu lông êm ái, bám sân cực tốt bản White Tiger', 3200000, 20, 'https://www.badmintonwarehouse.com/cdn/shop/products/Yonex-Power-Cushion-65-Z-3-Unisex-Badminton-Court-Shoes-White-Tiger-1_1024x1024.jpg?v=1655844458', 'Cầu lông', 1, 110),
('Vợt Yonex Nanoflare 1000Z', 'Dòng vợt tốc độ, phản tạt nhanh nhẹ nhất lịch sử', 4800000, 12, 'https://shopvnb.com/uploads/gallery/vot-cau-long-yonex-nanoflare-1000z-chinh-hang.jpg', 'Cầu lông', 4, 85),
('Áo thun cầu lông Yonex Tournament', 'Chất liệu TruBreeze thoáng mát, thấm mồ hôi siêu tốc', 790000, 40, 'https://shopvnb.com/uploads/gallery/ao-cau-long-yonex-tournament-chinh-hang.jpg', 'Cầu lông', 2, 195),
('Quần short cầu lông Yonex TruBreeze', 'Thiết kế gọn gàng, co giãn tốt cho các pha cứu cầu', 550000, 50, 'https://shopvnb.com/uploads/gallery/quan-short-cau-long-yonex-trubreeze.jpg', 'Cầu lông', 3, 140),
('Vợt Yonex Astrox 88D Pro', 'Dành cho người chơi thiên công ở nửa sân sau', 4200000, 8, 'https://shopvnb.com/uploads/gallery/vot-cau-long-yonex-astrox-88d-pro-chinh-hang.jpg', 'Cầu lông', 4, 66),
('Vợt Yonex Arcsaber 11 Pro', 'Vợt điều cầu kiểm soát toàn diện trận đấu', 4400000, 15, 'https://shopvnb.com/uploads/gallery/vot-cau-long-yonex-arcsaber-11-pro-chinh-hang.jpg', 'Cầu lông', 4, 90),
('Giày Yonex Power Cushion Eclipsion Z3', 'Dòng giày bảo vệ cổ chân và chống lật cổ chân', 3500000, 16, 'https://shopvnb.com/uploads/gallery/giay-cau-long-yonex-eclipsion-z3-chinh-hang.jpg', 'Cầu lông', 1, 52),
('Bao vợt cầu lông Yonex Pro Bag', 'Dung tích chứa được tới 9 cây vợt kèm ngăn giày riêng', 2100000, 15, 'https://shopvnb.com/uploads/gallery/bao-vot-cau-long-yonex-pro-bag.jpg', 'Cầu lông', 6, 38),
('Quấn cán vợt Yonex Super Grap', 'Sản xuất tại Nhật Bản, độ bám tay tuyệt hảo', 150000, 300, 'https://shopvnb.com/uploads/gallery/quan-can-yonex-super-grap.jpg', 'Cầu lông', 6, 850),
('Hộp quả cầu lông Yonex Aerosensa 50', 'Cầu thi đấu chính thức tại các giải quốc tế lớn', 650000, 80, 'https://shopvnb.com/uploads/gallery/qua-cau-long-yonex-as50.jpg', 'Cầu lông', 6, 420),
('Dây cước căng vợt Yonex BG66 Ultimax', 'Cước cầu lông trợ lực cao, tiếng nổ đanh giòn', 220000, 200, 'https://shopvnb.com/uploads/gallery/cuoc-cang-vot-yonex-bg66.jpg', 'Cầu lông', 6, 950),
('Băng chặn mồ hôi cổ tay Yonex', 'Giúp ngăn mồ hôi chảy xuống tay cầm vợt hiệu quả', 120000, 120, 'https://shopvnb.com/uploads/gallery/bang-co-tay-yonex.jpg', 'Cầu lông', 6, 210),
('Áo khoác cầu lông Yonex Team', 'Giữ ấm cơ thể trước và sau khi ra sân', 1400000, 25, 'https://shopvnb.com/uploads/gallery/ao-khoac-yonex-team.jpg', 'Cầu lông', 2, 55),
('Giày Yonex Power Cushion Comfort Z3', 'Độ êm tối đa nhờ lớp đệm cushion dày đặc', 3800000, 10, 'https://shopvnb.com/uploads/gallery/giay-yonex-comfort-z3.jpg', 'Cầu lông', 1, 48),
('Vợt Yonex Nanoflare 800 Pro', 'Vợt thân cứng phản tạt tì đè lưới cực đỉnh', 4300000, 12, 'https://shopvnb.com/uploads/gallery/vot-yonex-nanoflare-800.jpg', 'Cầu lông', 4, 73),
('Vợt Yonex Astrox 99 Pro', 'Vợt nặng đầu chuyên công, smash uy lực như sấm sét', 4600000, 8, 'https://shopvnb.com/uploads/gallery/vot-yonex-astrox-99.jpg', 'Cầu lông', 4, 60),
('Quần short Nike Court Dri-FIT', 'Quần thun co giãn đa hướng thích hợp chạy nhảy', 890000, 35, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/court-shorts.png', 'Cầu lông', 3, 105),
('Áo polo Nike Court Dri-FIT', 'Áo cổ bẻ lịch lãm sang trọng khi lên sân', 1100000, 30, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/court-polo.png', 'Cầu lông', 2, 85),
('Tất cầu lông Yonex 3D Ergo', 'Thiết kế dệt ôm khít ngón chân trái phải riêng biệt', 180000, 140, 'https://shopvnb.com/uploads/gallery/tat-yonex-3d-ergo.jpg', 'Cầu lông', 6, 310),

-- RUNNING (Chạy bộ) - 20 products
('Giày Nike Air Zoom Pegasus 40', 'Dòng giày chạy quốc dân bền bỉ, êm ái cho mọi cự ly', 3800000, 45, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/3a5b3ea5-b590-4826-b816-efc4e97a3a60/air-zoom-pegasus-40.png', 'Chạy bộ', 1, 410),
('Giày Adidas Ultraboost Light', 'Đệm Boost cải tiến siêu nhẹ, phản hồi lực tối đa', 5200000, 30, 'https://assets.adidas.com/images/w_600,f_auto,q_auto/a4bd0bf04de84b659c0490b4d4554b73_9366/Ultraboost_Light_Shoes.jpg', 'Chạy bộ', 1, 280),
('Giày Nike Vaporfly 3', 'Siêu giày đua carbon giúp phá kỷ lục cá nhân Marathon', 6900000, 15, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/6ecbe248-be22-482a-bc91-91a59051fb86/vaporfly-3-running-shoes.png', 'Chạy bộ', 1, 190),
('Áo thun chạy bộ Nike Dri-FIT Miler', 'Chất vải mỏng nhẹ mát lạnh, giảm thiểu ma sát da', 850000, 90, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/dri-fit-miler-running-top.png', 'Chạy bộ', 2, 380),
('Quần short chạy bộ Adidas Own The Run', 'Tích hợp túi nhỏ đựng chìa khóa, chất liệu khô nhanh', 700000, 110, 'https://assets.adidas.com/images/w_600,f_auto,q_auto/9d77e4cfcfc24e4d8fb8ac710116f194_9366/Own_The_Run_Shorts.jpg', 'Chạy bộ', 3, 290),
('Giày Puma Deviate Nitro 2', 'Đệm bọt Nitro Elite phản hồi năng lượng xuất sắc', 4100000, 20, 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/376807/01/sv01/fnd/EEA/fmt/png', 'Chạy bộ', 1, 85),
('Giày Nike Alphafly 3', 'Ông vua của đường chạy marathon thế giới', 8200000, 10, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/e94411f1-3ecf-45b6-b520-25da502e97aa/alphafly-3-running-shoes.png', 'Chạy bộ', 1, 75),
('Giày Adidas Boston 12', 'Giày luyện tập cự ly dài bền bỉ có thanh carbon hỗ trợ', 3800000, 25, 'https://assets.adidas.com/images/w_600,f_auto,q_auto/dc0460c5cb2f43cdb71cafd2008fb539_9366/Adizero_Boston_12_Shoes.jpg', 'Chạy bộ', 1, 130),
('Quần short 2-trong-1 Nike Trail', 'Quần short có lớp lót bó cơ hỗ trợ chạy địa hình', 1200000, 40, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/nike-trail-shorts.png', 'Chạy bộ', 3, 115),
('Đai đeo bụng chạy bộ Nike Slim Waistpack', 'Thiết kế mỏng nhẹ không rung lắc khi chạy cự ly dài', 550000, 80, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/slim-waistpack.png', 'Chạy bộ', 6, 210),
('Bình nước cầm tay thể thao Nike', 'Thiết kế van chống rò rỉ nước, dung tích 500ml tiện lợi', 450000, 150, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/tr-hypercharge-bottle.png', 'Chạy bộ', 6, 320),
('Mũ lưỡi trai chạy bộ Adidas Superlite', 'Vải thoáng khí thoát mồ hôi nhanh bảo vệ mắt khỏi nắng', 500000, 120, 'https://assets.adidas.com/images/w_600,f_auto,q_auto/78b62417f1e042aeb25e3353d278de3b_9366/Crossover_Shorts.jpg', 'Chạy bộ', 6, 260),
('Vớ cổ ngắn chạy bộ Nike Spark', 'Mỏng nhẹ thông thoáng, bảo vệ bàn chân khỏi phồng rộp', 380000, 180, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/spark-socks.png', 'Chạy bộ', 6, 450),
('Áo gió chạy bộ Nike Windrunner', 'Chống mưa nhỏ và gió lạnh, siêu nhẹ có thể xếp gọn', 2500000, 30, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/windrunner-jacket.png', 'Chạy bộ', 2, 98),
('Giày Puma Velocity Nitro 3', 'Sự kết hợp hoàn hảo giữa đệm êm và độ bám dính cao', 3200000, 22, 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/308007/01/sv01/fnd/EEA/fmt/png', 'Chạy bộ', 1, 62),
('Áo singlet chạy bộ Adidas Adizero', 'Trọng lượng siêu nhẹ cho cảm giác mặc như không mặc', 950000, 60, 'https://assets.adidas.com/images/w_600,f_auto,q_auto/club-polo-tennis.jpg', 'Chạy bộ', 2, 110),
('Quần bó cơ dài chạy bộ Nike Dri-FIT ADV', 'Hỗ trợ tuần hoàn máu cơ bắp hiệu quả cho runner', 1800000, 25, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/dri-fit-adv-tights.png', 'Chạy bộ', 3, 50),
('Băng chặn mồ hôi trán Puma Running', 'Chất liệu thun mềm mại, giữ khô trán trong thời gian dài', 250000, 90, 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/054117/01/fnd/EEA/fmt/png', 'Chạy bộ', 6, 185),
('Giày Adidas Adizero Adios Pro 3', 'Mẫu giày chinh phục các giải chạy lớn toàn cầu', 6500000, 12, 'https://assets.adidas.com/images/w_600,f_auto,q_auto/Predator_Accuracy.3_Turf_Boots_Black_GW7080_22_model.jpg', 'Chạy bộ', 1, 95),
('Balo Vest nước chạy bộ Nike Kiger', 'Thiết kế thông minh ôm khít lưng kèm hai bình nước mềm', 3200000, 15, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/kiger-running-vest.png', 'Chạy bộ', 6, 40),

-- TENNIS (Quần vợt) - 20 products
('Vợt Tennis Wilson Pro Staff 97 v14', 'Dòng vợt kiểm soát huyền thoại được huyền thoại khuyên dùng', 5900000, 12, 'https://images.wilson.com/f_auto,q_auto/v1/wilson/products/tennis/rackets/pro-staff/wr125811u_0_pro_staff_97_v14.jpg', 'Tennis', 4, 35),
('Vợt Tennis Wilson Clash 100 v2', 'Dòng vợt uốn cong tối ưu thân thiện tối đa với cổ tay', 5600000, 15, 'https://images.wilson.com/f_auto,q_auto/v1/wilson/products/tennis/rackets/clash/wr074011u_0_clash_100_v2.jpg', 'Tennis', 4, 48),
('Giày Tennis Nike Court Vapor Pro 2', 'Độ bám sân đất nện xuất sắc, linh hoạt bứt tốc', 3900000, 25, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/3a5b3ea5-b590-4826-b816-efc4e97a3a60/vapor-pro-2-tennis-shoes.png', 'Tennis', 1, 80),
('Giày Tennis Adidas Barricade 13', 'Vua của độ bền bỉ bảo vệ tối đa bàn chân khi trượt sân', 3950000, 20, 'https://assets.adidas.com/images/w_600,f_auto,q_auto/a4bd0bf04de84b659c0490b4d4554b73_9366/Barricade_13_Tennis_Shoes.jpg', 'Tennis', 1, 95),
('Áo Polo Tennis Adidas Club Aeroready', 'Kiểu dáng thể thao lịch lãm, công nghệ làm mát ưu việt', 950000, 50, 'https://assets.adidas.com/images/w_600,f_auto,q_auto/club-polo-tennis.jpg', 'Tennis', 2, 140),
('Quần short Tennis Nike Court Advantage', 'Quần short co giãn cao có ngăn đựng bóng tennis tiện lợi', 1150000, 45, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/court-advantage-shorts.png', 'Tennis', 3, 112),
('Hộp 4 quả bóng Tennis Wilson US Open', 'Bóng thi đấu chính thức tại giải Mỹ mở rộng', 180000, 200, 'https://images.wilson.com/f_auto,q_auto/v1/wilson/products/tennis/balls/us-open/wrt106200_us_open_ball.jpg', 'Tennis', 5, 620),
('Bao vợt Tennis Wilson Super Tour 15 PK', 'Chứa tới 15 cây vợt với công nghệ cách nhiệt hiện đại', 3200000, 10, 'https://images.wilson.com/f_auto,q_auto/v1/wilson/products/tennis/bags/super-tour/wr8021901001_super_tour_15_pack.jpg', 'Tennis', 6, 25),
('Vợt Tennis Wilson Blade 98 v9', 'Độ chính xác tuyệt đối, cảm giác bóng chân thật nhất', 5800000, 14, 'https://images.wilson.com/f_auto,q_auto/v1/wilson/products/tennis/rackets/blade/wr149811u_0_blade_98_16x19_v9.jpg', 'Tennis', 4, 55),
('Vợt Tennis Wilson Ultra 100 v4', 'Khả năng bùng nổ sức mạnh dễ dàng cho người chơi bán chuyên', 5500000, 18, 'https://images.wilson.com/f_auto,q_auto/v1/wilson/products/tennis/rackets/ultra/wr089711u_0_ultra_100_v4.jpg', 'Tennis', 4, 70),
('Giày Tennis Nike Court Zoom Lite 3', 'Giày tennis phổ thông nhẹ nhàng, êm ái cho người mới chơi', 2100000, 30, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/zoom-lite-3-tennis-shoes.png', 'Tennis', 1, 130),
('Giày Tennis Adidas Defiant Speed', 'Linh hoạt, trọng lượng siêu nhẹ bứt tốc cứu bóng nhanh', 3100000, 22, 'https://assets.adidas.com/images/w_600,f_auto,q_auto/defiant-speed-shoes.jpg', 'Tennis', 1, 88),
('Áo phông thể thao Tennis Nike Court', 'Chất cotton pha cao cấp mịn màng thấm hút tốt', 850000, 70, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/court-mens-tennis-tshirt.png', 'Tennis', 2, 195),
('Quần short Tennis Adidas Ergo', 'Quần short thiết kế cắt may ergonomic hỗ trợ di chuyển rộng', 1100000, 60, 'https://assets.adidas.com/images/w_600,f_auto,q_auto/ergo-shorts-tennis.jpg', 'Tennis', 3, 150),
('Hộp 4 quả bóng Tennis Wilson Championship', 'Bóng tập luyện bền bỉ có độ nảy ổn định cực cao', 150000, 300, 'https://images.wilson.com/f_auto,q_auto/v1/wilson/products/tennis/balls/championship/wrt100100_championship_ball.jpg', 'Tennis', 5, 840),
('Balo Tennis Wilson Blade Super Tour', 'Thiết kế sang trọng tinh tế vừa vặn cho 2 cây vợt và phụ kiện', 2100000, 15, 'https://images.wilson.com/f_auto,q_auto/v1/wilson/products/tennis/bags/super-tour/wr8022401001_blade_backpack.jpg', 'Tennis', 6, 68),
('Giày Tennis Nike Court GP Turbo', 'Lớp đệm Zoom Air toàn phần êm ái nhất phân khúc', 3800000, 15, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/gp-turbo-tennis-shoes.png', 'Tennis', 1, 45),
('Quấn cán vợt Tennis Wilson Pro Overgrip', 'Được tin dùng bởi Roger Federer cho độ êm ái tối đa', 150000, 400, 'https://images.wilson.com/f_auto,q_auto/v1/wilson/products/tennis/accessories/overgrip/wrz401400_pro_overgrip.jpg', 'Tennis', 6, 950),
('Băng chặn mồ hôi đầu Wilson Headband', 'Chống mồ hôi rơi vào mắt khi vận động cường độ cao', 280000, 120, 'https://images.wilson.com/f_auto,q_auto/v1/wilson/products/tennis/accessories/headband/headband.jpg', 'Tennis', 6, 175),
('Giảm chấn dây vợt Tennis Wilson Pro Feel', 'Triệt tiêu rung động có hại truyền từ vợt vào tay', 180000, 200, 'https://images.wilson.com/f_auto,q_auto/v1/wilson/products/tennis/accessories/dampener/wrz537600_pro_feel.jpg', 'Tennis', 6, 310);


-- ==========================================================
-- 3. DATABASE CHO ORDER SERVICE (Port 8083)
-- ==========================================================
DROP DATABASE IF EXISTS order_db;
CREATE DATABASE order_db;
USE order_db;

CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    total_amount DOUBLE,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT,
    product_id BIGINT,
    name VARCHAR(255),
    price DOUBLE,
    quantity INT,
    size VARCHAR(20),
    image_url VARCHAR(1000),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);


-- ==========================================================
-- 4. DATABASE CHO PAYMENT SERVICE (Port 8084)
-- ==========================================================
DROP DATABASE IF EXISTS payment_db;
CREATE DATABASE payment_db;
USE payment_db;

CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    amount DOUBLE NOT NULL,
    payment_method VARCHAR(100),
    username VARCHAR(255),
    status VARCHAR(50),
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================================
-- 5. DATABASE CHO CHAT SERVICE (Port 8086)
-- ==========================================================
DROP DATABASE IF EXISTS chat_db;
CREATE DATABASE chat_db;
USE chat_db;

CREATE TABLE chat_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender VARCHAR(255),
    receiver VARCHAR(255),
    content TEXT,
    order_id BIGINT,
    timestamp DATETIME(6)
);
