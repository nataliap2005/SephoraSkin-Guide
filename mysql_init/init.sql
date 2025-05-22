-- Crear la base de datos sephoraproductos
CREATE DATABASE IF NOT EXISTS sephoraproductos;
USE sephoraproductos;

CREATE TABLE IF NOT EXISTS productos (
  product_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(255) NOT NULL,
  brand_id VARCHAR(50) NOT NULL,
  brand_name VARCHAR(255) NOT NULL,
  ingredients TEXT NOT NULL,
  primary_category VARCHAR(100) NOT NULL,
  secondary_category VARCHAR(100) NOT NULL,
  tertiary_category VARCHAR(100) NOT NULL,
  price_usd DECIMAL(10,2) NOT NULL,
  size VARCHAR(50) NOT NULL,
  characteristics LONGTEXT NOT NULL,
  highlights TEXT NOT NULL,
  online_only TINYINT(1) NOT NULL DEFAULT '0',
  limited_edition TINYINT(1) NOT NULL DEFAULT '0',
  new TINYINT(1) NOT NULL DEFAULT '0',
  sephora_exclusive TINYINT(1) NOT NULL DEFAULT '0',
  out_of_stock TINYINT(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (product_id),
  UNIQUE KEY unique_product_name (product_name)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Crear la base de datos favoritosSephora
CREATE DATABASE IF NOT EXISTS favoritosSephora;
USE favoritosSephora;

CREATE TABLE IF NOT EXISTS favoritos (
  emailClient VARCHAR(255) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  fecha_agregado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (emailClient, product_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Crear la base de datos sephorausuarios
CREATE DATABASE IF NOT EXISTS sephorausuarios;
USE sephorausuarios;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'usuario') DEFAULT 'usuario',
  historial JSON DEFAULT '{}',
  PRIMARY KEY (id),
  UNIQUE KEY email (email)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Crear la base de datos sephoraresenas
CREATE DATABASE IF NOT EXISTS sephoraresenas;
USE sephoraresenas;

CREATE TABLE IF NOT EXISTS resenas (
  nombreCliente VARCHAR(255) NOT NULL,
  emailCliente VARCHAR(255) NOT NULL,
  nombreProductos VARCHAR(255) NOT NULL,
  comentarios TEXT NOT NULL,
  rating INT NOT NULL,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (emailCliente, nombreProductos)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

