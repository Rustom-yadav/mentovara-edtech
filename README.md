# Mentovara

A modern EdTech platform where instructors create structured video courses and students learn with real-time progress tracking.

**Built by Rustom** · [MIT License](./LICENSE)

🔗 **Repo:** [GitHub Repository](https://github.com/Rustom-yadav/mentovara-edtech) 
🌐 **Frontend:** [mentovara.vercel.app](https://mentovara.vercel.app)  
🌐 **Backend API:** [mentovara-edtech-api.onrender.com](https://mentovara-edtech-api.onrender.com)

---

## ✨ Key Features

- **🎓 Interactive Learning**: Watch high-quality video courses with real-time progress tracking.
- **💳 Secure Payments**: Seamless course enrollment powered by **Razorpay** integration.
- **📧 Email Verification**: Robust authentication with SMTP-based email verification using **Nodemailer**.
- **👨‍🏫 Instructor Dashboard**: Comprehensive tools for instructors to create, manage, and track their courses.
- **📁 Media Management**: Optimized image and video handling via **Cloudinary**.
- **📱 Responsive UI**: A premium, modern interface built with **Next.js**, **Tailwind CSS**, and **Shadcn UI**.

---

## 🛠️ Tech Stack

| Layer    | Stack                          |
| -------- | ------------------------------ |
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS v4, Shadcn UI, Redux Toolkit, Axios |
| **Backend**  | Node.js, Express 5, MongoDB, Mongoose |
| **Payments** | Razorpay SDK |
| **Email**    | Nodemailer (SMTP) |
| **Auth**     | JWT (HTTP-only cookies) |
| **Media**    | Cloudinary (images & video) |

---

## Project Structure

```
Mentovara/
├── client/          # Next.js frontend
├── server/           # Express API + MongoDB
├── LICENSE
└── README.md         # You are here
```

- **[client/](./client/)** — 
Frontend app (see [client/README.md](./client/README.md))
- **[server/](./server/)** — 
Backend API (see [server/README.md](./server/README.md))

## Quick Start

### Prerequisites

- **Node.js**: version 20+ required
- **MongoDB**: Local instance or Atlas URI
- **Cloudinary**: Account for image/video hosting
- **Razorpay**: Account and API keys (Key ID & Secret)
- **SMTP**: Gmail App Password or other SMTP service for emails

### 1. Backend

```bash
cd server
cp .env.example .env   # edit with your MongoDB, JWT, Cloudinary keys
npm install
npm run dev
```

API runs at `http://localhost:8000` (or the port in `.env`).

### 2. Frontend

```bash
cd client
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL to backend URL
npm install
npm run dev
```

App runs at `http://localhost:3000`.

### 3. Use the app

- Open `http://localhost:3000`
- Register as **Student** or **Instructor**
- Browse courses, enroll, watch videos, or create your own course

---

## Environment

- **server**: See `server/README.md` and `server/.env.example` for `MONGO_URI`, `ACCESS_TOKEN_SECRET`, `CLOUDINARY_*`, `CORS_ORIGIN`, etc.
- **client**: See `client/README.md` for `NEXT_PUBLIC_API_URL`.

---

## 🚀 Production Checklist

Before deploying to platforms like Vercel (Frontend) and Render/Railway (Backend):

| Check | Requirement |
| ----- | ----------- |
| `NEXT_PUBLIC_BACKEND_URL` | Set to your live API URL (Client Env) |
| `CORS_ORIGIN` | Set to your frontend URL (Server Env) |
| `NODE_ENV` | Must be set to `production` |
| `RAZORPAY_WEBHOOK_SECRET` | For secure payment verification |
| `SMTP_*` Keys | Verify email sender configuration |
| JWT Secrets | Use strong, random strings for production |
| Database | Ensure MongoDB Atlas IP whitelist is updated |

---

## 📖 API Documentation

The project includes a comprehensive API collection.

🔗 **Postman Collection:** [View API Documentation](https://vijayyadav-official-4892899.postman.co/workspace/Vijay-Yadav's-Workspace~b311eace-bf23-4c27-863a-47b64a5efa0e/collection/52621760-64117d9f-fdf1-4258-909e-a14d4b2458d0?action=share&source=copy-link&creator=52621760)

---

## License

MIT © 2026 Rustom
