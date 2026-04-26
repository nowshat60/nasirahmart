-- SQL Schema for NasirahMart Advanced Features

-- Table for Products (if not already exists)
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    category_id INT,
    category_name VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    cutprice DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    quantity INT DEFAULT 0,
    min_stock_level INT DEFAULT 5,
    discount_percentage INT DEFAULT 0,
    image TEXT,
    star INT DEFAULT 5,
    status ENUM('published', 'draft', 'archived') DEFAULT 'published',
    unit VARCHAR(50),
    short_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Locations (for "Deliver To" modal)
CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    country_name VARCHAR(100) NOT NULL,
    country_code CHAR(2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Seller Applications
CREATE TABLE IF NOT EXISTS seller_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    shop_name VARCHAR(255) NOT NULL,
    shop_category VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    id_proof_path TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Service Bookings
CREATE TABLE IF NOT EXISTS service_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    booking_date DATE NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Gift Card Purchases
CREATE TABLE IF NOT EXISTS gift_card_purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    theme VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    message TEXT,
    status ENUM('pending', 'sent', 'redeemed') DEFAULT 'sent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT, -- NULL for guest or support
    sender ENUM('user', 'support') NOT NULL,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some initial locations
INSERT INTO locations (country_name, country_code) VALUES 
('Bangladesh', 'BD'),
('USA', 'US'),
('UK', 'GB'),
('Canada', 'CA'),
('Australia', 'AU');
