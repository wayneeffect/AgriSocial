# 🌾 AgriSocial MVP

> A hardened, lightweight social network MVP tailored specifically for farmers, growers, and agricultural producers to share real-time field updates, crop observations, and market updates.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-SQLite-blue.svg)](https://www.sqlite.org/)
[![Deploy to Render](https://img.shields.io/badge/Deploy-Render-000000.svg?logo=render)](https://render.com)

---

## 🚀 Overview

**AgriSocial** bridges the gap between traditional social networking and rural utility. Built using a lean, high-reliability stack, this MVP combines a microblogging feed (like X/Twitter) with category-based filtering and regional identity tagging (like Facebook) to keep communication relevant to localized farm operations.

Designed with low-bandwidth, outdoor field conditions in mind, AgriSocial prioritizes speed, high-contrast readability, and server resilience.

---

## ✨ Key Features

* **🌾 Ag-Centric Categorization:** Filter field updates by **Crop Care**, **Livestock**, **Equipment**, and **Market Talk**.
* **📍 Localized Identification:** Posts emphasize farmer identity and geography (e.g., *John - Dairy, WI*).
* **⚡ Ultra-Lightweight Frontend:** Minimalistic, high-contrast, mobile-first design optimized for sunlight readability and low-signal connectivity.
* **🔒 Production-Hardened Security:** Built-in protection against common web vulnerabilities (XSS, DoS, rate-limiting).
* **💾 Persistent Storage:** Powered by SQLite with automatic initialization and seeding for local and cloud environments.

---

## 🛠️ Tech Stack

* **Backend Runtime:** Node.js (Express.js)
* **Database:** SQLite3
* **Security & Hardening:** Helmet (CSP), Express Rate Limit, Sanitize-HTML
* **Frontend:** Plain HTML5, CSS3, ES6 JavaScript (Zero heavy framework bloat)
* **Deployment Target:** Render + GitHub CI/CD

---

## 🔐 Security & Hardening Features

This application was engineered with a production-ready security posture out of the box:

* **XSS Defense:** Strict input sanitization strips HTML tags on post submission; client-side safe DOM text rendering prevents script injection.
* **Rate Limiting:** Protects against spam and brute-force flooding (100 requests/15 mins general; 20 post creations/hour per IP).
* **Header Security:** `helmet` integration configured with custom Content Security Policies (CSP).
* **SQL Injection Prevention:** All database operations utilize parameterized queries.
* **Fault Isolation:** Centralized async global error handler prevents server crashes from unhandled promise rejections.

---

## 🏃 Quick Start (Local Setup)

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* [Git](https://git-scm.com/)

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/agrisocial-mvp.git](https://github.com/YOUR_USERNAME/agrisocial-mvp.git)
   cd agrisocial-mvp

```

2. **Install dependencies:**
```bash
npm install

```


3. **Start the local server:**
```bash
npm start

```


4. **Open in browser:**
Navigate to `http://localhost:3000` to interact with the application.

---

## 🌐 Deploying to Render

This app is pre-configured for seamless zero-downtime deployment on Render:

1. Push this repository to **GitHub**.
2. Log into [Render](https://render.com) and create a **New Web Service**.
3. Link your `agrisocial-mvp` GitHub repository.
4. Set the following build options:
* **Runtime:** `Node`
* **Build Command:** `npm install`
* **Start Command:** `npm start`


5. Click **Create Web Service**. Render will build and host your app live!

---

## 📁 Repository Structure

```text
agrisocial-mvp/
├── public/
│   └── index.html       # High-contrast, mobile-friendly client interface
├── .gitignore           # Ignores node_modules, local .db files, and keys
├── package.json         # Project metadata, dependencies, and start scripts
├── server.js            # Hardened Express server & SQLite database logic
└── README.md            # Project documentation

```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

```

```
