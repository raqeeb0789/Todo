Auth & Email setup

Required environment variables (create a `.env` file in `server/`):

- MONGODB_URI - your MongoDB connection string (already used by the project)
- JWT_SECRET - secret used to sign JWT tokens (e.g. a long random string)
- JWT_EXPIRES_IN - (optional) token expiry (default: 7d)
- CLIENT_URL - the frontend URL used in password reset emails (default: http://localhost:5173)

Email settings for NodeMailer:
- EMAIL_HOST - SMTP host (e.g. smtp.gmail.com)
- EMAIL_PORT - SMTP port (e.g. 587)
- EMAIL_SECURE - 'true' if using TLS (usually false for 587)
- EMAIL_USER - SMTP username (your email)
- EMAIL_PASS - SMTP password or app password
- EMAIL_FROM - optional from address (defaults to EMAIL_USER)

Install new dependencies in the server folder:

npm install

(After the package.json change added bcryptjs, jsonwebtoken and nodemailer)

Endpoints added:
- POST /api/auth/register  { name, email, password } -> { token, user }
- POST /api/auth/login     { email, password } -> { token, user }
- POST /api/auth/forgot    { email } -> sends reset email
- POST /api/auth/reset     { token, email, password } -> resets password
- GET  /api/auth/me        (requires Authorization: Bearer <token>) -> { user }

Notes:
- The todos endpoints are now protected and require a valid Bearer token in Authorization header.
- Todos are associated to the authenticated user automatically when created.
- The password reset flow sends a link to CLIENT_URL/reset-password?token=...&email=... which the client detects and displays a reset UI.
