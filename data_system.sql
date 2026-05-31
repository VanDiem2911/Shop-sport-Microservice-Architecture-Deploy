-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               11.6.2-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- ==========================================================
-- 1. DATABASE CHO AUTH SERVICE (Port 8081)
-- ==========================================================
CREATE DATABASE IF NOT EXISTS auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE auth_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    role VARCHAR(50) DEFAULT 'ROLE_USER'
);

DELETE FROM `users`;
INSERT INTO `users` (`id`, `username`, `password`, `email`, `phone`, `address`, `role`) VALUES
	(1, 'admin', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.7uHowLi', 'admin@shop-sport.com', NULL, NULL, 'ROLE_ADMIN'),
	(2, 'user1', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.7uHowLi', 'user1@gmail.com', NULL, NULL, 'ROLE_USER'),
	(3, 'vandiempro2004', '$2a$10$fqLr9a6kPLFvCr8UT2peGuMkhLxaJfLy46kCyhDf52ZAd42GE7BgS', 'vandiempro2004@gmail.com', '0398752911', 'Vinh Hung', 'ROLE_ADMIN'),
	(4, 'vandiem2004', '$2a$10$Ld1vocVpDt.DEF73s2rinuZ7CSIHU6ryMMYV9kmlfIIWwj0fDVzne', 'vandiem2004@gmail.com', '0398752911', 'Long An\n', 'ROLE_USER'),
	(5, 'phamquanghien648', '$2a$10$1peL4fJISuzCZDq9VpQhueJJNCw8IHyy/16LANhXz.TvoA4vDU63a', 'phamquanghien648@gmail.com', '0354564546132', 'bhkdahkjd', 'ROLE_USER');

-- ==========================================================
-- 5. DATABASE CHO CHAT SERVICE (Port 8086)
-- ==========================================================
CREATE DATABASE IF NOT EXISTS chat_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE chat_db;

CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender VARCHAR(255),
    receiver VARCHAR(255),
    content TEXT,
    order_id BIGINT,
    timestamp DATETIME(6)
);

DELETE FROM `chat_messages`;

-- ==========================================================
-- 3. DATABASE CHO ORDER SERVICE (Port 8083)
-- ==========================================================
CREATE DATABASE IF NOT EXISTS order_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE order_db;

CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    total_amount DOUBLE,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
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

CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(1000),
    name VARCHAR(255),
    price DOUBLE,
    product_id BIGINT,
    quantity INT,
    size VARCHAR(20),
    username VARCHAR(255)
);

DELETE FROM `cart_items`;
INSERT INTO `cart_items` (`id`, `image_url`, `name`, `price`, `product_id`, `quantity`, `size`, `username`) VALUES
	(3, 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/b8fecacbc9ba4f5b986eacc600f09879_9366/Quan_Short_Squadra_21_DJen_GN5776_01_laydown.jpg', 'Quần short bóng đá Adidas Squadra 21', 500000, 10, 1, 'XL', 'phamquanghien648');

-- Dumping data for table order_db.orders: ~11 rows (approximately)
USE order_db;
DELETE FROM `orders`;
INSERT INTO `orders` (`id`, `username`, `phone`, `address`, `total_amount`, `status`, `created_at`) VALUES
	(1, 'vandiem2004', '0398752911', 'la', 470000, 'PREPARING', '2026-05-27 11:57:44'),
	(2, 'phamquanghien648', '0354564546132', 'bhkdahkjd', 660000, 'DELIVERED', '2026-05-27 13:24:32'),
	(3, 'vandiem2004', '0398752911', 'Long An\n', 1900000, 'DELIVERED', '2026-05-27 16:28:29'),
	(4, 'vandiem2004', '0398752911', 'Long An\n', 660000, 'PREPARING', '2026-05-27 16:46:16'),
	(5, 'vandiem2004', '0398752911', 'Long An\n', 470000, 'PENDING', '2026-05-29 21:16:10'),
	(6, 'vandiem2004', '0398752911', 'Long An\n', 900000, 'PREPARING', '2026-05-29 21:24:39'),
	(7, 'vandiem2004', '0398752911', 'Long An\n', 330000, 'DELIVERED', '2026-05-29 21:28:36'),
	(8, 'user1', '0987654321', '12 Nguyen Trai, Q.5, TP.HCM', 470000, 'DELIVERED', '2026-05-29 21:51:31'),
	(9, 'vandiem2004', '0398752911', 'Long An\n', 470000, 'DELIVERED', '2026-05-29 22:07:25'),
	(10, 'vandiempro2004', '0398752911', 'Vinh Hung', 900000, 'DELIVERED', '2026-05-29 22:11:31'),
	(11, 'vandiempro2004', '0398752911', 'Vinh Hung', 1000000, 'PENDING', '2026-05-29 22:13:40');

-- Dumping data for table order_db.order_items: ~12 rows (approximately)
USE order_db;
DELETE FROM `order_items`;
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `name`, `price`, `quantity`, `size`, `image_url`) VALUES
	(1, 1, 52, 'Dây cước căng vợt Yonex BG66 Ultimax', 220000, 2, 'Standard', 'https://shopvnb.com/uploads/gallery/cuoc-cang-vot-yonex-bg66.jpg'),
	(2, 2, 52, 'Dây cước căng vợt Yonex BG66 Ultimax', 220000, 3, 'Standard', 'https://i.ebayimg.com/images/g/EdMAAeSwVXZoLIdG/s-l960.webp'),
	(3, 3, 5, 'Tất bóng đá Nike Grip Strike', 450000, 2, 'Standard', 'https://product.hstatic.net/1000061481/product/291bc0957a8146c8b412b36c009ddb61_1c87980d01934ae2b8fee568d1b90961_master.jpeg'),
	(4, 3, 10, 'Quần short bóng đá Adidas Squadra 21', 500000, 2, 'S', 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/b8fecacbc9ba4f5b986eacc600f09879_9366/Quan_Short_Squadra_21_DJen_GN5776_01_laydown.jpg'),
	(5, 4, 52, 'Dây cước căng vợt Yonex BG66 Ultimax', 220000, 3, 'Standard', 'https://i.ebayimg.com/images/g/EdMAAeSwVXZoLIdG/s-l960.webp'),
	(6, 5, 52, 'Dây cước căng vợt Yonex BG66 Ultimax', 220000, 2, 'Standard', 'https://i.ebayimg.com/images/g/EdMAAeSwVXZoLIdG/s-l960.webp'),
	(7, 6, 5, 'Tất bóng đá Nike Grip Strike', 450000, 2, 'Standard', 'https://product.hstatic.net/1000061481/product/291bc0957a8146c8b412b36c009ddb61_1c87980d01934ae2b8fee568d1b90961_master.jpeg'),
	(8, 7, 95, 'Hộp 4 quả bóng Tennis Wilson Championship', 150000, 2, 'Standard', 'https://www.gusport.com.vn/image/cache/catalog/san-pham/phu-kien/bong-tennis/bong-wilson/bong-tennis-wilson-championship/bong-wilson-championship-hop-do-4-trai-1-500x500.webp'),
	(9, 8, 101, 'Giay Bong Da Nike Mercurial', 235000, 2, '42', 'nike_mercurial.png'),
	(10, 9, 52, 'Dây cước căng vợt Yonex BG66 Ultimax', 220000, 2, 'Standard', 'https://i.ebayimg.com/images/g/EdMAAeSwVXZoLIdG/s-l960.webp'),
	(11, 10, 5, 'Tất bóng đá Nike Grip Strike', 450000, 2, 'Standard', 'https://product.hstatic.net/1000061481/product/291bc0957a8146c8b412b36c009ddb61_1c87980d01934ae2b8fee568d1b90961_master.jpeg'),
	(12, 11, 10, 'Quần short bóng đá Adidas Squadra 21', 500000, 2, 'S', 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/b8fecacbc9ba4f5b986eacc600f09879_9366/Quan_Short_Squadra_21_DJen_GN5776_01_laydown.jpg');

-- ==========================================================
-- 4. DATABASE CHO PAYMENT SERVICE (Port 8084)
-- ==========================================================
CREATE DATABASE IF NOT EXISTS payment_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE payment_db;

CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    amount DOUBLE NOT NULL,
    payment_method VARCHAR(100),
    username VARCHAR(255),
    status VARCHAR(50),
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

DELETE FROM `payments`;
INSERT INTO `payments` (`id`, `order_id`, `amount`, `payment_method`, `username`, `status`, `transaction_date`) VALUES
	(1, 1, 470000, 'CASH_ON_DELIVERY', 'vandiem2004', 'PENDING', '2026-05-27 11:57:47'),
	(2, 2, 660000, 'CASH_ON_DELIVERY', 'phamquanghien648', 'SUCCESS', '2026-05-27 13:24:34'),
	(3, 3, 1900000, 'CASH_ON_DELIVERY', 'vandiem2004', 'SUCCESS', '2026-05-27 16:29:09'),
	(4, 4, 660000, 'CREDIT_CARD', 'vandiem2004', 'SUCCESS', '2026-05-27 16:46:17'),
	(5, 5, 470000, 'MOMO', 'vandiem2004', 'FAILED', '2026-05-29 21:16:12'),
	(6, 5, 470000, 'MOMO', 'vandiem2004', 'FAILED', '2026-05-29 21:18:18'),
	(7, 5, 470000, 'MOMO', 'vandiem2004', 'FAILED', '2026-05-29 21:22:30'),
	(8, 5, 470000, 'MOMO', 'vandiem2004', 'PENDING', '2026-05-29 21:22:52'),
	(9, 6, 900000, 'MOMO', 'vandiem2004', 'SUCCESS', '2026-05-29 21:24:41'),
	(10, 7, 330000, 'MOMO', 'vandiem2004', 'SUCCESS', '2026-05-29 21:28:38'),
	(11, 8, 470000, 'CASH_ON_DELIVERY', 'user1', 'SUCCESS', '2026-05-29 21:51:31'),
	(12, 9, 470000, 'CASH_ON_DELIVERY', 'vandiem2004', 'SUCCESS', '2026-05-29 22:07:28'),
	(13, 10, 900000, 'CASH_ON_DELIVERY', 'vandiempro2004', 'SUCCESS', '2026-05-29 22:11:33'),
	(14, 11, 1000000, 'MOMO', 'vandiempro2004', 'PENDING', '2026-05-29 22:14:23');

-- ==========================================================
-- 2. DATABASE CHO PRODUCT SERVICE (Port 8082)
-- ==========================================================
CREATE DATABASE IF NOT EXISTS product_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE product_db;

CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DOUBLE NOT NULL,
    stock INT DEFAULT 0,
    image_url VARCHAR(1000),
    sport VARCHAR(255),
    category_id BIGINT,
    sold_quantity INT DEFAULT 0,
    sold_count INT DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255),
    content TEXT,
    rating INT,
    created_at DATETIME,
    product_id BIGINT,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

DELETE FROM `categories`;
INSERT INTO `categories` (`id`, `name`, `description`) VALUES
	(1, 'Giày', 'Giày thể thao các loại'),
	(2, 'Áo', 'Áo thể thao chất lượng cao'),
	(3, 'Quần', 'Quần đùi, quần dài tập luyện'),
	(4, 'Vợt', 'Vợt cầu lông, vợt tennis chuyên nghiệp'),
	(5, 'Bóng', 'Bóng đá, bóng rổ thi đấu'),
	(6, 'Phụ kiện', 'Tất, balo, đai chạy bộ, quấn cán');

-- Dumping data for table product_db.products: ~100 rows (approximately)
USE product_db;
DELETE FROM `products`;
INSERT INTO `products` (`id`, `name`, `description`, `price`, `stock`, `image_url`, `sport`, `category_id`, `sold_quantity`, `sold_count`) VALUES
	(1, 'Giày Nike Mercurial Vapor 15 Elite FG', 'Giày đá bóng cỏ tự nhiên cao cấp Elite FG', 6500000, 30, 'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/6e254825-e316-4afe-bd7e-5cce856818bb/ZOOM%2BVAPOR%2B15%2BELITE%2BFG.png', 'Bóng đá', 1, 120, 0),
	(2, 'Giày Adidas Predator Accuracy.3 TF', 'Kiểm soát bóng tối ưu - Core Black', 2200000, 25, 'https://assets.adidas.com/images/w_600,f_auto,q_auto/8a691408efc2407996feaf5d01153022_9366/Predator_Accuracy.3_Turf_Boots_Black_GW7080_22_model.jpg', 'Bóng đá', 1, 85, 0),
	(3, 'Áo đấu Real Madrid Home 24/25', 'Áo thi đấu sân nhà chính hãng Adidas', 2200000, 50, 'https://assets.adidas.com/images/w_600,f_auto,q_auto/78b62417f1e042aeb25e3353d278de3b_9366/Ao_DJau_San_Nha_Authentic_Real_Madrid_24-25_trang_IX8095_HM1.jpg', 'Bóng đá', 2, 250, 0),
	(4, 'Quả bóng Adidas Euro 2024', 'Bóng thi đấu chính thức Fussballliebe', 3500000, 40, 'https://product.hstatic.net/1000061481/product/tai_xuong__85__ea85d0569ec4440c981723b18a487c7e_master_b3200e9a8d54470eb863ac0596c45bb5_1024x1024.jpg', 'Bóng đá', 5, 40, 0),
	(5, 'Tất bóng đá Nike Grip Strike', 'Tất chống trượt chuyên nghiệp Nike Strike', 450000, 194, 'https://product.hstatic.net/1000061481/product/291bc0957a8146c8b412b36c009ddb61_1c87980d01934ae2b8fee568d1b90961_master.jpeg', 'Bóng đá', 6, 506, 0),
	(6, 'Giày Puma Future Ultimate FG/AG', 'Kiểm soát trận đấu với thế hệ Future mới nhất', 5800000, 18, 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/107355/01/sv01/fnd/EEA/fmt/png', 'Bóng đá', 1, 92, 0),
	(7, 'Giày Nike Phantom GX II Academy TF', 'Cảm giác bóng tuyệt vời trên sân cỏ nhân tạo', 2400000, 35, 'https://product.hstatic.net/200000278317/product/utsal-giay-da-bong-nike-phantom-gx-2-academy-tf-fj2577-100-trang-den-1_f2aab4be16c94bf79c4b3b3167f87557_master.jpg', 'Bóng đá', 1, 140, 0),
	(8, 'Giày Adidas Copa Pure.2 Elite FG', 'Chất liệu da cao cấp, ôm chân hoàn hảo', 4800000, 15, 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/1c82086badd5475e954244b9a0496db3_9366/Giay_DJa_Bong_San_Co_Tu_Nhien-DJa_Dang_Mat_San_Copa_Pure_3_Club_DJen_JR2896_01_00_standard_hover.jpg', 'Bóng đá', 1, 60, 0),
	(9, 'Áo thun tập luyện Nike Dri-FIT Academy', 'Công nghệ thấm hút mồ hôi, co giãn tối đa', 750000, 80, 'https://nhatminhsports.vn/wp-content/uploads/2025/04/UN464-041.jpg', 'Bóng đá', 2, 320, 0),
	(10, 'Quần short bóng đá Adidas Squadra 21', 'Chất liệu tái chế Aeroready thân thiện môi trường', 500000, 116, 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/b8fecacbc9ba4f5b986eacc600f09879_9366/Quan_Short_Squadra_21_DJen_GN5776_01_laydown.jpg', 'Bóng đá', 3, 414, 0),
	(11, 'Áo đấu Manchester United Home 24/25', 'Áo đấu Quỷ Đỏ sân nhà bản mới nhất', 2200000, 60, 'https://cdn.hstatic.net/products/200000293662/1_61cb482f694744c7ab17a72ea63e3b3b_1024x1024.jpg', 'Bóng đá', 2, 280, 0),
	(12, 'Áo đấu Arsenal Home 24/25', 'Phiên bản thi đấu sân nhà pháo thủ Emirates', 2200000, 45, 'https://i.ebayimg.com/images/g/aJ4AAeSw2J9ovt4N/s-l1600.webp', 'Bóng đá', 2, 190, 0),
	(13, 'Bọc ống đồng Nike Mercurial Lite', 'Bảo vệ ống chân siêu nhẹ, đàn hồi tốt', 650000, 90, 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/79215dcb57d44e2893f19b3a51f5429e_9366/Op_Bao_Ve_Ong_Chan_Tiro_Club_trang_IP3995_01_standard.jpg', 'Bóng đá', 6, 210, 0),
	(14, 'Găng tay thủ môn Adidas Predator Pro', 'Độ bám dính cực đỉnh trong mọi thời tiết', 3200000, 10, 'https://i.ebayimg.com/images/g/Db4AAeSwV~lpMjM8/s-l1600.webp', 'Bóng đá', 6, 35, 0),
	(15, 'Quả bóng Puma Orbita La Liga 1', 'Bóng thi đấu chính thức tại giải vô địch Tây Ban Nha', 3400000, 15, 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/084105/01/fnd/EEA/fmt/png', 'Bóng đá', 5, 28, 0),
	(16, 'Quần short bóng đá Nike Dri-FIT Strike', 'Vải dệt cao cấp, hỗ trợ bứt tốc vượt trội', 850000, 70, 'https://i.ebayimg.com/images/g/n~IAAeSwpj9pcGGf/s-l1600.webp', 'Bóng đá', 3, 160, 0),
	(17, 'Balo bóng đá Nike Academy Team', 'Ngăn chứa giày riêng biệt, dung tích 30L rộng rãi', 1200000, 40, 'https://sneakerdaily.vn/wp-content/uploads/2024/09/Balo-Nike-Academy-Team-Backpack-DV0761-702.jpg', 'Bóng đá', 6, 85, 0),
	(18, 'Giày Puma King Top FG', 'Huyền thoại da thật êm ái cổ điển', 3900000, 12, 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/105607/01/sv01/fnd/EEA/fmt/png', 'Bóng đá', 1, 40, 0),
	(19, 'Áo khoác bóng đá Adidas Tiro 23', 'Phong cách thể thao đường phố năng động', 1800000, 30, 'https://i.ebayimg.com/images/g/MB8AAOSwbIxnz936/s-l1600.webp', 'Bóng đá', 2, 75, 0),
	(20, 'Bơm bóng mini Adidas Pocket Pump', 'Nhỏ gọn, tiện lợi mang theo mọi lúc mọi nơi', 350000, 150, 'https://www.ketnoitieudung.vn/data/bt9/ong-bom-tolsen-65501-1513647415.jpg', 'Bóng đá', 6, 120, 0),
	(21, 'Giày Jordan 1 Retro High OG', 'Biểu tượng văn hóa sát thủ OG High huyền thoại', 5500000, 15, 'https://i.ebayimg.com/images/g/mvYAAOSw6~5ji-cy/s-l1600.webp', 'Bóng rổ', 1, 210, 0),
	(22, 'Giày Nike LeBron XXI', 'Sức mạnh và tốc độ của Nhà vua LeBron James', 4900000, 20, 'https://i.ebayimg.com/images/g/nuYAAeSweaFppeRX/s-l1600.webp', 'Bóng rổ', 1, 95, 0),
	(23, 'Áo Jersey Lakers - LeBron James', 'Áo đấu Los Angeles Lakers số 23 Icon Edition', 2800000, 30, 'https://www.classicfootballshirts.co.uk/cdn-cgi/image/fit=contain,q=70,w=1024,h=1024,f=webp/pub/media/catalog/product//2/6/267c0750881a7bf7b9487458867c340756ba78665aa8ce4633dcfe5e92fc4742.jpeg', 'Bóng rổ', 2, 150, 0),
	(24, 'Quả bóng rổ Wilson NBA Official', 'Bóng thi đấu chính thức NBA từ Wilson', 3200000, 25, 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/4781adb4e19546c9a22bae4201698de7_9366/Qua_Bong_Ro_Chinh_Thuc_Pro_3.0_trai_cam_HM4976_01_standard.jpg', 'Bóng rổ', 5, 60, 0),
	(25, 'Giày Adidas Dame 8 EXTPLY', 'Giày bóng rổ chữ ký Damian Lillard', 3600000, 14, 'https://d3vfig6e0r0snz.cloudfront.net/rcYjnYuenaTH5vyDF/images/products/8abfa812ee53f2a4f6bf479da8904e6e.webp', 'Bóng rổ', 1, 48, 0),
	(26, 'Giày Puma MB.03 LaFrance', 'Giày bóng rổ siêu cá tính của LaMelo Ball', 4200000, 10, 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/379231/01/sv01/fnd/EEA/fmt/png', 'Bóng rổ', 1, 74, 0),
	(27, 'Áo Jersey Golden State Warriors - Curry', 'Áo thi đấu Stephen Curry số 30 chính hãng', 2800000, 22, 'https://www.classicfootballshirts.co.uk/cdn-cgi/image/fit=contain,q=70,w=1024,h=1024,f=webp/pub/media/catalog/product//c/a/cas-43_1_1_1_1_2_1_1_1.jpg', 'Bóng rổ', 2, 110, 0),
	(28, 'Quần short bóng rổ Nike Dri-FIT Elite', 'Vải lưới thoáng khí, tối ưu cử động nhảy', 1100000, 50, 'https://i.ebayimg.com/images/g/K-oAAOSwxxhlsTbw/s-l1600.webp', 'Bóng rổ', 3, 145, 0),
	(29, 'Quả bóng rổ Wilson Evolution', 'Bóng da vi sợi được yêu thích nhất tại các phòng tập', 1950000, 40, 'https://i.ebayimg.com/thumbs/images/g/Y-MAAOSw4K1lMaFm/s-l500.jpg', 'Bóng rổ', 5, 180, 0),
	(30, 'Vớ bóng rổ Nike Elite Crew', 'Đệm chân dày, chống trượt chấn thương', 420000, 150, 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/28ddad08db4f4a3a9351d4c139dc895d_9366/Bo_3_DJoi_Tat_Co_Cao_3_Gach_trang_JV7401_01_01_00_standard.jpg', 'Bóng rổ', 6, 320, 0),
	(31, 'Giày Nike Giannis Immortality 3', 'Phong cách quái thú Hy Lạp, bám sân cực tốt', 2500000, 18, 'https://www.sport9.vn/images/thumbs/003/0030327_nike-air-zoom-mercurial-vapor-16-pro-tf-xanh-duongbac-fq8687-446.png', 'Bóng rổ', 1, 80, 0),
	(32, 'Giày Adidas Harden Vol 8', 'Đột phá thiết kế hiện đại cùng James Harden', 4500000, 12, 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/2af3dfef1dc14739a20531f46d279b09_9366/Giay_HARDEN_VOLUME_10_Bac_KJ1454_01_00_standard.jpg', 'Bóng rổ', 1, 55, 0),
	(33, 'Băng chặn mồ hôi đầu Nike NBA', 'Chất liệu thun co giãn thêu logo NBA nổi tiếng', 350000, 100, 'https://i.ebayimg.com/images/g/di8AAeSwfqVqEfTY/s-l1600.webp', 'Bóng rổ', 6, 175, 0),
	(34, 'Balo bóng rổ Nike Elite Pro', 'Thiết kế mở nắp túi dạng vali tiện dụng', 2400000, 25, 'https://pos.nvncdn.com/80cfbf-41716/ps/20240814_MEEFVvx4c2.png?v=1723628729', 'Bóng rổ', 6, 68, 0),
	(35, 'Áo hoodie bóng rổ Nike Standard Issue', 'Giữ ấm cơ thể hoàn hảo ngoài sân bóng', 2100000, 30, 'https://i.ebayimg.com/images/g/BhAAAOSwO0lj3B0J/s-l1600.webp', 'Bóng rổ', 2, 45, 0),
	(36, 'Quần đùi bóng rổ Adidas Crossover', 'Chất vải thể thao nhẹ, thông thoáng tuyệt đối', 1200000, 45, 'https://assets.adidas.com/images/w_600,f_auto,q_auto/78b62417f1e042aeb25e3353d278de3b_9366/Crossover_Shorts.jpg', 'Bóng rổ', 3, 90, 0),
	(37, 'Giày Jordan Tatum 2', 'Thiết kế tối ưu trọng lượng của Jayson Tatum', 3900000, 14, 'https://bizweb.dktcdn.net/100/425/004/products/s-l960-3-1743071613271.jpg?v=1743653916613', 'Bóng rổ', 1, 62, 0),
	(38, 'Giày Nike KD16', 'Bảo vệ gót chân và phản hồi năng lượng tối đa', 4200000, 16, 'https://www.sport9.vn/images/thumbs/003/0030418_nike-zoom-mercurial-vapor-16-pro-tf-vjr-mau-hong-io9814-640.jpeg', 'Bóng rổ', 1, 88, 0),
	(39, 'Lưới vành rổ Wilson Heavy Duty', 'Lưới dù cao cấp chống chịu mọi thời tiết ngoài trời', 450000, 60, 'https://p16-oec-va.ibyteimg.com/tos-maliva-i-o3syd03w52-us/5f173c71d8c1453883606d0bc919fbed~tplv-o3syd03w52-resize-webp:800:800.webp?dr=15592&t=555f072d&ps=933b5bde&shp=8dbd94bf&shcp=e1be8f53&idc=my3&from=2378011839', 'Bóng rổ', 6, 130, 0),
	(40, 'Quả bóng rổ Nike Everyday Playground', 'Bóng cao su bền bỉ chuyên chơi sân Outdoor', 600000, 80, 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/9a44621a281149709ca4ae420163c466_9366/Bong_All_Court_3.0_trai_cam_HM4975_01_standard.jpg', 'Bóng rổ', 5, 210, 0),
	(41, 'Vợt Yonex Astrox 100ZZ Kurenai', 'Siêu phẩm tấn công huyền thoại Kurenai chính hãng', 4500000, 10, 'https://luongsport.com/wp-content/uploads/2023/04/vot-cau-long-yonex-astrox-100zz-kurenai-chinh-hang-1.jpg', 'Cầu lông', 4, 75, 0),
	(42, 'Giày Yonex Power Cushion 65Z3', 'Giày cầu lông êm ái, bám sân cực tốt bản White Tiger', 3200000, 20, 'https://i.ebayimg.com/images/g/G14AAeSw6eZqBDAX/s-l1600.webp', 'Cầu lông', 1, 110, 0),
	(43, 'Vợt Yonex Nanoflare 1000Z', 'Dòng vợt tốc độ, phản tạt nhanh nhẹ nhất lịch sử', 4800000, 12, 'https://saigonbadminton.vn/wp-content/uploads/2023/12/IMG_0595.jpg', 'Cầu lông', 4, 85, 0),
	(44, 'Áo thun cầu lông Yonex Tournament', 'Chất liệu TruBreeze thoáng mát, thấm mồ hôi siêu tốc', 790000, 40, 'https://thoitrangbigsize.vn/wp-content/uploads/2025/03/Phong-lan-khoi.jpg', 'Cầu lông', 2, 195, 0),
	(45, 'Quần short cầu lông Yonex TruBreeze', 'Thiết kế gọn gàng, co giãn tốt cho các pha cứu cầu', 550000, 50, 'https://www.sport9.vn/images/thumbs/001/0015877_MIZUNO%20QU%E1%BA%A6N%20SHORT%20TH%E1%BB%82%20THAO%20MIZUNO%20BLACK.jpeg?preset=large', 'Cầu lông', 3, 140, 0),
	(46, 'Vợt Yonex Astrox 88D Pro', 'Dành cho người chơi thiên công ở nửa sân sau', 4200000, 8, 'https://saigonbadminton.vn/wp-content/uploads/2024/03/IMG_3703.jpg', 'Cầu lông', 4, 66, 0),
	(47, 'Vợt Yonex Arcsaber 11 Pro', 'Vợt điều cầu kiểm soát toàn diện trận đấu', 4400000, 15, 'https://cdn.shopvnb.com/uploads/gallery/vot-cau-long-yonex-arcsaber-11-pro-china-limited-noi-dia-trung-6_1699664398.webp', 'Cầu lông', 4, 90, 0),
	(48, 'Giày Yonex Power Cushion Eclipsion Z3', 'Dòng giày bảo vệ cổ chân và chống lật cổ chân', 3500000, 16, 'https://shopvnb.com//uploads/gallery/giay-cau-long-yonex-eclipsion-z3-men-xanh-navy-chinh-hang_1732235602.webp', 'Cầu lông', 1, 52, 0),
	(49, 'Bao vợt cầu lông Yonex Pro Bag', 'Dung tích chứa được tới 9 cây vợt kèm ngăn giày riêng', 2100000, 15, 'https://i.ebayimg.com/images/g/DpoAAOSwhVhlwiux/s-l1600.webp', 'Cầu lông', 6, 38, 0),
	(50, 'Quấn cán vợt Yonex Super Grap', 'Sản xuất tại Nhật Bản, độ bám tay tuyệt hảo', 150000, 300, 'https://i.ebayimg.com/images/g/~LwAAeSw4VRpCSaa/s-l1600.webp', 'Cầu lông', 6, 850, 0),
	(51, 'Hộp quả cầu lông Yonex Aerosensa 50', 'Cầu thi đấu chính thức tại các giải quốc tế lớn', 650000, 80, 'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mmk0cc6h3uv798', 'Cầu lông', 6, 420, 0),
	(52, 'Dây cước căng vợt Yonex BG66 Ultimax', 'Cước cầu lông trợ lực cao, tiếng nổ đanh giòn', 220000, 188, 'https://i.ebayimg.com/images/g/EdMAAeSwVXZoLIdG/s-l960.webp', 'Cầu lông', 6, 962, 0),
	(53, 'Băng chặn mồ hôi cổ tay Yonex', 'Giúp ngăn mồ hôi chảy xuống tay cầm vợt hiệu quả', 120000, 120, 'https://www.saltum.com/cdn/shop/files/Sa8ee15890d7b4c5893d96dbc2fc666d0v.webp?v=1772787777&width=5000', 'Cầu lông', 6, 210, 0),
	(54, 'Áo khoác cầu lông Yonex Team', 'Giữ ấm cơ thể trước và sau khi ra sân', 1400000, 25, 'https://www.sport9.vn/images/thumbs/001/0015966_MIZUNO%20%C3%81O%20KHO%C3%81C%20TH%E1%BB%82%20THAO%20P2SC9010%20%C4%90EN.jpeg?preset=large', 'Cầu lông', 2, 55, 0),
	(55, 'Giày Yonex Power Cushion Comfort Z3', 'Độ êm tối đa nhờ lớp đệm cushion dày đặc', 3800000, 10, 'https://product.hstatic.net/200000174405/product/them_tieu_de__13__b15a897a2aae41708de4a07be8aaa535_master.png', 'Cầu lông', 1, 48, 0),
	(56, 'Vợt Yonex Nanoflare 800 Pro', 'Vợt thân cứng phản tạt tì đè lưới cực đỉnh', 4300000, 12, 'https://cdn.shopvnb.com/uploads/gallery/vot-cau-long-yonex-nanoflare-800-pro-chinh-hang-7_1698803487.webp', 'Cầu lông', 4, 73, 0),
	(57, 'Vợt Yonex Astrox 99 Pro', 'Vợt nặng đầu chuyên công, smash uy lực như sấm sét', 4600000, 8, 'https://nvbplay.vn/wp-content/uploads/2025/08/vot-cau-long-yonex-astrox-99-pro-black-green-2.jpg', 'Cầu lông', 4, 60, 0),
	(58, 'Quần short Nike Court Dri-FIT', 'Quần thun co giãn đa hướng thích hợp chạy nhảy', 890000, 35, 'https://d3vfig6e0r0snz.cloudfront.net/rcYjnYuenaTH5vyDF/images/products/a027a1f076ea66014bf31b9c1ea5cd29.webp', 'Cầu lông', 3, 105, 0),
	(59, 'Áo polo Nike Court Dri-FIT', 'Áo cổ bẻ lịch lãm sang trọng khi lên sân', 1100000, 30, 'https://pos.nvncdn.com/8ca22b-20641/ps/NIKE-COURT-ADVANTAGE-DRI-FIT-POLO-SHIRT-MEN-S-BLUE-FD5318-435.jpg?v=1750643716', 'Cầu lông', 2, 85, 0),
	(60, 'Tất cầu lông Yonex 3D Ergo', 'Thiết kế dệt ôm khít ngón chân trái phải riêng biệt', 180000, 140, 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/89d8b7d953b34126903551064a173eb7_9366/Bo_3_DJoi_Tat_Co_Cao_Lot_DJem_Sieu_Bam_Performance_CLIMACOOL_trang_JD9572_03_standard_hover.jpg', 'Cầu lông', 6, 310, 0),
	(61, 'Giày Nike Air Zoom Pegasus 40', 'Dòng giày chạy quốc dân bền bỉ, êm ái cho mọi cự ly', 3800000, 45, 'https://product.hstatic.net/200000174405/product/them_tieu_de__6__8316493466b54a74aa86705992e56806_master.png', 'Chạy bộ', 1, 410, 0),
	(62, 'Giày Adidas Ultraboost Light', 'Đệm Boost cải tiến siêu nhẹ, phản hồi lực tối đa', 5200000, 30, 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/0685694f0f754aacb4ad69cb9d636f0d_9366/ULTRABOOST_5_MERCEDES_AMG_PETRONAS_F1_TEAM_Shoes_Black_KJ3673_HM1.jpg', 'Chạy bộ', 1, 280, 0),
	(63, 'Giày Nike Vaporfly 3', 'Siêu giày đua carbon giúp phá kỷ lục cá nhân Marathon', 6900000, 15, 'https://www.sport9.vn/images/thumbs/003/0030458_nike-phantom-6-low-pro-tf-xanh-duong-hj4123-446.jpeg', 'Chạy bộ', 1, 190, 0),
	(64, 'Áo thun chạy bộ Nike Dri-FIT Miler', 'Chất vải mỏng nhẹ mát lạnh, giảm thiểu ma sát da', 850000, 90, 'https://cdn.hstatic.net/products/200000940675/ma_n__canh__o-5bf5da37-afb8-4b7c-8466-f3368b80b87c_3c5425d42cd44e799a274b7ae7fa3bc8_1024x1024.jpg', 'Chạy bộ', 2, 380, 0),
	(65, 'Quần short chạy bộ Adidas Own The Run', 'Tích hợp túi nhỏ đựng chìa khóa, chất liệu khô nhanh', 700000, 110, 'https://antiensport.vn/files/products/photos/2025/03/12/Motive-SM201-nam-xanh-duong-1.png', 'Chạy bộ', 3, 290, 0),
	(66, 'Giày Puma Deviate Nitro 2', 'Đệm bọt Nitro Elite phản hồi năng lượng xuất sắc', 4100000, 20, 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/376807/01/sv01/fnd/EEA/fmt/png', 'Chạy bộ', 1, 85, 0),
	(67, 'Giày Nike Alphafly 3', 'Ông vua của đường chạy marathon thế giới', 8200000, 10, 'https://cdn.vuahanghieu.com/unsafe/0x900/left/top/smart/filters:quality(90)/https://admin.vuahanghieu.com/upload/product/2024/08/giay-the-thao-nam-nike-alphafly-3-road-racing-shoes-fd8311-100-mau-trang-phoi-hong-size-38-66b5b47869921-09082024131728.jpg', 'Chạy bộ', 1, 75, 0),
	(68, 'Giày Adidas Boston 12', 'Giày luyện tập cự ly dài bền bỉ có thanh carbon hỗ trợ', 3800000, 25, 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/7ae77ad6d21a43d7aca4d260f6428136_9366/Giay_Adizero_Boston_13_trang_JQ9666_HM1.jpg', 'Chạy bộ', 1, 130, 0),
	(69, 'Quần short 2-trong-1 Nike Trail', 'Quần short có lớp lót bó cơ hỗ trợ chạy địa hình', 1200000, 40, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHfHt1m7Qq9GxWxYnEMl5aA6aWUi5JvU8TyA&s', 'Chạy bộ', 3, 115, 0),
	(70, 'Đai đeo bụng chạy bộ Nike Slim Waistpack', 'Thiết kế mỏng nhẹ không rung lắc khi chạy cự ly dài', 550000, 80, 'https://nhatminhsports.vn/wp-content/uploads/2025/08/UN746-BLK.jpeg', 'Chạy bộ', 6, 210, 0),
	(71, 'Bình nước cầm tay thể thao Nike', 'Thiết kế van chống rò rỉ nước, dung tích 500ml tiện lợi', 450000, 150, 'https://sneakerdaily.vn/wp-content/uploads/2024/07/Binh-Nuoc-Nike-TR-Recharge-790ml-Black_Clear-DX7863-968.jpg', 'Chạy bộ', 6, 320, 0),
	(72, 'Mũ lưỡi trai chạy bộ Adidas Superlite', 'Vải thoáng khí thoát mồ hôi nhanh bảo vệ mắt khỏi nắng', 500000, 120, 'https://assets.adidas.com/images/w_600,f_auto,q_auto/78b62417f1e042aeb25e3353d278de3b_9366/Crossover_Shorts.jpg', 'Chạy bộ', 6, 260, 0),
	(73, 'Vớ cổ ngắn chạy bộ Nike Spark', 'Mỏng nhẹ thông thoáng, bảo vệ bàn chân khỏi phồng rộp', 380000, 180, 'https://i.ebayimg.com/images/g/a1wAAeSwQBloxbxp/s-l1600.webp', 'Chạy bộ', 6, 450, 0),
	(74, 'Áo gió chạy bộ Nike Windrunner', 'Chống mưa nhỏ và gió lạnh, siêu nhẹ có thể xếp gọn', 2500000, 30, 'https://i.ebayimg.com/images/g/dagAAeSwhJFpvOQB/s-l1600.webp', 'Chạy bộ', 2, 98, 0),
	(75, 'Giày Puma Velocity Nitro 3', 'Sự kết hợp hoàn hảo giữa đệm êm và độ bám dính cao', 3200000, 22, 'https://i.ebayimg.com/images/g/8SQAAeSweqhppcBZ/s-l1600.webp', 'Chạy bộ', 1, 62, 0),
	(76, 'Áo singlet chạy bộ Adidas Adizero', 'Trọng lượng siêu nhẹ cho cảm giác mặc như không mặc', 950000, 60, 'https://i.ebayimg.com/images/g/JsAAAeSwgIBplzl8/s-l1600.webp', 'Chạy bộ', 2, 110, 0),
	(77, 'Quần bó cơ dài chạy bộ Nike Dri-FIT ADV', 'Hỗ trợ tuần hoàn máu cơ bắp hiệu quả cho runner', 1800000, 25, 'https://antiensport.vn/files/products/photos/2025/11/12/quan-bo-co-compressport-Run-Under-Control-Short.jpg', 'Chạy bộ', 3, 50, 0),
	(78, 'Băng chặn mồ hôi trán Puma Running', 'Chất liệu thun mềm mại, giữ khô trán trong thời gian dài', 250000, 90, 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/054117/01/fnd/EEA/fmt/png', 'Chạy bộ', 6, 185, 0),
	(79, 'Giày Adidas Adizero Adios Pro 3', 'Mẫu giày chinh phục các giải chạy lớn toàn cầu', 6500000, 12, 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/5f02967d01244629a71e6bd2ac83ed86_9366/Giay_Adizero_Adios_Pro_4_trang_KJ7036_01_00_standard.jpg', 'Chạy bộ', 1, 95, 0),
	(80, 'Balo Vest nước chạy bộ Nike Kiger', 'Thiết kế thông minh ôm khít lưng kèm hai bình nước mềm', 3200000, 15, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/u/tui-chong-soc-tomtoc-protective-13-inch-xanh-la_24_.png', 'Chạy bộ', 6, 40, 0),
	(81, 'Vợt Tennis Wilson Pro Staff 97 v14', 'Dòng vợt kiểm soát huyền thoại được huyền thoại khuyên dùng', 5900000, 12, 'https://pos.nvncdn.com/621b5a-78414/ps/20230420_eXcDcwtmsr.jpeg?v=1681987760', 'Tennis', 4, 35, 0),
	(82, 'Vợt Tennis Wilson Clash 100 v2', 'Dòng vợt uốn cong tối ưu thân thiện tối đa với cổ tay', 5600000, 15, 'https://i.ebayimg.com/images/g/wA8AAOSwIWBoPUax/s-l1600.webp', 'Tennis', 4, 48, 0),
	(83, 'Giày Tennis Nike Court Vapor Pro 2', 'Độ bám sân đất nện xuất sắc, linh hoạt bứt tốc', 3900000, 25, 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/7812852c47544f67a7ab71e32ade3e60_9366/Giay_Tennis_Courtjam_Control_3_trang_IF7888_01_standard.jpg', 'Tennis', 1, 80, 0),
	(84, 'Giày Tennis Adidas Barricade 13', 'Vua của độ bền bỉ bảo vệ tối đa bàn chân khi trượt sân', 3950000, 20, 'https://cdn.hstatic.net/products/200000174405/z7143897497354_ce49e844f4edac6811ff34ebab9bd803_53fea54400c14f09b311a0071883ec3e_master.jpg', 'Tennis', 1, 95, 0),
	(85, 'Áo Polo Tennis Adidas Club Aeroready', 'Kiểu dáng thể thao lịch lãm, công nghệ làm mát ưu việt', 950000, 50, 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/b899bc94857f4d9c8aa5af1600b72eda_9366/Club_Tennis_Polo_Shirt_Black_HS3278_01_laydown.jpg', 'Tennis', 2, 140, 0),
	(86, 'Quần short Tennis Nike Court Advantage', 'Quần short co giãn cao có ngăn đựng bóng tennis tiện lợi', 1150000, 45, 'https://i.ebayimg.com/images/g/cuMAAOSw9QhkGUFn/s-l1600.webp', 'Tennis', 3, 112, 0),
	(87, 'Hộp 4 quả bóng Tennis Wilson US Open', 'Bóng thi đấu chính thức tại giải Mỹ mở rộng', 180000, 200, 'https://www.gusport.com.vn/image/cache/catalog/san-pham/phu-kien/bong-tennis/bong-wilson/bong-tennis-wilson-us-open/wilson-us-open-hop-den-4-trai-500x500.webp', 'Tennis', 5, 620, 0),
	(88, 'Bao vợt Tennis Wilson Super Tour 15 PK', 'Chứa tới 15 cây vợt với công nghệ cách nhiệt hiện đại', 3200000, 10, 'https://www.gusport.com.vn/image/catalog/san-pham/BALO-TUI-XACH/Wilson/tui-wilson/9-pack/wilson-super-tour-blade-v10-9pack-wr8056301001/tui-tennis-wilson-super-tour-blade-v10-9pack-wr8056301001-1.jpg', 'Tennis', 6, 25, 0),
	(89, 'Vợt Tennis Wilson Blade 98 v9', 'Độ chính xác tuyệt đối, cảm giác bóng chân thật nhất', 5800000, 14, 'https://product.hstatic.net/200000931671/product/wilson-blade-98-v9-0-16x19-rg-2025-frm-2-vot-tennis-wr173911u__5__7e198fae1eaa47628333ddebd1574ec1.png', 'Tennis', 4, 55, 0),
	(90, 'Vợt Tennis Wilson Ultra 100 v4', 'Khả năng bùng nổ sức mạnh dễ dàng cho người chơi bán chuyên', 5500000, 18, 'https://www.gusport.com.vn/image/cache/catalog/san-pham/vot/wilson/ultra/v5/wilson-ultra-100l-280gr-v5-wr178911u/vot-tennis-wilson-ultra-100l-280gr-v5-wr178911u-1-500x500.webp', 'Tennis', 4, 70, 0),
	(91, 'Giày Tennis Nike Court Zoom Lite 3', 'Giày tennis phổ thông nhẹ nhàng, êm ái cho người mới chơi', 2100000, 30, 'https://www.sport9.vn/images/thumbs/002/0027419_giay-pickleball-nike-court-air-zoom-vapor-pro-cz0220-133-mau-trang-xanh-navy.jpeg', 'Tennis', 1, 130, 0),
	(92, 'Giày Tennis Adidas Defiant Speed', 'Linh hoạt, trọng lượng siêu nhẹ bứt tốc cứu bóng nhanh', 3100000, 22, 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/f6875367348b4e26baf18180a7824998_9366/Defiant_Speed_2_Tennis_Shoes_White_JR1746_01_00_standard.jpg', 'Tennis', 1, 88, 0),
	(93, 'Áo phông thể thao Tennis Nike Court', 'Chất cotton pha cao cấp mịn màng thấm hút tốt', 850000, 70, 'https://i.ebayimg.com/images/g/5GwAAeSw4yxoos0S/s-l1600.webp', 'Tennis', 2, 195, 0),
	(94, 'Quần short Tennis Adidas Ergo', 'Quần short thiết kế cắt may ergonomic hỗ trợ di chuyển rộng', 1100000, 60, 'https://antiensport.vn/files/products/photos/2025/11/14/Compressport-Men-Performance-Short-chinh-hang.jpg', 'Tennis', 3, 150, 0),
	(95, 'Hộp 4 quả bóng Tennis Wilson Championship', 'Bóng tập luyện bền bỉ có độ nảy ổn định cực cao', 150000, 298, 'https://www.gusport.com.vn/image/cache/catalog/san-pham/phu-kien/bong-tennis/bong-wilson/bong-tennis-wilson-championship/bong-wilson-championship-hop-do-4-trai-1-500x500.webp', 'Tennis', 5, 842, 0),
	(96, 'Balo Tennis Wilson Blade Super Tour', 'Thiết kế sang trọng tinh tế vừa vặn cho 2 cây vợt và phụ kiện', 2100000, 15, 'https://www.gusport.com.vn/image/cache/catalog/san-pham/balo-tui-xach/wilson/tui-wilson/9-pack/wilson-super-tour-blade-v10-9pack-wr8056301001/tui-tennis-wilson-super-tour-blade-v10-9pack-wr8056301001-1-500x500.webp', 'Tennis', 6, 68, 0),
	(97, 'Giày Tennis Nike Court GP Turbo', 'Lớp đệm Zoom Air toàn phần êm ái nhất phân khúc', 3800000, 15, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS507S54RG79ZppFxqKNMuktnHWCCpO7o7NgA&s', 'Tennis', 1, 45, 0),
	(98, 'Quấn cán vợt Tennis Wilson Pro Overgrip', 'Được tin dùng bởi Roger Federer cho độ êm ái tối đa', 150000, 400, 'https://shopvnb.com//uploads/gallery/quan-can-tennis-wilson-pro-overgrip-wrz4014-chinh-hang_1695083799.webp', 'Tennis', 6, 950, 0),
	(99, 'Băng chặn mồ hôi đầu Wilson Headband', 'Chống mồ hôi rơi vào mắt khi vận động cường độ cao', 280000, 120, 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/46ca68ff718145c496d7aefa0114b7af_9366/Tennis_Headband_White_HT3908_01_00_standard.jpg', 'Tennis', 6, 175, 0),
	(100, 'Giảm chấn dây vợt Tennis Wilson Pro Feel', 'Triệt tiêu rung động có hại truyền từ vợt vào tay', 180000, 200, 'https://www.gusport.com.vn/image/cache/catalog/san-pham/vot/wilson/dong-clash/wilson-clash-v2-0/wilson-clash-100l-v2-0-280gr-wr074311u2/vot-tennis-wilson-clash-v2-0-280gr-wr074311u-500x500.webp', 'Tennis', 6, 310, 0);

-- Dumping data for table product_db.reviews: ~2 rows (approximately)
USE product_db;
DELETE FROM `reviews`;
INSERT INTO `reviews` (`id`, `username`, `content`, `rating`, `created_at`, `product_id`) VALUES
	(1, 'phamquanghien648', 'như cặc', 1, '2026-05-27 13:26:03', 52),
	(2, 'vandiem2004', 'Dùng rất thoải mái\n', 5, '2026-05-27 16:34:59', 5);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
