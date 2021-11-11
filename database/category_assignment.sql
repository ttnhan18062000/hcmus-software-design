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

 Date: 16/08/2021 21:25:40
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for category_assignment
-- ----------------------------
DROP TABLE IF EXISTS `category_assignment`;
CREATE TABLE `category_assignment`  (
  `editor_id` int UNSIGNED NOT NULL,
  `category_id` int UNSIGNED NOT NULL,
  PRIMARY KEY (`editor_id`, `category_id`) USING BTREE,
  INDEX `category_id`(`category_id`) USING BTREE,
  CONSTRAINT `category_assignment_ibfk_1` FOREIGN KEY (`editor_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `category_assignment_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of category_assignment
-- ----------------------------
INSERT INTO `category_assignment` VALUES (35, 8);
INSERT INTO `category_assignment` VALUES (35, 16);
INSERT INTO `category_assignment` VALUES (35, 26);
INSERT INTO `category_assignment` VALUES (35, 44);
INSERT INTO `category_assignment` VALUES (35, 46);

SET FOREIGN_KEY_CHECKS = 1;
