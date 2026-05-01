# CineSense – Frontend

AI-Powered Movie Matchmaker | CSE3044 Software Engineering

## Tech Stack

| Layer | Library |
|-------|---------|
| Framework | React 18 |
| Routing | React Router v6 |
| State | Redux Toolkit |
| HTTP | Axios (with JWT interceptor & refresh) |
| Realtime | Socket.io Client (Watch Party) |
| Animation | Framer Motion |
| Notifications | react-hot-toast |
| Build | Vite |

## Project Structure

```
src/
├── components/
│   ├── common/          # Navbar, Footer, Button, Input...
│   ├── layout/          # MainLayout, AuthLayout
│   └── features/        # MovieCard, MoodQuestion, PartyLobby...
├── pages/               # One file per route
├── hooks/               # useAuth, useMatchmaker, useWatchParty...
├── services/            # apiClient, authService, movieService, watchPartyService
├── store/
│   ├── store.js
│   └── slices/          # authSlice, moviesSlice, sessionSlice, uiSlice
├── utils/               # helpers.js
└── styles/              # global.css (design tokens)
```

## Getting Started

```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env.local

# Start dev server (port 3000)
npm run dev
```

## Key Design Decisions

- **Auth**: JWT stored in Redux; refresh token in HttpOnly cookie. Axios interceptor handles silent refresh.
- **Cold Start**: Redux `isFallback` flag triggers UI banner when AI engine times out (UC-002 AF-2).
- **Watch Party**: Socket.io singleton (`watchPartyService`) emits/listens per session code.
- **Routing**: Protected routes use Redux `isAuthenticated`; redirects to `/login`.
- **CSS**: CSS Modules + global design tokens (no Tailwind, keeping bundle small).

## SRS Traceability

| Requirement | Location |
|-------------|---------|
| UC-001 Register/Login | `authSlice`, `LoginPage`, `RegisterPage` |
| UC-002 Mood Matchmaker | `sessionSlice`, `useMatchmaker`, `MatchmakerPage` |
| UC-003 Watch Party | `sessionSlice`, `watchPartyService`, `WatchPartyPage` |
| UC-005 Watchlist | `moviesSlice`, `WatchlistPage`, `MovieCard` |
| UC-006 Rate & Review | `movieService.submitRating`, `MovieDetailPage` |
| NFR-S-001 bcrypt | Enforced server-side; password never stored client |
| NFR-S-003 JWT expiry | `apiClient` interceptor handles 1h expiry + refresh |
| UI-001 Responsive | Global CSS, 320px → 2560px |
| UI-006 Touch targets | All buttons `min-height: 44px` |
