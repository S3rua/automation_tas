-- Membuat database (kalau belum ada)
CREATE DATABASE IF NOT EXISTS toko_tas_marketing
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE toko_tas_marketing;

-- Tabel 1: produk (tas)
CREATE TABLE IF NOT EXISTS products (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  category      VARCHAR(80)  NOT NULL,
  price         INT UNSIGNED NOT NULL,
  stock         INT UNSIGNED NOT NULL DEFAULT 0,
  description   TEXT NULL,
  color         VARCHAR(80)  NULL,
  photo         VARCHAR(255) NULL,
  availability  ENUM('tersedia', 'habis') NOT NULL DEFAULT 'tersedia',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabel 2: catatan hasil promosi
CREATE TABLE IF NOT EXISTS promotions (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id    INT UNSIGNED NOT NULL,
  promo_date    DATE NOT NULL,
  channel       ENUM('status', 'chat') NOT NULL,
  inquiries     INT UNSIGNED NOT NULL DEFAULT 0,
  orders        INT UNSIGNED NOT NULL DEFAULT 0,
  sales_amount  BIGINT UNSIGNED NOT NULL DEFAULT 0,
  notes         TEXT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_promotions_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Tabel 3: template balasan WhatsApp
CREATE TABLE IF NOT EXISTS reply_templates (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  type        ENUM('harga', 'stok', 'warna', 'ukuran', 'lokasi', 'cara_pesan') NOT NULL,
  title       VARCHAR(100) NOT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
              ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;