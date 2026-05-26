-- Xóa dữ liệu cũ để tránh trùng lặp
DELETE FROM products;
DELETE FROM categories;

-- Reset lại ID tự tăng (MySQL)
ALTER TABLE categories AUTO_INCREMENT = 1;
ALTER TABLE products AUTO_INCREMENT = 1;

-- Thêm mới 6 Loại sản phẩm (Category)
INSERT INTO categories (id, name, description) VALUES
(1, 'Giày', 'Các loại giày thể thao chuyên dụng'),
(2, 'Áo', 'Áo thun, áo khoác, áo đấu thể thao'),
(3, 'Quần', 'Quần đùi, quần dài, quần tập thể thao'),
(4, 'Vợt', 'Vợt cầu lông, vợt tennis'),
(5, 'Bóng', 'Quả bóng đá, bóng rổ, bóng chuyền, bóng tennis'),
(6, 'Phụ kiện', 'Tất, băng đô, bó gối, găng tay, balo, bình nước...');

-- Thêm 100 sản phẩm với Loại sản phẩm (category_id), Môn thể thao (sport), stock, sold_quantity
INSERT INTO products (name, price, image_url, category_id, sport, stock, sold_quantity) VALUES
-- ============================
-- MÔN: BÓNG ĐÁ
-- ============================
('Giày bóng đá Nike Mercurial Superfly 8', 3500000, 'https://images.unsplash.com/photo-1611558709798-e009c8fd7706?q=80&w=600', 1, 'Bóng đá', 50, 120),
('Giày bóng đá Adidas X Speedportal', 3200000, 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=600', 1, 'Bóng đá', 35, 95),
('Giày bóng đá Puma Future Z', 2800000, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600', 1, 'Bóng đá', 20, 60),
('Giày bóng đá Mizuno Morelia Neo III', 3800000, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600', 1, 'Bóng đá', 15, 30),
('Giày đá bóng cỏ nhân tạo Nike Tiempo', 1500000, 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=600', 1, 'Bóng đá', 100, 310),
('Giày đá bóng cỏ nhân tạo Adidas Predator', 1600000, 'https://images.unsplash.com/photo-1611558709798-e009c8fd7706?q=80&w=600', 1, 'Bóng đá', 80, 250),
('Giày bóng đá Kamito TA11', 850000, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600', 1, 'Bóng đá', 150, 420),
('Giày bóng đá Wika Neo', 450000, 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=600', 1, 'Bóng đá', 200, 680),
('Giày đá bóng Nike Phantom GX', 3400000, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600', 1, 'Bóng đá', 40, 75),
('Giày đá bóng Puma Ultra Ultimate', 2900000, 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=600', 1, 'Bóng đá', 25, 45),

('Áo bóng đá Manchester United Sân nhà 23/24', 850000, 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=600', 2, 'Bóng đá', 120, 310),
('Áo bóng đá Real Madrid Sân khách 23/24', 850000, 'https://images.unsplash.com/photo-1589182337358-2cb63099350c?q=80&w=600', 2, 'Bóng đá', 110, 280),
('Bộ quần áo đá bóng Đội tuyển Việt Nam', 500000, 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=600', 2, 'Bóng đá', 300, 1500),
('Áo bóng đá Đội tuyển Argentina', 500000, 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=600', 2, 'Bóng đá', 150, 720),
('Áo bóng đá Đội tuyển Brazil', 500000, 'https://images.unsplash.com/photo-1589182337358-2cb63099350c?q=80&w=600', 2, 'Bóng đá', 130, 410),
('Áo bib tập luyện phân đội', 40000, 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=600', 2, 'Bóng đá', 500, 1200),
('Quần short bóng đá Adidas', 350000, 'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=600', 3, 'Bóng đá', 250, 480),

('Quả bóng đá Động Lực UHV 2.07', 950000, 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?q=80&w=600', 5, 'Bóng đá', 80, 210),
('Găng tay thủ môn Adidas Predator Pro', 1800000, 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=600', 6, 'Bóng đá', 30, 85),
('Tất chống trượt bóng đá Fox', 80000, 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?q=80&w=600', 6, 'Bóng đá', 800, 2500),
('Ống đồng bảo vệ chân', 90000, 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600', 6, 'Bóng đá', 400, 950),
('Thang dây tập kỹ thuật bóng đá', 250000, 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?q=80&w=600', 6, 'Bóng đá', 100, 180),
('Nấm chiến thuật tập bóng đá', 120000, 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600', 6, 'Bóng đá', 200, 410),

-- ============================
-- MÔN: BÓNG RỔ
-- ============================
('Giày bóng rổ Nike LeBron 20', 4200000, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600', 1, 'Bóng rổ', 45, 115),
('Giày bóng rổ Under Armour Curry 10', 3900000, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600', 1, 'Bóng rổ', 40, 90),
('Giày bóng rổ Air Jordan 1 High', 5200000, 'https://images.unsplash.com/photo-1611558709798-e009c8fd7706?q=80&w=600', 1, 'Bóng rổ', 20, 210),
('Giày bóng rổ Adidas Harden Vol. 6', 3600000, 'https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=600', 1, 'Bóng rổ', 35, 75),
('Áo tank top bóng rổ Nike', 450000, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600', 2, 'Bóng rổ', 150, 340),
('Áo đấu Los Angeles Lakers', 850000, 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=600', 2, 'Bóng rổ', 80, 260),
('Quần đùi bóng rổ thụng', 350000, 'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=600', 3, 'Bóng rổ', 120, 310),
('Quả bóng rổ Spalding NBA', 800000, 'https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=600', 5, 'Bóng rổ', 60, 180),
('Quả bóng rổ Molten GG7X', 750000, 'https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=600', 5, 'Bóng rổ', 70, 150),
('Băng đô thấm mồ hôi Nike', 150000, 'https://images.unsplash.com/photo-1522845015757-50bce044e5da?q=80&w=600', 6, 'Bóng rổ', 300, 620),

-- ============================
-- MÔN: CẦU LÔNG
-- ============================
('Giày cầu lông Yonex Power Cushion', 2100000, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600', 1, 'Cầu lông', 85, 230),
('Giày cầu lông Lining Halberd', 1800000, 'https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=600', 1, 'Cầu lông', 60, 140),
('Giày cầu lông Victor P9200', 1900000, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600', 1, 'Cầu lông', 50, 110),
('Áo polo Lining cầu lông', 650000, 'https://images.unsplash.com/photo-1589182337358-2cb63099350c?q=80&w=600', 2, 'Cầu lông', 90, 210),
('Áo thun Yonex thoáng khí', 550000, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600', 2, 'Cầu lông', 120, 280),
('Quần short Lining đánh cầu', 450000, 'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=600', 3, 'Cầu lông', 140, 310),
('Váy cầu lông nữ Yonex', 480000, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600', 3, 'Cầu lông', 80, 190),
('Vợt cầu lông Yonex Astrox 99', 2500000, 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=600', 4, 'Cầu lông', 30, 95),
('Vợt cầu lông Lining Aeronaut 9000', 2800000, 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=600', 4, 'Cầu lông', 25, 75),
('Vợt cầu lông Victor Thruster', 2200000, 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=600', 4, 'Cầu lông', 40, 105),
('Quả cầu lông Vina Star (1 Hộp)', 200000, 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=600', 5, 'Cầu lông', 500, 1800),
('Cước đan vợt Yonex BG65', 130000, 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=600', 6, 'Cầu lông', 800, 2200),
('Quấn cán vợt cầu lông Yonex', 30000, 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=600', 6, 'Cầu lông', 1000, 3500),
('Ống đựng cầu lông', 80000, 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=600', 6, 'Cầu lông', 150, 410),
('Phấn hút mồ hôi tay', 120000, 'https://images.unsplash.com/photo-1522845015757-50bce044e5da?q=80&w=600', 6, 'Cầu lông', 250, 520),

-- ============================
-- MÔN: CHẠY BỘ (RUNNING)
-- ============================
('Giày chạy bộ Nike ZoomX Vaporfly', 4500000, 'https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=600', 1, 'Chạy bộ', 45, 125),
('Giày chạy bộ Adidas Ultraboost 22', 4000000, 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=600', 1, 'Chạy bộ', 55, 160),
('Giày chạy bộ Asics Gel-Nimbus 25', 4100000, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600', 1, 'Chạy bộ', 35, 95),
('Giày chạy bộ Biti’s Hunter X', 1100000, 'https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=600', 1, 'Chạy bộ', 150, 680),
('Giày chạy trail Salomon Speedcross', 3500000, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600', 1, 'Chạy bộ', 25, 45),
('Áo thun chạy bộ nam Nike Dri-FIT', 450000, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600', 2, 'Chạy bộ', 200, 430),
('Áo bra chạy bộ nữ Adidas Aeroready', 400000, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600', 2, 'Chạy bộ', 150, 310),
('Áo khoác chạy bộ chống nước', 650000, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600', 2, 'Chạy bộ', 80, 160),
('Áo chống nắng chạy bộ UV', 550000, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600', 2, 'Chạy bộ', 120, 240),
('Quần dài chạy bộ Nike Flex', 750000, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600', 3, 'Chạy bộ', 100, 185),
('Quần đùi chạy bộ nữ 2 lớp', 250000, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600', 3, 'Chạy bộ', 180, 420),
('Đai chạy bộ đựng điện thoại', 150000, 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=600', 6, 'Chạy bộ', 250, 510),
('Kính râm chạy bộ', 450000, 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?q=80&w=600', 6, 'Chạy bộ', 90, 135),
('Mũ lưỡi trai chạy bộ Adidas', 350000, 'https://images.unsplash.com/photo-1522845015757-50bce044e5da?q=80&w=600', 6, 'Chạy bộ', 120, 260),
('Đồng hồ thể thao Garmin Forerunner', 6500000, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600', 6, 'Chạy bộ', 15, 35),
('Bình nước mềm chạy bộ 500ml', 200000, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=600', 6, 'Chạy bộ', 200, 450),

-- ============================
-- MÔN: TENNIS
-- ============================
('Giày tennis Wilson Rush Pro', 2900000, 'https://images.unsplash.com/photo-1611558709798-e009c8fd7706?q=80&w=600', 1, 'Tennis', 50, 95),
('Giày tennis Asics Gel-Resolution', 3100000, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600', 1, 'Tennis', 45, 110),
('Giày tennis Nike Vapor Pro', 3300000, 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=600', 1, 'Tennis', 35, 80),
('Áo polo tennis Babolat', 650000, 'https://images.unsplash.com/photo-1589182337358-2cb63099350c?q=80&w=600', 2, 'Tennis', 80, 160),
('Áo thun tennis Head', 500000, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600', 2, 'Tennis', 100, 220),
('Váy tennis nữ xếp ly', 450000, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600', 3, 'Tennis', 120, 275),
('Quần short tennis nam', 400000, 'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=600', 3, 'Tennis', 150, 310),
('Vợt tennis Babolat Pure Drive', 3800000, 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=600', 4, 'Tennis', 25, 65),
('Vợt tennis Wilson Pro Staff', 4200000, 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=600', 4, 'Tennis', 20, 50),
('Vợt tennis Head Speed', 3900000, 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=600', 4, 'Tennis', 30, 85),
('Quả bóng tennis Wilson (Hộp 4 quả)', 180000, 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?q=80&w=600', 5, 'Tennis', 300, 950),
('Quả bóng tennis Dunlop (Hộp 3 quả)', 150000, 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?q=80&w=600', 5, 'Tennis', 350, 1100),
('Cước đan vợt tennis Luxilon', 250000, 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=600', 6, 'Tennis', 400, 820),
('Quấn cán vợt tennis', 40000, 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=600', 6, 'Tennis', 600, 1600),
('Túi đựng vợt tennis Wilson 6 ngăn', 900000, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600', 6, 'Tennis', 40, 115);
