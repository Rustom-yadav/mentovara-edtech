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

| Command         | Description                                       |
| --------------- | ------------------------------------------------- |
| `npm run dev`   | Start dev server (default: http://localhost:3000) |
| `npm run build` | Production build                                  |
| `npm run start` | Run production server                             |
| `npm run lint`  | Run ESLint                                        |

---

## Environment

Create `.env.local` in `client/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

- `NEXT_PUBLIC_API_URL` — Backend API base URL (no trailing slash). Required for all API calls.

---

## Project Structure

```
client/
├── public/
│   └── temp/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.js
│   │   ├── not-found.js
│   │   ├── page.js
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.js
│   │   │   └── register/
│   │   │       └── page.js
│   │   ├── courses/
│   │   │   ├── page.js
│   │   │   └── [courseId]/
│   │   │       └── page.js
│   │   ├── dashboard/
│   │   │   ├── page.js
│   │   │   ├── courses/
│   │   │   │   ├── page.js
│   │   │   │   ├── new/
│   │   │   │   │   └── page.js
│   │   │   │   └── [courseId]/
│   │   │   │       └── manage/
│   │   │   │           └── page.js
│   │   │   ├── enrolled/
│   │   │   │   └── page.js
│   │   │   ├── instructor/
│   │   │   ├── profile/
│   │   │   │   └── page.js
│   │   │   ├── student/
│   │   ├── watch/
│   │   │   └── [courseId]/
│   │   │       └── [videoId]/
│   │   │           └── page.js
│   ├── components/
│   │   ├── common/
│   │   │   ├── Features.jsx
│   │   │   ├── FinalCTA.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── HeroSection.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── StepsSection.jsx
│   │   │   ├── TeachCTA.jsx
│   │   │   └── ThemeToggle.jsx
│   │   ├── course/
│   │   │   ├── CourseCard.jsx
│   │   │   └── PopularCoursesList.jsx
│   │   ├── providers/
│   │   │   ├── AuthProvider.jsx
│   │   │   └── StoreProvider.jsx
│   │   ├── ui/
│   │   │   ├── avatar.jsx
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── input.jsx
│   │   │   ├── label.jsx
│   │   │   ├── separator.jsx
│   │   │   └── sonner.jsx
│   │   ├── video/
│   │   │   └── VideoPlayer.jsx
│   ├── hooks/
│   │   └── useAuth.js
│   ├── lib/
│   │   └── utils.js
│   ├── services/
│   │   ├── api.js
│   │   └── endpoints.js
│   ├── store/
│   │   ├── store.js
│   │   └── slices/
│   │       ├── authSlice.js
│   │       └── courseSlice.js
│   ├── utils/
│   │   └── .gitkeep
│   └── proxy.js
├── components.json
├── eslint.config.mjs
├── jsconfig.json
├── next.config.mjs
├── package.json
├── postcss.config.mjs
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
