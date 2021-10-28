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

 Date: 16/08/2021 21:25:23
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `birthday` date NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `user_type` int UNSIGNED NOT NULL,
  `subcription_due_date` datetime NULL DEFAULT NULL,
  `otp` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `is_active` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `user_name`(`user_name`) USING BTREE,
  INDEX `user_type`(`user_type`) USING BTREE,
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`user_type`) REFERENCES `user_types` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 36 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'duong', 'Nguyen duong', 'duong@gmail.com', '2000-01-01', '$2a$10$C2pHtBStTViGyk3mjvfwZu.7JDvXi3GHp7GA3hPs4qydgWdLFFOXi', 0, '2022-01-03 19:43:30', '222222', 1);
INSERT INTO `users` VALUES (8, 'd', 'Trần Quang Huy', 'huytrquang1103@gmail.com', '2021-08-03', '$2a$10$C2pHtBStTViGyk3mjvfwZu.7JDvXi3GHp7GA3hPs4qydgWdLFFOXi', 0, '2021-08-15 18:24:44', '222222', 1);
INSERT INTO `users` VALUES (9, 'd123', '123', 'huytrquang1103@gmail.com', '2021-08-02', '$2a$10$5nvExbIcaAJ6j8rNHz9vBuwDG8VNSqvdBEXEKA7CZND9k3/1q2Nua', 0, '2021-08-16 19:45:22', '222222', 1);
INSERT INTO `users` VALUES (10, '31', 'Trần Quang Huy', 'huytrquang1103@gmail.com', '2021-08-04', '$2a$10$7d3N1QPW17SvJJYn8YCWT.Uuq.Gq4DovWu7.w1EsOqfARRdiLmYdK', 0, '2021-08-16 19:45:27', '222222', 1);
INSERT INTO `users` VALUES (11, '124res', '12', 'huytrquang1103@gmail.com', '2021-08-03', '$2a$10$B3XqblYkPltgEPO1C0Jxgu0QqPSpMrOvvtBBdNxPDS5ArTGRB1UMC', 0, '2021-12-01 18:19:37', '222222', 1);
INSERT INTO `users` VALUES (13, 'd1234124', 'Vip', 'a2bc@gmail.com', '2021-08-01', '$2a$10$S2qoE3ley0dwjFYjcImdQ.f8.giS6Jpjdth/a3nvmi2.lmZLAdYDi', 0, '2021-08-16 19:45:31', '222222', 1);
INSERT INTO `users` VALUES (23, 'huy', 'Trần Quang Huy', 'huytrquang1103@gmail.com', '2021-08-03', '$2a$10$/qlcAno7Asrcygtj1WUFCu.53gzFEVjvdiE.BdFdyYNNM.gHUZIXq', 1, NULL, '222222', 1);
INSERT INTO `users` VALUES (24, 'abc', 'Trần Quang Huy', 'huytrquang1103@gmail.com', '2021-08-03', '$2a$10$paqtt/AYK2za8KxPo2bo6eVHi0BTp/8v2gj7pzwAkCQKXCOoq8mzS', 1, NULL, '222222', 1);
INSERT INTO `users` VALUES (33, 'asdasdas', 'Trần Quang Huy', 'huytrquang1103@gmail.com', '2021-08-20', '$2a$10$xqRhdM79Fvqb6PlJcdSn4OMZEySFoh2ukM8MxVwGjFVfa.7/65QIW', 0, NULL, '110780', 0);
INSERT INTO `users` VALUES (34, 'admin', 'Trần Quang Huy', 'huytrquang1103@gmail.com', '2021-08-03', '$2a$10$O5MDZ1w67BiT/7JZ7XnqGOUTz9Z/tAVLr.aGp7UI9.3ZAhzc8TzF.', 3, NULL, '', 1);
INSERT INTO `users` VALUES (35, 'editor', 'Trần Quang Huy', 'huytrquang1103@gmail.com', '2021-08-01', '$2a$10$ze1f9GVnMj3VXoC6NFWEw.bvuQ/v/m6lLcXYr1rBvJIja8PpXPzKm', 2, NULL, '', 1);

SET FOREIGN_KEY_CHECKS = 1;
