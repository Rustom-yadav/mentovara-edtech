# Mentovara

A modern EdTech platform where instructors create structured video courses and students learn with real-time progress tracking.

**Built by Rustom** · [MIT License](./LICENSE)

🔗 **Repo:** [GitHub Repository](https://github.com/Rustom-yadav/mentovara-edtech) 
🌐 **Live:** [mentovara.vercel.app](https://mentovara.vercel.app)

---

## Tech Stack

| Layer    | Stack                          |
| -------- | ------------------------------ |
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS v4, Shadcn UI, Redux Toolkit, Axios |
| Backend  | Node.js, Express 5, MongoDB, Mongoose |
| Auth     | JWT (HTTP-only cookies)        |
| Media    | Cloudinary (images & video)    |

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

---

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (for uploads)

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

## Production checklist

Before deploying:

| Check | Where |
| ----- | ----- |
| Set `NEXT_PUBLIC_API_URL` to your live API URL | Client (e.g. Vercel env) |
| Set `CORS_ORIGIN` to your frontend URL (e.g. `https://mentovara.vercel.app`) | Server `.env` |
| Set `NODE_ENV=production` | Server (e.g. Railway/Render env) |
| Use strong `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` | Server `.env` |
| MongoDB Atlas (or production DB) connection string in `MONGO_URI` | Server `.env` |
| Cloudinary env vars set for production | Server `.env` |

- **Client**: `npm run build` passes (already verified).
- **Server**: Ensure the server is started with `npm start` and env vars are set in your host (Railway, Render, etc.).

---

## License

MIT © 2026 Rustom
