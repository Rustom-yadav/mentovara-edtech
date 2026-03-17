# Mentovara — Client (Frontend)

Next.js frontend for the Mentovara EdTech platform.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS v4, Shadcn UI
- **State:** Redux Toolkit
- **HTTP:** Axios (with credentials for cookies)
- **Language:** JavaScript (no TypeScript)

---

## Scripts

| Command       | Description                |
| ------------- | -------------------------- |
| `npm run dev` | Start dev server (default: http://localhost:3000) |
| `npm run build` | Production build          |
| `npm run start` | Run production server     |
| `npm run lint`  | Run ESLint                |

---

## Environment

Create `.env.local` in `client/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

- `NEXT_PUBLIC_API_URL` — Backend API base URL (no trailing slash). Required for all API calls.

---

## Structure (high level)

```
client/
├── public/           # Static assets (e.g. temp/logo.png)
├── src/
│   ├── app/          # App Router pages & layout
│   ├── components/   # Navbar, Footer, CourseCard, VideoPlayer, etc.
│   ├── hooks/        # useAuth
│   ├── services/     # api.js, endpoints.js
│   ├── store/        # Redux store, slices (auth, course)
│   └── ...
├── package.json
└── README.md
```

---

## Running with the backend

1. Start the **server** first (see root [README.md](../README.md) or `server/README.md`).
2. Set `NEXT_PUBLIC_API_URL` in `client/.env.local` to the server URL.
3. Run `npm run dev` in `client/`.

---

## License

MIT — see [LICENSE](../LICENSE).
