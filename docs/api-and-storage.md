# Story Starter API & Storage Architecture

This document specifies the backend API routes, state machine, and storage interfaces for the Next.js / Cloudflare / Node server environment.

---

## 1. Endpoints Overview

| Endpoint | Method | Purpose | Auth |
| :--- | :--- | :--- | :--- |
| `/api/session` | `POST` | Initialize story test session & run Turn 1 Audit | Optional (Guest/JWT) |
| `/api/session/[id]/turn` | `POST` | Process Turn 2 & Turn 3 answers + return next questions | Optional (Guest/JWT) |
| `/api/session/[id]/report` | `POST` | Generate Turn 4 Viability Report & Story Bible Payload | Optional (Guest/JWT) |
| `/api/session/[id]` | `GET` | Retrieve session details, audit state, and history | Optional (Guest/JWT) |

---

## 2. Environment Variables

Create `.env.local` or set runtime secrets:
```env
# Gemini API Key from Google AI Studio
GEMINI_API_KEY=AIzaSy...

# Optional Database URL (PostgreSQL / Cloudflare D1)
DATABASE_URL=...
JWT_SECRET=super-secret-jwt-key
```
