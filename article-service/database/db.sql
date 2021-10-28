/*
 Navicat Premium Data Transfer

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 100418
 Source Host           : localhost:3306
 Source Schema         : newspaperdb

 Target Server Type    : MySQL
 Target Server Version : 100418
 File Encoding         : 65001

 Date: 28/07/2021 17:00:03
*/
CREATE DATABASE IF NOT EXISTS newspaperdb;
use newspaperdb;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for approval
-- ----------------------------
DROP TABLE IF EXISTS `approval`;
CREATE TABLE `approval`  (
  `article_id` int UNSIGNED NOT NULL,
  `editor_id` int UNSIGNED NOT NULL,
  `is_approved` int UNSIGNED NULL DEFAULT NULL,
  `reject_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `published_date` date NULL DEFAULT NULL,
  `approved_date` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`article_id`, `editor_id`) USING BTREE,
  INDEX `editor_id`(`editor_id`) USING BTREE,
  CONSTRAINT `approval_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `approval_ibfk_2` FOREIGN KEY (`editor_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of approval
-- ----------------------------
INSERT INTO `approval` VALUES (1, 4, 1, NULL, '2021-07-18', '2021-07-14 14:17:17');

-- ----------------------------
-- Table structure for article_tags
-- ----------------------------
DROP TABLE IF EXISTS `article_tags`;
CREATE TABLE `article_tags`  (
  `article_id` int UNSIGNED NOT NULL,
  `tag_id` int UNSIGNED NOT NULL,
  PRIMARY KEY (`article_id`, `tag_id`) USING BTREE,
  INDEX `tag_id`(`tag_id`) USING BTREE,
  CONSTRAINT `article_tags_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `article_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of article_tags
-- ----------------------------
INSERT INTO `article_tags` VALUES (1, 1);
INSERT INTO `article_tags` VALUES (1, 4);

-- ----------------------------
-- Table structure for articles
-- ----------------------------
DROP TABLE IF EXISTS `articles`;
CREATE TABLE `articles`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `abstract` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `content` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_time` datetime NULL DEFAULT NULL,
  `author_id` int UNSIGNED NULL DEFAULT NULL,
  `category_id` int UNSIGNED NULL DEFAULT NULL,
  `thumbnail_image` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `view_number` int NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `author_id`(`author_id`) USING BTREE,
  INDEX `category_id`(`category_id`) USING BTREE,
  CONSTRAINT `articles_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `articles_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of articles
-- ----------------------------
INSERT INTO `articles` VALUES (1, 'MB báo lãi gần 8.000 tỷ đồng', 'MB báo lãi 6 tháng đầu năm tăng 56 lên gần 8.000 tỷ đồng tỷ lệ bao phủ nợ xấu của riêng ngân hàng mẹ tăng mạnh lên 311', 'MB báo lãi 6 tháng đầu năm tăng 56 lên gần 8.000 tỷ đồng tỷ lệ bao phủ nợ xấu của riêng ngân hàng mẹ tăng mạnh lên 311 MB báo lãi 6 tháng đầu năm tăng 56 lên gần 8.000 tỷ đồng tỷ lệ bao phủ nợ xấu của riêng ngân hàng mẹ tăng mạnh lên 311vxấu MB trích lập dự phòng hơn 3 đồng', '2021-07-18 14:17:17', 3, 8, 'https://bstyle.vn/wp-content/uploads/2019/12/ngan-hang-hdbank.jpg', 10);
INSERT INTO `articles` VALUES (2, 'Đề nghị ưu tiên vốn nghiên cứu khoa học phòng, chống Covid-19', 'Đại biểu đề xuất ưu tiên vốn cho nghiên cứu khoa học để phòng, chống dịch, trước mắt là nguồn vốn để phát triển công nghệ sản xuất vaccine. ', 'Đại biểu đề xuất ưu tiên vốn cho nghiên cứu khoa học để phòng, chống dịch, trước mắt là nguồn vốn để phát triển công nghệ sản xuất vaccine.\r\n\r\nChiều 27/7, thảo luận về kế hoạch đầu tư công trung hạn giai đoạn 2021-2025, đại biểu Nguyễn Tuấn Anh (Phó chủ nhiệm Ủy ban Khoa học, Công nghệ và Môi trường) cho biết, trong bối cảnh dịch bệnh hiện nay, một số bộ như Khoa học và Công nghệ, Y tế, Quốc phòng, Thông tin và Truyền thông đã đẩy mạnh đầu tư ứng dụng khoa học, công nghệ trong phòng, chống dịch bệnh. Nhiều nghiên cứu quan trọng về dịch tễ học cho kết quả tốt như chế tạo bộ Kit phát hiện Sars-Cov-2, sản xuất vaccine phòng Covid-19, sản xuất robot, máy thở, ứng dụng công nghệ kiểm soát dịch bệnh và hỗ trợ điều trị.\r\n\r\nTuy nhiên, việc sử dụng vốn nhà nước và ưu đãi thuế trong giai đoạn 2016-2020 chi ngân sách cho khoa học, công nghệ không đạt chỉ tiêu 2% tổng chi ngân sách nhà nước. Điều này ảnh hưởng đến vai trò vốn mồi của đầu tư công trong thu hút sự tham gia của khu vực tư nhân; không thúc đẩy hợp tác công tư trong nghiên cứu khoa học và ứng dụng khoa học, công nghệ.\r\n\r\nBên cạnh đó, tiếng nói chung giữa người làm khoa học và người quản lý tài chính chưa có trong một số vấn đề như quy định quản lý nhiệm vụ khoa học, sử dụng ngân sách... Việc chuyển giao kết quả phát triển nghiên cứu từ nguồn vốn hỗ trợ của nhà nước cho doanh nghiệp còn chậm, chưa có quy định cụ thể về sử dụng ngân sách trong chi trả cho thử nghiệm lâm sàng. Một số cơ chế ưu đãi thuế khó thực hiện do chưa đồng bộ trong quy định giữa quy định thuế và khoa học công nghệ.\r\n\r\nhttps://vcdn-vnexpress.vnecdn.net/2021/07/27/202107271506245880-Nguyen-Tuan-8763-3502-1627389969.jpg\r\n\r\nTheo ông Tuấn Anh, cử tri đánh giá cao Bộ Khoa học Công nghệ đã có tầm nhìn khi xây dựng một số nhiệm vụ nghiên cứu cơ bản từ năm 2011 như Chương trình khoa học trọng điểm cấp quốc gia giai đoạn 2011-2015. Theo đó, dự kiến sản phẩm của chương trình này là sản xuất được một số vaccine và sinh phẩm y tế đạt tiêu chuẩn các nước tiên tiến.\r\n\r\nVì vậy, ông đề nghị Quốc hội bố trí ngân sách giai đoạn 2021-2025 và hằng năm xem xét tiếp tục bố trí ưu tiên vốn kịp thời cho nghiên cứu khoa học, công nghệ trong phòng, chống dịch bệnh nguy hiểm mới phát sinh trên động vật và người, trước mắt là nguồn vốn cho phát triển công nghệ sản xuất vaccine phòng, chống Covid-19. \"Tôi đề nghị bổ sung nội dung này trong điều 1 dự thảo nghị quyết về kế hoạch đầu tư công trung hạn\", ông nói.\r\n\r\nPhó chủ nhiệm Ủy ban Khoa học Công nghệ Môi trường cũng đề nghị Chính phủ chỉ đạo giải quyết sớm các vướng mắc liên quan cơ chế ưu đãi thuế, đầu tư ngân sách nhà nước để tập trung nguồn lực cho khoa học công nghệ. Đồng thời, Chính phủ cần nghiên cứu xây dựng các thể chế, cơ chế đột phá vượt trội có kiểm soát về tài chính, các chính sách về thuế, cơ chế đầu tư mạo hiểm để huy động mạnh mẽ các nguồn lực xã hội đầu tư cho khoa học, công nghệ nói chung và phục vụ cho phòng, chống dịch bệnh nói riêng.\r\n\r\n\"Đề nghị nhiệm kỳ Quốc hội khóa XV, XVI ưu tiên xây dựng Trung tâm nghiên cứu và sản xuất vaccine quốc gia để phòng bệnh trong dài hạn\", ông Tuấn Anh nói.\r\n\r\nÔng cũng đề nghị Bộ Khoa học Công nghệ rà soát, công khai kết quả các nhiệm vụ nghiên cứu liên quan đến phòng, chống dịch bệnh để giúp cho đại biểu Quốc hội và cử tri giám sát được hiệu quả nghiên cứu.\r\n\r\nhttps://vcdn-vnexpress.vnecdn.net/2021/07/27/202107261139306915-Nguyen-Than-1265-4706-1627389969.jpg\r\n\r\nChung ý kiến, đại biểu Nguyễn Thành Trung cũng đề nghị Quốc hội rà soát, bố trí vốn ở mức cao hơn cho lĩnh vực khoa học, công nghệ vì hiện nay lĩnh vực này mới chỉ được bố trí khoảng 1,8% tổng chi ngân sách nhà nước.\r\n\r\nĐại biểu Đinh Thị Phương Lan (Phó chủ tịch Hội đồng dân tộc) cũng đề nghị tăng chi cho khoa học, công nghệ, đặc biệt là cho công nghệ thông tin, công nghệ sinh học, công nghệ môi trường, năng lượng sạch.\r\n\r\nGiải trình trước Quốc hội, Bộ trưởng Tài chính Hồ Đức Phớc cho biết, hiện nay chi cho khoa học công nghệ chiếm khoảng 1-1,5% tổng chi ngân sách nhà nước, chưa kể chi các dự án đầu tư phát triển và bố trí chi thường xuyên. Theo ông Phớc, do kế hoạch các địa phương và bộ, ngành giao chậm, quá trình chi tiêu không đảm bảo được tiến độ của dự án cho nên phải chuyển nguồn.\r\n\r\nBộ trưởng Tài chính cũng cho biết, hiện cơ chế của luật thuế và nghị định của Chính phủ đã có ưu đãi lớn đối với khoa học công nghệ. Ví dụ, thuế xuất nhập khẩu được miễn 5 năm đối với lĩnh vực khoa học, công nghệ, công nghệ cao; thuế thu nhập doanh nghiệp được giảm 4 năm kể từ khi nhà máy đi vào sản xuất, sử dụng và giảm 50% của 9 năm tiếp theo...', '2021-07-27 21:04:44', 1, 1, 'https://vnexpress.net/de-nghi-uu-tien-von-nghien-cuu-khoa-hoc-phong-chong-covid-19-4331543.html', 1);

-- ----------------------------
-- Table structure for category
-- ----------------------------
DROP TABLE IF EXISTS `category`;
CREATE TABLE `category`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `parent_id` int UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `parent_id`(`parent_id`) USING BTREE,
  CONSTRAINT `category_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 94 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of category
-- ----------------------------
INSERT INTO `category` VALUES (1, 'Thời sự', NULL);
INSERT INTO `category` VALUES (2, 'Góc nhìn', NULL);
INSERT INTO `category` VALUES (3, 'Thế giới', NULL);
INSERT INTO `category` VALUES (4, 'Kinh doanh', NULL);
INSERT INTO `category` VALUES (5, 'Khoa học', NULL);
INSERT INTO `category` VALUES (6, 'Giải trí', NULL);
INSERT INTO `category` VALUES (7, 'Thể thao', NULL);
INSERT INTO `category` VALUES (8, 'Pháp luật', NULL);
INSERT INTO `category` VALUES (9, 'Giáo dục', NULL);
INSERT INTO `category` VALUES (10, 'Sức khoẻ', NULL);
INSERT INTO `category` VALUES (11, 'Đời sống', NULL);
INSERT INTO `category` VALUES (12, 'Du lịch', NULL);
INSERT INTO `category` VALUES (13, 'Số hoá', NULL);
INSERT INTO `category` VALUES (14, 'Xe', NULL);
INSERT INTO `category` VALUES (15, 'Hài', NULL);
INSERT INTO `category` VALUES (16, 'Chính trị', 1);
INSERT INTO `category` VALUES (17, 'Giao thông', 1);
INSERT INTO `category` VALUES (18, 'Dân sinh', 1);
INSERT INTO `category` VALUES (19, 'Covid 19', 2);
INSERT INTO `category` VALUES (20, 'Chính trị & chính sách', 2);
INSERT INTO `category` VALUES (21, 'Môi trường', 2);
INSERT INTO `category` VALUES (22, 'Y tế & sức khoẻ', 2);
INSERT INTO `category` VALUES (23, 'Kinh doanh & quản trị', 2);
INSERT INTO `category` VALUES (24, 'Giáo dục & tri thức', 2);
INSERT INTO `category` VALUES (25, 'Văn hoá & lối sống', 2);
INSERT INTO `category` VALUES (26, 'Tư liệu', 3);
INSERT INTO `category` VALUES (27, 'Phân tích', 3);
INSERT INTO `category` VALUES (29, 'Người Việt 5 châu', 3);
INSERT INTO `category` VALUES (30, 'Cuộc sống đó đây', 3);
INSERT INTO `category` VALUES (31, 'Quân sự', 3);
INSERT INTO `category` VALUES (32, 'Quốc tế ', 4);
INSERT INTO `category` VALUES (33, 'Doanh nghiệp', 4);
INSERT INTO `category` VALUES (34, 'Chứng khoáng', 4);
INSERT INTO `category` VALUES (35, 'Bất động sản', 4);
INSERT INTO `category` VALUES (36, 'Ebank', 4);
INSERT INTO `category` VALUES (37, 'Vĩ mô', 4);
INSERT INTO `category` VALUES (38, 'Bảo hiểm', 4);
INSERT INTO `category` VALUES (39, 'Hàng hoá', 4);
INSERT INTO `category` VALUES (40, 'Tin tức', 5);
INSERT INTO `category` VALUES (41, 'Phát minh', 5);
INSERT INTO `category` VALUES (42, 'Ứng dụng', 5);
INSERT INTO `category` VALUES (43, 'Thế giới tự nhiên', 5);
INSERT INTO `category` VALUES (44, 'Thường thức', 5);
INSERT INTO `category` VALUES (45, 'Khoa học trong nước', 5);
INSERT INTO `category` VALUES (46, 'Giới sao', 6);
INSERT INTO `category` VALUES (47, 'Thời trang', 6);
INSERT INTO `category` VALUES (48, 'Làm đẹp', 6);
INSERT INTO `category` VALUES (49, 'Sách ', 6);
INSERT INTO `category` VALUES (50, 'Sân khấu - Mỹ thuật', 6);
INSERT INTO `category` VALUES (51, 'Bóng đá', 7);
INSERT INTO `category` VALUES (52, 'Lịch thi đấu', 7);
INSERT INTO `category` VALUES (53, 'Olympic Tokyo 2020', 7);
INSERT INTO `category` VALUES (54, 'World Cup 2022', 7);
INSERT INTO `category` VALUES (55, 'Hồ sơ phá án', 8);
INSERT INTO `category` VALUES (56, 'Tư vấn', 8);
INSERT INTO `category` VALUES (57, 'Tuyển sinh', 9);
INSERT INTO `category` VALUES (58, 'Điểm thi', 9);
INSERT INTO `category` VALUES (59, 'Du học', 9);
INSERT INTO `category` VALUES (60, 'Học tiếng anh', 9);
INSERT INTO `category` VALUES (61, 'Giáo dục 4.0', 9);
INSERT INTO `category` VALUES (62, 'Debate', 9);
INSERT INTO `category` VALUES (63, 'Tin tức', 10);
INSERT INTO `category` VALUES (64, 'Tư vấn', 10);
INSERT INTO `category` VALUES (65, 'Dinh dưỡng', 10);
INSERT INTO `category` VALUES (66, 'Khoẻ đẹp', 10);
INSERT INTO `category` VALUES (67, 'Đàn ông', 10);
INSERT INTO `category` VALUES (68, 'Vaccine', 10);
INSERT INTO `category` VALUES (69, 'Tổ ấm', 11);
INSERT INTO `category` VALUES (70, 'Bài học cuộc sống', 11);
INSERT INTO `category` VALUES (71, 'Nhà', 11);
INSERT INTO `category` VALUES (72, 'Tiêu dùng', 11);
INSERT INTO `category` VALUES (73, 'Cooking', 11);
INSERT INTO `category` VALUES (74, 'Điểm đến', 12);
INSERT INTO `category` VALUES (75, 'Dấu chân', 12);
INSERT INTO `category` VALUES (76, 'Safe Go', 12);
INSERT INTO `category` VALUES (77, 'Ăn và chơi', 12);
INSERT INTO `category` VALUES (78, 'Công nghệ', 13);
INSERT INTO `category` VALUES (79, 'Sản phẩm', 13);
INSERT INTO `category` VALUES (80, 'Diễn đàn', 13);
INSERT INTO `category` VALUES (81, 'CTO Summit 2021', 13);
INSERT INTO `category` VALUES (82, 'Thị trường', 14);
INSERT INTO `category` VALUES (83, 'Diễn đàn', 14);
INSERT INTO `category` VALUES (84, 'Đánh giá', 14);
INSERT INTO `category` VALUES (85, 'Bảng giá ôtô', 14);
INSERT INTO `category` VALUES (86, 'Xe điện', 14);
INSERT INTO `category` VALUES (87, 'Cẩm nang mua xe', 14);
INSERT INTO `category` VALUES (88, 'Mua bán', 14);
INSERT INTO `category` VALUES (89, 'Thi bằng lái', 14);
INSERT INTO `category` VALUES (90, 'Cười', 15);
INSERT INTO `category` VALUES (91, 'Đố vui', 15);
INSERT INTO `category` VALUES (92, 'Chuyện lạ', 15);
INSERT INTO `category` VALUES (93, 'Thú cưng', 15);

-- ----------------------------
-- Table structure for comments
-- ----------------------------
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `commenter_id` int UNSIGNED NULL DEFAULT NULL,
  `article_id` int UNSIGNED NULL DEFAULT NULL,
  `post_time` datetime NULL DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `article_id`(`article_id`) USING BTREE,
  INDEX `commenter_id`(`commenter_id`) USING BTREE,
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`commenter_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of comments
-- ----------------------------
INSERT INTO `comments` VALUES (1, 2, 1, '2021-07-21 18:17:17', 'Hay quá!');

-- ----------------------------
-- Table structure for reporters
-- ----------------------------
DROP TABLE IF EXISTS `reporters`;
CREATE TABLE `reporters`  (
  `user_id` int UNSIGNED NOT NULL,
  `pen_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`) USING BTREE,
  CONSTRAINT `reporters_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of reporters
-- ----------------------------
INSERT INTO `reporters` VALUES (3, 'Trần Toàn');

-- ----------------------------
-- Table structure for tags
-- ----------------------------
DROP TABLE IF EXISTS `tags`;
CREATE TABLE `tags`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `tag_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tags
-- ----------------------------
INSERT INTO `tags` VALUES (1, 'Ngân hàng');
INSERT INTO `tags` VALUES (2, 'Tiền');
INSERT INTO `tags` VALUES (3, 'Tài chính');
INSERT INTO `tags` VALUES (4, 'Lãi xuất');

-- ----------------------------
-- Table structure for user_types
-- ----------------------------
DROP TABLE IF EXISTS `user_types`;
CREATE TABLE `user_types`  (
  `id` int UNSIGNED NOT NULL,
  `user_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_types
-- ----------------------------
INSERT INTO `user_types` VALUES (0, 'guess');
INSERT INTO `user_types` VALUES (1, 'reporter');
INSERT INTO `user_types` VALUES (2, 'editor');
INSERT INTO `user_types` VALUES (3, 'admin');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL unique,
  `name` varchar(200) NOT NULL,
  `email` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `birthday` date NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `user_type` int UNSIGNED NOT NULL,
  `subcription_due_date` datetime default null,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_type`(`user_type`) USING BTREE,
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`user_type`) REFERENCES `user_types` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'duong', 'Nguyen duong', 'duong@gmail.com', '2000-01-01', '123', 0, null);
INSERT INTO `users` VALUES (2, 'tran', 'Nguyen duong', 'dgg@gmail.com', '2004-01-01', '123', 0, null);
INSERT INTO `users` VALUES (3, 'toan', 'Nguyen duong', 'eg@gmail.com', '2005-01-01', '123', 1, null);
INSERT INTO `users` VALUES (4, 'quan', 'Nguyen duong', 'durhong@gmail.com', '2002-01-01', '123', 2, null);
INSERT INTO `users` VALUES (5, 'tuan', 'Nguyen duong', 'tuan@gmail.com', '2001-01-07', '123', 3, null);

SET FOREIGN_KEY_CHECKS = 1;
