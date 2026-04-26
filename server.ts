import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple JSON-based storage mock for MySQL
import fs from "fs/promises";
import { existsSync } from "fs";

const DATA_DIR = path.join(__dirname, "data");
if (!existsSync(DATA_DIR)) {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function getTableData(table: string) {
  try {
    const filePath = path.join(DATA_DIR, `${table}.json`);
    if (!existsSync(filePath)) {
      await fs.writeFile(filePath, JSON.stringify([], null, 2));
      return [];
    }
    const content = await fs.readFile(filePath, "utf-8");
    if (!content || content.trim() === "") return [];
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading table ${table}:`, error);
    return [];
  }
}

async function saveTableData(table: string, data: any[]) {
  const filePath = path.join(DATA_DIR, `${table}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

const pool = {
  async query(sql: string, params: any[] = []) {
    // Basic SQL parser for mock
    const normalizedSql = sql.trim().toLowerCase();
    
    if (normalizedSql.includes("coalesce(sum(totalamount)")) {
      const orders = await getTableData("orders");
      const products = await getTableData("products");
      const users = await getTableData("users");
      
      return [[{
        total_sales: orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0),
        total_orders: orders.length,
        total_customers: users.length,
        inventory_value: products.reduce((sum: number, p: any) => sum + ((p.price || 0) * (p.quantity || 0)), 0),
        low_stock_count: products.filter((p: any) => (p.quantity || 0) <= 5).length
      }]];
    }

    if (normalizedSql.startsWith("select * from")) {
      const parts = sql.trim().split(/\s+/);
      const table = parts[3].replace(/[`]/g, "").split(" ")[0];
      let data = await getTableData(table);
      
      // Handle WHERE
      if (normalizedSql.includes("where")) {
        const whereIndex = normalizedSql.indexOf("where");
        const afterWhere = sql.substring(whereIndex + 5).trim();
        const nextClauseIndex = Math.min(
          afterWhere.toLowerCase().indexOf("order by") === -1 ? Infinity : afterWhere.toLowerCase().indexOf("order by"),
          afterWhere.toLowerCase().indexOf("limit") === -1 ? Infinity : afterWhere.toLowerCase().indexOf("limit")
        );
        const whereClause = nextClauseIndex === Infinity ? afterWhere : afterWhere.substring(0, nextClauseIndex).trim();
        
        const [field, valueOrPlaceholder] = whereClause.split("=").map(s => s.trim());
        const cleanField = field.replace(/[`]/g, "");
        const value = valueOrPlaceholder === "?" ? params[0] : valueOrPlaceholder.replace(/['"]/g, "");
        
        data = (Array.isArray(data) ? data : []).filter((item: any) => String(item[cleanField]) === String(value));
      }

      // Handle ORDER BY
      if (normalizedSql.includes("order by")) {
        const orderByParts = normalizedSql.split("order by")[1].trim().split(/\s+/);
        const orderField = orderByParts[0].replace(/[`]/g, "");
        const direction = orderByParts[1] === "asc" ? 1 : -1;
        data = (Array.isArray(data) ? data : []).sort((a: any, b: any) => (a[orderField] > b[orderField] ? -direction : direction));
      }

      // Handle LIMIT
      if (normalizedSql.includes("limit")) {
        const limitParts = normalizedSql.split("limit")[1].trim().split(/\s+/);
        const limitCount = parseInt(limitParts[0]);
        if (!isNaN(limitCount)) {
          data = (Array.isArray(data) ? data : []).slice(0, limitCount);
        }
      }

      return [data];
    }

    if (normalizedSql.startsWith("insert into")) {
      const table = sql.split(/\s+/)[2].replace(/[`]/g, "");
      const data = await getTableData(table);
      const newItem = { ...params[0], id: Date.now() };
      data.push(newItem);
      await saveTableData(table, data);
      return [{ insertId: newItem.id }];
    }

    if (normalizedSql.startsWith("update")) {
      const table = sql.split(/\s+/)[1].replace(/[`]/g, "");
      const data = await getTableData(table);
      const updates = params[0];
      const id = params[1];
      const index = data.findIndex((item: any) => String(item.id) === String(id));
      if (index !== -1) {
        data[index] = { ...data[index], ...updates };
        await saveTableData(table, data);
      }
      return [{ affectedRows: 1 }];
    }

    if (normalizedSql.startsWith("delete from")) {
      const table = sql.split(/\s+/)[2].replace(/[`]/g, "");
      const data = await getTableData(table);
      const id = params[0];
      const newData = data.filter((item: any) => String(item.id) !== String(id));
      await saveTableData(table, newData);
      return [{ affectedRows: 1 }];
    }

    return [[]];
  },
  async getConnection() {
    return {
      query: (sql: string, params: any[]) => this.query(sql, params),
      beginTransaction: async () => {},
      commit: async () => {},
      rollback: async () => {},
      release: () => {}
    };
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

async function startServer() {
  try {
    const app = express();
    const httpServer = createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    // Use 5173 for local dev (Vite standard), 3000 for AI Studio environment
    const PORT = process.env.APP_PORT ? parseInt(process.env.APP_PORT) : 3000;

    app.use(cors());
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
    
    // Request logging middleware
    app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
      next();
    });

    app.use('/uploads', express.static('public/uploads'));
    
    // Auth API - Login
    app.post("/api/login", async (req, res) => {
      const { email, password } = req.body;
      try {
        // Special check for user's requested admin credentials
        if (email === "admin@example.com" && password === "123456") {
          return res.json({
            success: true,
            user: {
              id: "admin-id",
              firstName: "Admin",
              lastName: "User",
              email: "admin@example.com",
              role: "admin",
              status: "active"
            }
          });
        }

        const [rows]: any = await pool.query("SELECT * FROM users WHERE email = ? AND password = ?", [email, password]);
        
        if (rows.length > 0) {
          const user = rows[0];
          return res.json({
            success: true,
            user: {
              id: user.id,
              firstName: user.first_name || user.firstName,
              lastName: user.last_name || user.lastName,
              email: user.email,
              role: user.role || 'user',
              status: user.status || 'active'
            }
          });
        }
        res.status(401).json({ success: false, message: "Invalid credentials" });
      } catch (error) {
        console.error("Login database error:", error);
        res.status(500).json({ success: false, message: "Server error during login" });
      }
    });

    // --- Products API ---
    app.get("/api/products", async (req, res) => {
      try {
        const [rows]: any = await pool.query("SELECT * FROM products ORDER BY createdAt DESC");
        res.json(Array.isArray(rows) ? rows : []);
      } catch (error) {
        console.error("Fetch products error:", error);
        res.json([]);
      }
    });

    app.post("/api/products", async (req, res) => {
      try {
        const [result]: any = await pool.query("INSERT INTO products SET ?", [req.body]);
        res.json({ success: true, id: result.insertId });
      } catch (error) {
        console.error("Add product error:", error);
        res.status(500).json({ success: false });
      }
    });

    app.get("/api/products/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const [rows]: any = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
        if (rows.length === 0) return res.status(404).json({ message: "Product not found" });
        res.json(rows[0]);
      } catch (error) {
        console.error("Fetch product error:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.put("/api/products/:id", async (req, res) => {
      const { id } = req.params;
      const updates = { ...req.body };
      delete updates.id;
      try {
        await pool.query("UPDATE products SET ? WHERE id = ?", [updates, id]);
        res.json({ success: true });
      } catch (error) {
        console.error("Update product error:", error);
        res.status(500).json({ success: false });
      }
    });

    app.delete("/api/products/:id", async (req, res) => {
      try {
        await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]);
        res.json({ success: true });
      } catch (error) {
        console.error("Delete product error:", error);
        res.status(500).json({ success: false });
      }
    });

    // --- Categories API ---
    app.get("/api/categories", async (req, res) => {
      try {
        const [rows]: any = await pool.query("SELECT * FROM categories ORDER BY name ASC");
        res.json(Array.isArray(rows) ? rows : []);
      } catch (error) {
        console.error("Fetch categories error:", error);
        res.json([]);
      }
    });

    app.post("/api/categories", async (req, res) => {
      try {
        const [result]: any = await pool.query("INSERT INTO categories SET ?", [req.body]);
        res.json({ success: true, id: result.insertId });
      } catch (error) {
        console.error("Add category error:", error);
        res.status(500).json({ success: false });
      }
    });

    app.put("/api/categories/:id", async (req, res) => {
      const updates = { ...req.body };
      delete updates.id;
      try {
        await pool.query("UPDATE categories SET ? WHERE id = ?", [updates, req.params.id]);
        res.json({ success: true });
      } catch (error) {
        console.error("Update category error:", error);
        res.status(500).json({ success: false });
      }
    });

    app.delete("/api/categories/:id", async (req, res) => {
      try {
        await pool.query("DELETE FROM categories WHERE id = ?", [req.params.id]);
        res.json({ success: true });
      } catch (error) {
        console.error("Delete category error:", error);
        res.status(500).json({ success: false });
      }
    });

    // --- Orders API ---
    app.get("/api/admin/orders", async (req, res) => {
      try {
        const [orders]: any = await pool.query("SELECT * FROM orders ORDER BY createdAt DESC");
        for (let order of orders) {
          const [items]: any = await pool.query("SELECT * FROM order_items WHERE orderId = ?", [order.id]);
          order.items = items;
        }
        res.json(orders);
      } catch (error) {
        console.error("Admin fetch orders error:", error);
        res.status(500).json([]);
      }
    });

    app.get("/api/orders", async (req, res) => {
      const { userId } = req.query;
      try {
        let q = "SELECT * FROM orders";
        let params = [];
        if (userId) {
          q += " WHERE userId = ?";
          params.push(userId);
        }
        q += " ORDER BY createdAt DESC";
        const [orders]: any = await pool.query(q, params);
        
        for (let order of orders) {
          const [items]: any = await pool.query("SELECT * FROM order_items WHERE orderId = ?", [order.id]);
          order.items = items;
        }
        res.json(orders);
      } catch (error) {
        console.error("Fetch orders error:", error);
        res.status(500).json([]);
      }
    });

    app.get("/api/orders/latest", async (req, res) => {
      const { userId } = req.query;
      try {
        const [rows]: any = await pool.query("SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC LIMIT 1", [userId]);
        res.json(rows[0] || {});
      } catch (error) {
        console.error("Fetch latest order error:", error);
        res.status(500).json({});
      }
    });

    app.post("/api/orders", async (req, res) => {
      const { userId, items, total, shippingAddress, paymentMethod } = req.body;
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        const [orderResult]: any = await connection.query(
          "INSERT INTO orders (userId, totalAmount, shippingAddress, paymentMethod, status, createdAt) VALUES (?, ?, ?, ?, ?, NOW())",
          [userId, total, JSON.stringify(shippingAddress), paymentMethod, 'pending']
        );
        const orderId = orderResult.insertId;
        const itemValues = items.map((item: any) => [orderId, item.id, item.item_name, item.quantity, item.price]);
        await connection.query("INSERT INTO order_items (orderId, productId, productName, quantity, price) VALUES ?", [itemValues]);
        await connection.commit();
        res.json({ success: true, orderId });
      } catch (error) {
        await connection.rollback();
        console.error("Order processing error:", error);
        res.status(500).json({ success: false, message: "Failed to place order" });
      } finally { connection.release(); }
    });

    app.put("/api/admin/orders/:id/status", async (req, res) => {
      const { status } = req.body;
      try {
        await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id]);
        res.json({ success: true });
      } catch (error) {
        console.error("Update order status error:", error);
        res.status(500).json({ success: false });
      }
    });

    // --- Coupons API ---
    app.get("/api/coupons", async (req, res) => {
      try {
        const [rows]: any = await pool.query("SELECT * FROM coupons ORDER BY code ASC");
        res.json(rows);
      } catch (error) {
        console.error("Fetch coupons error:", error);
        res.status(500).json([]);
      }
    });

    app.post("/api/coupons", async (req, res) => {
      try {
        const [result]: any = await pool.query("INSERT INTO coupons SET ?", [req.body]);
        res.json({ success: true, id: result.insertId });
      } catch (error) {
        console.error("Add coupon error:", error);
        res.status(500).json({ success: false });
      }
    });

    app.put("/api/coupons/:id", async (req, res) => {
      const updates = { ...req.body };
      delete updates.id;
      try {
        await pool.query("UPDATE coupons SET ? WHERE id = ?", [updates, req.params.id]);
        res.json({ success: true });
      } catch (error) {
        console.error("Update coupon error:", error);
        res.status(500).json({ success: false });
      }
    });

    app.delete("/api/coupons/:id", async (req, res) => {
      try {
        await pool.query("DELETE FROM coupons WHERE id = ?", [req.params.id]);
        res.json({ success: true });
      } catch (error) {
        console.error("Delete coupon error:", error);
        res.status(500).json({ success: false });
      }
    });

    // --- Settings API ---
    app.get("/api/settings", async (req, res) => {
      try {
        const [rows]: any = await pool.query("SELECT * FROM settings WHERE id = 'global'");
        if (rows.length > 0) {
          const settings = rows[0];
          // Handle JSON fields if they are strings
          const social_links = typeof settings.social_links === 'string' ? JSON.parse(settings.social_links) : settings.social_links;
          res.json({ ...settings, social_links });
        } else {
          res.json({});
        }
      } catch (error) {
        console.error("Fetch settings error:", error);
        res.status(500).json({});
      }
    });

    app.put("/api/settings", async (req, res) => {
      try {
        const settings = { ...req.body };
        if (settings.social_links && typeof settings.social_links !== 'string') {
          settings.social_links = JSON.stringify(settings.social_links);
        }
        
        const [rows]: any = await pool.query("SELECT id FROM settings WHERE id = 'global'");
        if (rows.length > 0) {
          await pool.query("UPDATE settings SET ? WHERE id = 'global'", [settings]);
        } else {
          await pool.query("INSERT INTO settings SET ?", [{ ...settings, id: 'global' }]);
        }
        res.json({ success: true });
      } catch (error) {
        console.error("Update settings error:", error);
        res.status(500).json({ success: false });
      }
    });

    // --- User Management ---
    app.get("/api/admin/users", async (req, res) => {
      try {
        const [rows]: any = await pool.query("SELECT id, firstName, lastName, email, role, status, createdAt FROM users");
        res.json(rows);
      } catch (error) {
        console.error("Admin fetch users error:", error);
        res.status(500).json([]);
      }
    });

    app.put("/api/admin/users/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const updates = { ...req.body };
        delete updates.id;
        await pool.query("UPDATE users SET ? WHERE id = ?", [updates, id]);
        res.json({ success: true });
      } catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({ success: false });
      }
    });

    app.delete("/api/admin/users/:id", async (req, res) => {
      try {
        await pool.query("DELETE FROM users WHERE id = ?", [req.params.id]);
        res.json({ success: true });
      } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ success: false });
      }
    });

    // --- Reports & Stats ---
    app.get("/api/reports/sales", async (req, res) => {
      try {
        const [rows]: any = await pool.query(`
          SELECT DATE(createdAt) as date, SUM(totalAmount) as sales, COUNT(*) as orders
          FROM orders
          GROUP BY DATE(createdAt)
          ORDER BY date ASC
          LIMIT 30
        `);
        res.json(rows);
      } catch (error) {
        console.error("Fetch sales report error:", error);
        res.status(500).json([]);
      }
    });

    app.get("/api/admin/summary", async (req, res) => {
      try {
        const [orders]: any = await pool.query("SELECT * FROM orders ORDER BY createdAt DESC LIMIT 20");
        const [stats]: any = await pool.query(`
          SELECT 
            (SELECT COALESCE(SUM(totalAmount), 0) FROM orders) as total_sales,
            (SELECT COUNT(*) FROM orders) as total_orders,
            (SELECT COUNT(*) FROM users) as total_customers,
            (SELECT COALESCE(SUM(price * quantity), 0) FROM products) as inventory_value,
            (SELECT COUNT(*) FROM products WHERE quantity <= 5) as low_stock_count
        `);
        res.json({
          orders: orders.map((o: any) => ({
            id: o.id,
            user_name: o.customerName || 'Guest',
            total_amount: o.totalAmount || 0,
            status: o.status || 'pending',
            created_at: new Date(o.createdAt).toLocaleDateString(),
            items_count: 0,
            payment_method: o.paymentMethod || 'N/A'
          })),
          stats: stats[0]
        });
      } catch (error) {
        console.error("Admin summary error:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // --- Other APIs ---
    app.get("/api/faqs", async (req, res) => {
      res.json([
        { id: "1", question: "What is Nasirah Mart?", answer: "Nasirah Mart is a premium e-commerce platform offering a wide range of curated products." },
        { id: "2", question: "How do I track my order?", answer: "You can track your order from the Order History page in your profile." },
        { id: "3", question: "What is the return policy?", answer: "We offer a 7-day return policy for unused items in their original packaging." }
      ]);
    });

    app.get("/api/services", async (req, res) => {
      res.json([
        { id: "1", title: "Installation Service", description: "Professional installation for your electronics and home equipment.", price: 500, icon: "Wrench" },
        { id: "2", title: "Warranty Protection", description: "Extended warranty coverage for peace of mind on your purchases.", price: 1200, icon: "ShieldCheck" },
        { id: "3", title: "Home Repair", description: "Quick and reliable repair services for a variety of products.", price: 800, icon: "Hammer" }
      ]);
    });

    app.get("/api/support/history", async (req, res) => { res.json([]); });
    app.post("/api/support/message", async (req, res) => { res.json({ success: true, reply: "Thanks for your message! Our team will get back to you shortly." }); });

    // --- Accounts API ---
    app.get("/api/accounts", async (req, res) => {
      try {
        const [rows]: any = await pool.query("SELECT * FROM accounts ORDER BY code ASC");
        res.json(Array.isArray(rows) ? rows : []);
      } catch (error) {
        console.error("Fetch accounts error:", error);
        res.json([]);
      }
    });

    app.post("/api/accounts", async (req, res) => {
      try {
        const [result]: any = await pool.query("INSERT INTO accounts SET ?", [req.body]);
        res.json({ success: true, id: result.insertId });
      } catch (error) {
        console.error("Add account error:", error);
        res.status(500).json({ success: false });
      }
    });

    app.put("/api/accounts/:id", async (req, res) => {
      try {
        const updates = { ...req.body };
        delete updates.id;
        await pool.query("UPDATE accounts SET ? WHERE id = ?", [updates, req.params.id]);
        res.json({ success: true });
      } catch (error) {
        console.error("Update account error:", error);
        res.status(500).json({ success: false });
      }
    });

    app.delete("/api/accounts/:id", async (req, res) => {
      try {
        await pool.query("DELETE FROM accounts WHERE id = ?", [req.params.id]);
        res.json({ success: true });
      } catch (error) {
        console.error("Delete account error:", error);
        res.status(500).json({ success: false });
      }
    });

    // --- Expenses API ---
    app.get("/api/expenses", async (req, res) => {
      try {
        const [rows]: any = await pool.query("SELECT * FROM expenses ORDER BY expense_date DESC");
        res.json(Array.isArray(rows) ? rows : []);
      } catch (error) {
        console.error("Fetch expenses error:", error);
        res.json([]);
      }
    });

    app.post("/api/expenses", async (req, res) => {
      try {
        const expense = { ...req.body, createdAt: new Date() };
        const [result]: any = await pool.query("INSERT INTO expenses SET ?", [expense]);
        res.json({ success: true, id: result.insertId });
      } catch (error) {
        console.error("Add expense error:", error);
        res.status(500).json({ success: false });
      }
    });

    app.put("/api/expenses/:id", async (req, res) => {
      try {
        const updates = { ...req.body };
        delete updates.id;
        await pool.query("UPDATE expenses SET ? WHERE id = ?", [updates, req.params.id]);
        res.json({ success: true });
      } catch (error) {
        console.error("Update expense error:", error);
        res.status(500).json({ success: false });
      }
    });

    app.delete("/api/expenses/:id", async (req, res) => {
      try {
        await pool.query("DELETE FROM expenses WHERE id = ?", [req.params.id]);
        res.json({ success: true });
      } catch (error) {
        console.error("Delete expense error:", error);
        res.status(500).json({ success: false });
      }
    });

    // --- Journal Entries API ---
    app.get("/api/journal_entries", async (req, res) => {
      try {
        const [rows]: any = await pool.query("SELECT * FROM journal_entries ORDER BY date DESC");
        res.json(Array.isArray(rows) ? rows : []);
      } catch (error) {
        console.error("Fetch journal entries error:", error);
        res.json([]);
      }
    });

    app.post("/api/journal_entries", async (req, res) => {
      try {
        const entry = { 
          ...req.body, 
          id: Date.now(),
          createdAt: new Date().toISOString() 
        };
        const items = typeof entry.items === 'string' ? JSON.parse(entry.items) : entry.items;
        
        // Update account balances based on journal items
        const accounts = await getTableData("accounts");
        (Array.isArray(items) ? items : []).forEach((item: any) => {
          const account = accounts.find((a: any) => a.id === item.accountId || a.code === item.accountCode);
          if (account) {
            if (account.type === 'Asset' || account.type === 'Expense') {
              account.balance = (Number(account.balance) || 0) + (Number(item.debit) || 0) - (Number(item.credit) || 0);
            } else {
              account.balance = (Number(account.balance) || 0) + (Number(item.credit) || 0) - (Number(item.debit) || 0);
            }
          }
        });
        
        await saveTableData("accounts", accounts);
        
        const data = await getTableData("journal_entries");
        data.push(entry);
        await saveTableData("journal_entries", data);
        
        res.json({ success: true, id: entry.id });
      } catch (error) {
        console.error("Add journal entry error:", error);
        res.status(500).json({ success: false });
      }
    });

    app.put("/api/journal_entries/:id", async (req, res) => {
      try {
        const updates = { ...req.body };
        delete updates.id;
        await pool.query("UPDATE journal_entries SET ? WHERE id = ?", [updates, req.params.id]);
        res.json({ success: true });
      } catch (error) {
        console.error("Update journal entry error:", error);
        res.status(500).json({ success: false });
      }
    });

    app.delete("/api/journal_entries/:id", async (req, res) => {
      try {
        await pool.query("DELETE FROM journal_entries WHERE id = ?", [req.params.id]);
        res.json({ success: true });
      } catch (error) {
        console.error("Delete journal entry error:", error);
        res.status(500).json({ success: false });
      }
    });

    // --- Finance Summary ---
    app.get("/api/finance/summary", async (req, res) => {
      try {
        const rawOrders = await getTableData("orders");
        const rawExpenses = await getTableData("expenses");
        const rawAccounts = await getTableData("accounts");

        const orders = Array.isArray(rawOrders) ? rawOrders : [];
        const expenses = Array.isArray(rawExpenses) ? rawExpenses : [];
        const accounts = Array.isArray(rawAccounts) ? rawAccounts : [];

        const totalAssets = accounts.filter((a: any) => a.type === 'Asset').reduce((sum: number, a: any) => sum + (Number(a.balance) || 0), 0);
        const totalLiabilities = accounts.filter((a: any) => a.type === 'Liability').reduce((sum: number, a: any) => sum + (Number(a.balance) || 0), 0);
        const totalEquity = accounts.filter((a: any) => a.type === 'Equity').reduce((sum: number, a: any) => sum + (Number(a.balance) || 0), 0);
        
        const totalRevenue = orders.reduce((sum: number, o: any) => sum + (Number(o.totalAmount) || 0), 0);
        const totalExpenses = expenses.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);

        res.json({
          totalAssets,
          totalLiabilities,
          totalEquity,
          netProfit: totalRevenue - totalExpenses,
          revenueGrowth: 15.5,
          expenseGrowth: -4.2,
          orders: orders.slice(0, 50),
          expenses: expenses.slice(0, 50)
        });
      } catch (error) {
        console.error("Finance summary error:", error);
        res.status(500).json({ error: "Finance summary failed", details: error instanceof Error ? error.message : String(error) });
      }
    });

    app.get("/api/health", (req, res) => { res.json({ status: "ok", message: "Nasirah Mart MySQL API is running." }); });

    // --- Mock PHP API handler ---
    app.all("/api-php/*", (req, res) => {
      console.log(`Mocking PHP request: ${req.url}`);
      
      if (req.url.includes('get_settings.php')) {
        return res.json({
          site_name: "Nasirah Mart",
          contact_email: "contact@nasirahmart.com",
          contact_phone: "+880 1234 567890",
          address: "Dhaka, Bangladesh",
          maintenance_mode: false,
          currency: "TK",
          tax_rate: 5,
          shipping_fee: 60,
          social_links: {
            facebook: "https://facebook.com/nasirahmart",
            instagram: "https://instagram.com/nasirahmart",
            twitter: "https://twitter.com/nasirahmart"
          }
        });
      }
      
      res.json([]);
    });

    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`\n  ➜  Local:   http://localhost:${PORT}/`);
      console.log(`  ➜  Network: use --host to expose\n`);
    });

    io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);
      
      socket.on("chat_message", (msg) => {
        io.emit("chat_message", msg);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
