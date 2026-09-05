# Employee Suggestion Box — Ethiopian Statistics Service

An internal, anonymous feedback platform built for a government statistics agency. Employees can submit concerns, ideas, or problems without any identifying information being stored — submissions are automatically categorized using AI, then reviewed by administrative staff through a secure dashboard.

## Features

- **Fully anonymous submissions** — no user ID, IP address, or session data is ever stored alongside a submission
- **AI-powered categorization** — each submission is classified into HR, Facilities, IT, Management, or Other using the Claude API, with a keyword-matching fallback if the AI call fails
- **Multilingual support** — English, Amharic (አማርኛ), and Afaan Oromoo, so employees can submit feedback in their preferred language
- **Secure admin dashboard** — JWT-authenticated reviewers can view, filter, and update the status of submissions (new → in-review → resolved)
- **Rate-limited public endpoint** — protects the anonymous submission form from spam/abuse
- **One-time admin setup** — the first admin account is created via a secret setup key; further admins must be added by an existing admin, not a public endpoint

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router
**Backend:** Node.js, Express, TypeScript, MongoDB (Mongoose)
**AI:** Anthropic Claude API for feedback categorization
**Auth:** JWT + bcrypt password hashing

## Security Notes

- CORS restricted to the deployed frontend origin only
- NoSQL injection protection on all auth endpoints (strict type-checking on credentials)
- Passwords hashed with bcrypt (cost factor 12)
- Admin JWTs expire after 8 hours
- Login endpoint rate-limited to prevent brute-force attempts

## Project Structure
suggestion-box/
├── backend/ # Express API, MongoDB models, auth, AI categorization
└── frontend/ # React app: public form, admin login, admin dashboard

## Status

Actively in development. Currently working on mobile responsiveness and deployment
