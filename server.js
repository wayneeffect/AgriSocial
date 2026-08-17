const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sanitizeHtml = require('sanitize-html');

const app = express();

// ==========================================
// 1. HARDENING & SECURITY MIDDLEWARE
// ==========================================

// Configure Helmet with Content Security Policy for inline script/style execution
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"]
      }
    }
  })
);

app.use(cors());
app.use(express.json({ limit: '10kb' })); // Prevents DoS via massive JSON payloads
app.use(express.static(path.join(__dirname, 'public')));

// Rate Limiting: General API requests
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: { message: 'Too many requests from this IP, please try again later.' } }
});
app.use('/api/', apiLimiter);

// Rate Limiting: Strict limits on creating posts (Spam Prevention)
const postCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: { error: { message: 'Post creation limit reached. Please wait an hour before posting again.' } }
});

// Input Sanitization Utility against Cross-Site Scripting (XSS)
const sanitizeText = (input) => {
  if (typeof input !== 'string') return '';
  return sanitizeHtml(input.trim(), {
    allowedTags: [], // Strip ALL HTML tags
    allowedAttributes: {}
  });
};

// Async route error wrapper to eliminate unhandled promise rejections
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ==========================================
// 2. DATABASE INITIALIZATION & RESILIENCE
// ==========================================

const db = new sqlite3.Database('./agrisocial.db', (err) => {
  if (err) {
    console.error('Fatal Database Connection Error:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database.');
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author TEXT NOT NULL,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.get("SELECT COUNT(*) AS count FROM posts", (err, row) => {
    if (row && row.count === 0) {
      const stmt = db.prepare("INSERT INTO posts (author, category, content) VALUES (?, ?, ?)");
      stmt.run("Dave (Iowa - Corn/Soy)", "Crop Care", "Noticed early gray leaf spot on field 4. Monitor local moisture levels.");
      stmt.run("Sarah (Texas - Livestock)", "Market Talk", "Feeder cattle holding steady at local auction today.");
      stmt.finalize();
    }
  });
});

// Promisified Database Helpers
const dbAllAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRunAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

// ==========================================
// 3. API ROUTES
// ==========================================

// Get Posts (with Optional Category Filter)
app.get('/api/posts', asyncHandler(async (req, res) => {
  const category = sanitizeText(req.query.category || '');
  
  let query = "SELECT * FROM posts ORDER BY id DESC LIMIT 50";
  let params = [];

  if (category && category !== 'All') {
    query = "SELECT * FROM posts WHERE category = ? ORDER BY id DESC LIMIT 50";
    params = [category];
  }

  const posts = await dbAllAsync(query, params);
  res.json(posts);
}));

// Create a New Post
app.post('/api/posts', postCreateLimiter, asyncHandler(async (req, res) => {
  const author = sanitizeText(req.body.author);
  const category = sanitizeText(req.body.category || 'General');
  const content = sanitizeText(req.body.content);

  // Robust Field Validations
  if (!author || author.length < 3) {
    const err = new Error('Name/Location must be at least 3 characters long.');
    err.status = 400;
    throw err;
  }

  if (!content || content.length < 5) {
    const err = new Error('Post content must be at least 5 characters long.');
    err.status = 400;
    throw err;
  }

  if (content.length > 500) {
    const err = new Error('Post content cannot exceed 500 characters.');
    err.status = 400;
    throw err;
  }

  const query = "INSERT INTO posts (author, category, content) VALUES (?, ?, ?)";
  const result = await dbRunAsync(query, [author, category, content]);

  res.status(201).json({
    id: result.lastID,
    author,
    category,
    content,
    timestamp: new Date().toISOString()
  });
}));

// ==========================================
// 4. ERROR HANDLING & SHUTDOWN HOOKS
// ==========================================

// Catch-all 404 for undefined endpoints
app.use((req, res, next) => {
  const err = new Error('Requested resource not found.');
  err.status = 404;
  next(err);
});

// Centralized Global Error Handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  
  // Log full stack trace in development or non-production
  if (status === 500) {
    console.error(`[CRITICAL ERROR] ${new Date().toISOString()}:`, err.stack);
  } else {
    console.warn(`[CLIENT ERROR] ${new Date().toISOString()} - Status ${status}: ${err.message}`);
  }

  res.status(status).json({
    error: {
      message: status === 500 ? 'An internal server error occurred.' : err.message,
      status: status
    }
  });
});

// Process Safety Nets
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
  // Safe shutdown step
  db.close(() => {
    process.exit(1);
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`AgriSocial MVP running securely on port ${PORT}`);
});
