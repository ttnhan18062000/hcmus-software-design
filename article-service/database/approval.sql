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

 Date: 16/08/2021 21:26:08
*/

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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of approval
-- ----------------------------
INSERT INTO `approval` VALUES (1, 35, 1, NULL, '2021-07-18', '2021-07-14 14:17:17');
INSERT INTO `approval` VALUES (3, 35, 0, 'Chưa rõ chi tiết', NULL, '2021-07-14 14:17:17');
INSERT INTO `approval` VALUES (4, 35, 1, NULL, '2021-07-18', '2021-07-14 14:17:17');
INSERT INTO `approval` VALUES (5, 35, 1, NULL, '2021-07-18', '2021-07-14 14:17:17');
INSERT INTO `approval` VALUES (6, 35, 1, NULL, '2021-07-18', '2021-07-14 14:17:17');

SET FOREIGN_KEY_CHECKS = 1;
