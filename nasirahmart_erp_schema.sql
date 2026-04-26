-- SQL Schema for NasirahMart Advanced ERP & E-commerce

-- 1. Accounting Tables
CREATE TABLE IF NOT EXISTS accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('Asset', 'Liability', 'Equity', 'Revenue', 'Expense') NOT NULL,
    parent_id INT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES accounts(id)
);

CREATE TABLE IF NOT EXISTS journal_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entry_date DATE NOT NULL,
    description TEXT,
    reference_type VARCHAR(50), -- e.g., 'Order', 'Expense', 'Adjustment'
    reference_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    journal_entry_id INT NOT NULL,
    account_id INT NOT NULL,
    debit DECIMAL(15, 2) DEFAULT 0.00,
    credit DECIMAL(15, 2) DEFAULT 0.00,
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- 2. Extended E-commerce Tables
CREATE TABLE IF NOT EXISTS warehouses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE
);

-- Update items table to support multi-warehouse and cost price
ALTER TABLE items ADD COLUMN cost_price DECIMAL(15, 2) DEFAULT 0.00 AFTER price;
ALTER TABLE items ADD COLUMN sku VARCHAR(50) UNIQUE AFTER item_name;
ALTER TABLE items ADD COLUMN min_stock_level INT DEFAULT 5 AFTER quantity;

CREATE TABLE IF NOT EXISTS inventory_stocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    warehouse_id INT NOT NULL,
    quantity INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES items(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    expense_date DATE NOT NULL,
    description TEXT,
    account_id INT NOT NULL, -- Link to CoA
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- Initial Chart of Accounts Setup
INSERT INTO accounts (code, name, type) VALUES 
('1000', 'Assets', 'Asset'),
('1100', 'Cash', 'Asset'),
('1200', 'Accounts Receivable', 'Asset'),
('1300', 'Inventory', 'Asset'),
('2000', 'Liabilities', 'Liability'),
('2100', 'Accounts Payable', 'Liability'),
('3000', 'Equity', 'Equity'),
('4000', 'Revenue', 'Revenue'),
('4100', 'Sales Revenue', 'Revenue'),
('5000', 'Expenses', 'Expense'),
('5100', 'Cost of Goods Sold', 'Expense'),
('5200', 'Operational Expenses', 'Expense');
