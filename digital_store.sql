-- phpMyAdmin SQL Dump
-- version 4.9.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Feb 06, 2026 at 03:27 AM
-- Server version: 8.0.17
-- PHP Version: 7.3.10

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `digital_store`
--
DROP DATABASE IF EXISTS `digital_store`;
CREATE DATABASE IF NOT EXISTS `digital_store` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `digital_store`;

-- --------------------------------------------------------
--
-- Table structure for table `roles`
--
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

INSERT INTO `roles` (role_id, role_name, description) VALUES
(1, 'admin', 'Administrator'),
(3, 'user', 'Normal user');

-- --------------------------------------------------------

--
-- Table structure for table `downloads`
--
-- Creation: Feb 06, 2026 at 03:17 AM
--

-- (optional) downloads tracking
DROP TABLE IF EXISTS `downloads`;
CREATE TABLE `downloads` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `download_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------
--
-- Table structure for table `download_tokens`
--
DROP TABLE IF EXISTS `download_tokens`;
CREATE TABLE `download_tokens` (
  `id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `idx_token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--
-- Creation: Feb 06, 2026 at 03:17 AM
--

DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `customer_name` varchar(255) COLLATE utf8_general_ci DEFAULT NULL,
  `customer_email` varchar(255) COLLATE utf8_general_ci DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  `status` varchar(20) COLLATE utf8_general_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--
-- Creation: Feb 06, 2026 at 03:17 AM
--

DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--
-- Creation: Feb 06, 2026 at 03:17 AM
--

DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8_general_ci DEFAULT NULL,
  `description` text COLLATE utf8_general_ci,
  `price` decimal(10,2) DEFAULT NULL,
  `file_path` varchar(255) COLLATE utf8_general_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `file_path`, `created_at`) VALUES
(1, 'สรุป PHP พื้นฐาน', 'ไฟล์ PDF สำหรับมือใหม่', '49.00', 'uploads/php_basic.pdf', '2026-02-06 03:18:08'),
(2, 'E-book HTML', 'E-book สั้น ๆ HTML', '59.00', 'uploads/ebook_html.pdf', '2026-02-06 03:18:08'),
(3, 'Resume Template', 'Resume สวย ๆ', '99.00', 'uploads/resume.zip', '2026-02-06 03:18:08');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--
-- Creation: Feb 06, 2026 at 03:17 AM
--

-- unified users table with role
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `u_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL DEFAULT 1,
  `username` varchar(100) COLLATE utf8_general_ci NOT NULL,
  `email` varchar(255) COLLATE utf8_general_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8_general_ci NOT NULL,
  `display_name` varchar(255) COLLATE utf8_general_ci DEFAULT NULL,
  `avatar_url` varchar(255) COLLATE utf8_general_ci DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `idx_users_email` (`email`),
  UNIQUE KEY `idx_users_username` (`username`),
  FULLTEXT KEY `ft_users_search` (`username`, `display_name`, `email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Seed: ตัวอย่างผู้ใช้และแอดมิน (รหัสผ่านเป็น bcrypt hash ตัวอย่าง — ให้แทนที่ด้วย hash ที่ปลอดภัย)
INSERT INTO `users` (u_id, role_id, username, email, password_hash, display_name, avatar_url, created_at) VALUES
(1, 1, 'admin', 'admin@example.com', '$2b$10$abcdefghijklmnopqrstuvABCDEFGHIJ1234567890abcd', 'Administrator', NULL, NOW()),
(2, 3, 'demo_user', 'user@example.com', '$2b$10$abcdefghijklmnopqrstuvABCDEFGHIJ1234567890abcd', 'Demo User', NULL, NOW());

--
-- Indexes for dumped tables
--

--
-- Indexes for table `downloads`
--
ALTER TABLE `downloads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
ALTER TABLE `users`
  ADD PRIMARY KEY (`u_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `downloads`
--
ALTER TABLE `downloads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;


ALTER TABLE `users`
  MODIFY `u_id` int(11) NOT NULL AUTO_INCREMENT;

-- Indexes for table `download_tokens`
ALTER TABLE `download_tokens`
  ADD PRIMARY KEY (`id`);

-- AUTO_INCREMENT for table `download_tokens`
ALTER TABLE `download_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

-- foreign keys for download_tokens
ALTER TABLE `download_tokens`
  ADD CONSTRAINT `fk_dt_order` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE;
ALTER TABLE `download_tokens`
  ADD CONSTRAINT `fk_dt_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT;

-- foreign keys (optional but recommended)
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE;
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT;
ALTER TABLE `downloads`
  ADD CONSTRAINT `fk_download_order` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE;

SET FOREIGN_KEY_CHECKS=1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
SET FOREIGN_KEY_CHECKS=1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
