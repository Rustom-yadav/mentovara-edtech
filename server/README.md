# Mentovara — Server (Backend)

Express.js API for the Mentovara EdTech platform. Handles auth, courses, sections, videos, and progress.

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (access + refresh tokens, HTTP-only cookies)
- **Uploads:** Multer + Cloudinary (images & video)
- **Pagination:** mongoose-aggregate-paginate-v2

---

## Scripts

| Command       | Description                          |
| ------------- | ------------------------------------ |
| `npm run dev` | Start with nodemon (auto-reload)     |
| `npm start`   | Run production server                |

---

## Environment

Create `.env` in `server/` (you can use `.env.example` as a template):

```env
# Server
PORT=8000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017

# JWT
ACCESS_TOKEN_SECRET=your-access-token-secret
REFRESH_TOKEN_SECRET=your-refresh-token-secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS (frontend URL)
CORS_ORIGIN=http://localhost:3000
```

- **MONGO_URI** — MongoDB connection string (without DB name; app uses DB name `mentovara`).
- **ACCESS_TOKEN_SECRET / REFRESH_TOKEN_SECRET** — Strong random strings for signing JWTs.
- **CLOUDINARY_*** — From your Cloudinary dashboard (for image/video uploads).
- **CORS_ORIGIN** — Frontend origin (e.g. `http://localhost:3000`) so cookies and requests are allowed.

---

## API Base

All routes are under:

```
http://localhost:8000/api/v1
```

### Main routes

| Prefix        | Purpose                    |
| ------------- | -------------------------- |
| `/api/v1/users`     | Register, login, logout, profile, update profile |
| `/api/v1/courses`   | CRUD courses, list, enroll |
| `/api/v1/sections` | Add/update/delete sections, get by course |
| `/api/v1/videos`   | Add/get/delete videos      |
| `/api/v1/progress` | Get progress, mark video complete |
| `/api/v1/health`   | Health check               |

See `server/src/routes/` and `server/src/controllers/` for exact endpoints and auth requirements.

---

## Structure (high level)

```
server/
├── src/
│   ├── controllers/   # user, course, section, video, progress
│   ├── middlewares/   # auth (verifyJWT, isInstructor), multer, error
│   ├── models/        # User, Course, Section, Video, Progress
│   ├── routes/        # user, course, section, video, progress
│   ├── utils/         # asyncHandler, ApiError, ApiResponse, cloudinary
│   └── app.js         # Express app
├── index.js           # Entry point (starts server)
├── package.json
└── README.md
```

---

## Running with the frontend

1. Start MongoDB.
2. Copy `.env.example` to `.env` and fill in the values.
3. Run `npm run dev` in `server/`.
4. Point the **client** `NEXT_PUBLIC_API_URL` to `http://localhost:8000/api/v1` (or your deployed API URL).

---

## License

MIT — see [LICENSE](../LICENSE).
