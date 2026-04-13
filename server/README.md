# 🛡️ Mentovara — Scalable Express.js API

The Mentovara Backend is a robust, production-ready REST API built with **Express 5** and **MongoDB**. It serves as the primary engine for authentication, course orchestration, payment processing, and real-time progress tracking.

---

## 🛠️ Performance Tech Stack

- **Runtime:** Node.js v20+
- **Framework:** Express 5 (Next-Gen)
- **Database:** MongoDB (via Mongoose ODM)
- **Security:** JWT (Access & Refresh tokens via HTTP-only Cookies)
- **Payments:** Razorpay Node.js SDK (Signature Verification enabled)
- **Media Optimization:** Multer + Cloudinary (Optimized for large video streams)
- **Email Engine:** Nodemailer + SMTP (Gmail App Passwords)

---

## 📂 Modular Project Structure

The codebase follows the **Model-Controller-Route (MCR)** pattern for maximum scalability:

```text
server/
├── src/
│   ├── controllers/    # 🧠 Logic: User, Course, Section, Video, Payment
│   ├── db/             # 💾 Database: Connection and indexing logic
│   ├── middlewares/    # 👮 Security: Auth (JWT), Multer, Global Error Handler
│   ├── models/         # 📑 Schemas: User, Course, Progress, Payment models
│   ├── routes/         # 🛣️ Endpoints: Domain-specific route mapping
│   ├── utils/          # 🛠️ Helpers: ApiError, ApiResponse, Cloudinary, Razorpay
│   ├── app.js          # ⚙️ Configuration: Middleware & Route orchestration
│   └── constants.js    # 📌 Config: Global server constants
├── index.js            # 🚀 Entry: Server initialization & DB connection
└── .env.example        # 📝 Template: Environment variable blueprint
```

---

## 🔐 Environment Configuration (.env)

Server properly function karne ke liye niche diye gaye environment variables mandatory hain. Inhe grouped kar diya gaya hai for better clarity:

### 1. 🌐 Core Server & Database
| Parameter | Description | Default / Hint |
| :--- | :--- | :--- |
| `PORT` | Local server port | `8000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` (Atlas) or Local instance |
| `CORS_ORIGIN` | Frontend URL for security | `http://localhost:3000` or production URL |

### 2. 🔑 Authentication (JWT)
| Parameter | Description | Hint |
| :--- | :--- | :--- |
| `ACCESS_TOKEN_SECRET` | Secret for short-lived tokens | Use a 64-character random string |
| `ACCESS_TOKEN_EXPIRY` | Validity of Access Token | `1d` |
| `REFRESH_TOKEN_SECRET`| Secret for long-lived tokens | Use a separate strong random string |
| `REFRESH_TOKEN_EXPIRY`| Validity of Refresh Token | `10d` |

### 3. ☁️ Media Management (Cloudinary)
| Parameter | Description | Source |
| :--- | :--- | :--- |
| `CLOUDINARY_CLOUD_NAME`| Cloud name from console | Cloudinary Dashboard |
| `CLOUDINARY_API_KEY` | Your API Key | Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET`| Your API Secret | **Keep this private!** |

### 4. 📧 Email Service (Nodemailer)
| Parameter | Description | Source |
| :--- | :--- | :--- |
| `SMTP_HOST` | SMTP server address | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | Email used for sending | Your Gmail Address |
| `SMTP_PASS` | Gmail App Password | [Google App Passwords](https://myaccount.google.com/apppasswords) |
| `FROM_NAME` | Display name of sender | `Mentovara Support` |

### 5. 💳 Payments (Razorpay)
| Parameter | Description | Source |
| :--- | :--- | :--- |
| `RAZORPAY_KEY_ID` | API Key ID | Razorpay Settings -> API Keys |
| `RAZORPAY_KEY_SECRET` | API Key Secret | Razorpay Settings -> API Keys |
| `RAZORPAY_WEBHOOK_SECRET`| Secret for verifying hooks | Razorpay Webhook Settings |

> [!CAUTION]
> **Security Warning**: Kabhi bhi `.env` file ko GitHub par push na karein. Ise humesha `.gitignore` mein rakhein.

---

## 🚀 Advanced Engineering Features

### 1. Atomic Course Enrollment
Safe enrollment flow using **Razorpay Order-Verification** logic. Courses are unlocked only after a cryptographically verified payment signature is received.

### 2. Intelligent Video Processing
Automated video handling via **Cloudinary API**, including thumbnail generation and SEO-friendly metadata storage.

### 3. Direct-to-Backend Sizing
Configured with `http.createServer` and custom `rawBody` capture to support large video uploads and secure webhook verification on serverless-platforms like Render.

### 4. Global Error Resilience
Centralized `ApiError` class and `errorHandler` middleware ensure that the client always receives descriptive, structured error responses instead of raw stack traces.

---

## 🚦 Getting Started

1. **Install Sub-module Dependencies**:
   ```bash
   npm install
   ```

2. **Database Initialization**: 
   Ensure your MongoDB instance is running (Local or Atlas).

3. **Development Mode**:
   ```bash
   npm run dev
   ```

---
**License**: MIT | **Author**: Rustom | **Audit Grade**: 100% Purity
