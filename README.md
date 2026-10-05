# TaskFlow

Full-stack task manager: React (Vite) + Express + MongoDB + JWT.

## Run locally
    # API
    cd server && cp .env.example .env && npm install && npm run dev
    # Tests (in-memory MongoDB, nothing to set up)
    npm test
    # Client (new terminal)
    cd client && cp .env.example .env && npm install && npm run dev

## API
| Method | Route | Auth |
|---|---|---|
| POST | /api/auth/register | no |
| POST | /api/auth/login | no |
| GET | /api/auth/me | JWT |
| GET | /api/tasks (?completed= &priority= &q=) | JWT |
| POST | /api/tasks | JWT |
| PUT | /api/tasks/:id | JWT |
| PATCH | /api/tasks/:id/toggle | JWT |
| DELETE | /api/tasks/:id | JWT |

## Security design
- Passwords hashed with bcrypt; JWT signed with `JWT_SECRET`, 7-day expiry.
- Every task query includes `user: req.user._id`, so another user's task returns 404 and cannot be read or changed.
- The task owner is always taken from the token, never from the request body.

## Deploy
1. **Database:** free MongoDB Atlas cluster, copy the connection string.
2. **API on Render:** new Web Service, root `server`, build `npm install`, start `npm start`.
   Env vars: `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN` (your Vercel URL, set after step 3).
3. **Client on Vercel:** root `client`, framework Vite, env var `VITE_API_URL=https://<your-render-app>.onrender.com/api`.
4. Update `CLIENT_ORIGIN` on Render with the Vercel URL and redeploy.

## Resume numbers
- **Protected API routes: 6** (`/auth/me` plus the 5 task routes).
- **Passing tests:** run `npm test` in `server` and use the "Tests: N passed" count (expected 15).
- **Features:** add, edit, delete, mark complete, filter by status and priority, and search.
- **Deployment:** Vercel (client) + Render (API).

Suggested bullets:
- Secured per-user data, measured by 6 protected API routes and 15 passing tests, by implementing JWT authentication in Express with MongoDB.
- Delivered a React task interface, measured by 6 features (add, edit, delete, complete, filter, search) and a live deployment on Vercel and Render, by connecting the UI to the REST API.
