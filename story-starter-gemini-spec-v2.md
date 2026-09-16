# Technical Specification: API-Backed Story Starter on Google AI Studio (Gemini API) - v2

This document provides the complete, production-ready technical specification for building the **Story Starter** platform as an API-backed web application powered by **Google AI Studio (Gemini API)**. 

By migrating the LLM backend from Anthropic Claude to Gemini, the platform achieves substantial cost reductions—often up to **90% lower operational costs**—while leveraging native features like **Context Caching** and **Structured JSON Outputs (JSON Schema)**.

---

## 1. Architectural Strategy: Why Google AI Studio / Gemini?

Transitioning the Story Starter engine to the Gemini API is not just a cost-saving measure; it unlocks architectural efficiencies that align perfectly with the 4-Turn editorial process.

### Cost Analysis & Performance Mapping
The system uses a **hybrid dual-model architecture** to balance lightning-fast response times, near-zero cost, and high-fidelity developmental analysis:

| Model | Use Case | Input Cost (per 1M tokens) | Output Cost (per 1M tokens) | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Gemini 1.5 Flash** | **Turns 1, 2, and 3** (Conversational collection, state auditing, and stress-testing) | $0.075 (with caching: $0.01875) | $0.30 | High speed, near-zero cost, and fully capable of executing Socratic prompts and basic categorization. |
| **Gemini 1.5 Pro** | **Turn 4 Only** (Massive 8-section report generation and structural diagnosis) | $1.25 (with caching: $0.3125) | $5.00 | Advanced reasoning capacity, exceptional adherence to complex stylistic guidelines, and high-fidelity analytical depth. |

### Native Gemini Features Utilized
1. **Context Caching (Critical for Cost Efficiency):**
   The combined Story Starter system prompt, editorial playbook, and question guidelines represent roughly **15,000 tokens**. By caching this context on Gemini, every subsequent turn pays only the *cached input rate* (a 75% discount on input tokens).
2. **System Instructions (`system_instruction`):**
   Gemini natively separates developer instructions from user messages, preventing prompt injection and ensuring the AI maintains its Socratic role and zero-prose boundaries.
3. **Structured Outputs (JSON Schema):**
   Ensures that Turn 4 consistently delivers Section 8 (the Story Bible Builder Payload) as a clean, standardized, parseable JSON block, eliminating parsing errors on the frontend.

---

## 2. System Architecture & Session Data Flow

```
   [ Frontend Client ] (React / Tailwind)
        │      ▲
        │ POST │ JSON Response / JWT Auth Header
        ▼      │
   [ Backend API (FastAPI / Node.js) ] <───> [ Database (PostgreSQL) ]
        │      ▲
        │ HTTPS│ Gemini SDK 
        ▼      │
   [ Google AI Studio (Gemini API) ]
```

### The Stateless-to-Stateful Boundary
The LLM remains completely stateless. The Backend API acts as the state manager, storing the user’s narrative seed, answers, current turn count, and historical transcript in a PostgreSQL database. On each turn, the backend retrieves the session history, appends the new message, and calls the Gemini API.

---

## 3. Database Schema (PostgreSQL)

To support secure user account management and track user sessions across the strict 4-turn sequence, the database uses PostgreSQL.

```sql
-- Enable UUID extension for secure, un-guessable IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define session states matching the 4-Turn process
CREATE TYPE story_starter_stage AS ENUM (
    'foundations',  -- Turn 1
    'stress_test',  -- Turn 2
    'verification', -- Turn 3
    'complete'      -- Turn 4 (Report Delivered)
);

CREATE TYPE viability_verdict AS ENUM ('GO', 'PIVOT', 'ABANDON');

-- 1. Users Table (Core Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Master Session Table (Links to Users if Authenticated)
CREATE TABLE story_starter_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Optional, permits guest runs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- State Machine Tracking
    current_stage story_starter_stage NOT NULL DEFAULT 'foundations',
    turn_count INT NOT NULL DEFAULT 1 CHECK (turn_count BETWEEN 1 AND 4),
    
    -- Locked Parameters (Populated silently by the State Audit during Turn 1)
    locked_genre VARCHAR(100),
    locked_premise TEXT,
    locked_character TEXT,
    locked_setting TEXT,
    locked_theme TEXT,
    locked_scope VARCHAR(100),
    
    -- Diagnostic Outputs (populated at Turn 4)
    verdict viability_verdict NULL,
    viability_score INT CHECK (viability_score BETWEEN 0 AND 100),
    raw_report TEXT,
    json_payload JSONB,
    
    CONSTRAINT max_turns CHECK (turn_count <= 4)
);

-- 3. Conversation History Table (ordered sequentially)
CREATE TABLE story_starter_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES story_starter_sessions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'model')),
    content TEXT NOT NULL
);

-- Indexing for rapid session recovery and auth verification
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_messages_session ON story_starter_messages(session_id);
CREATE INDEX idx_sessions_user ON story_starter_sessions(user_id);
```

---

## 4. Google Gen AI SDK Integration Pattern

The following Python integration pattern demonstrates how to configure **Context Caching**, utilize dual-models, and enforce system instructions using the standard Gemini API.

```python
import os
import datetime
from google import genai
from google.genai import types

# Initialize client (looks for GEMINI_API_KEY env variable)
client = genai.Client()

SYSTEM_INSTRUCTION_CONTENT = """
You are the Story Starter Socratic Editorial Diagnostic Engine. Your job is to stress-test narrative seeds.
- You operate under a strict 4-turn hard limit.
- You are strictly prohibited from generating story prose, dialogue, or drafts.
- Do not use uppercase markdown meta-headers (e.g., [INPUT RECEIVED]) or raw diagnostic grids.
- Weave structural metrics (Conflict Density, Stakes, Agency) into flowing, professional editorial prose.
- Deliver a comprehensive 8-Section Story Viability Report on Turn 4, culminating in a clean, plain-text Story Bible Builder Payload in Section 8.
"""

def get_or_create_editorial_cache() -> str:
    """Creates or retrieves a context cache containing the massive system instructions."""
    # Create a new cache with a 30-minute Time-To-Live (TTL)
    cache = client.caches.create(
        model="models/gemini-1.5-flash",
        config=types.CreateCachedContentConfig(
            contents=[types.Content(
                role="user",
                parts=[types.Part.from_text(text=SYSTEM_INSTRUCTION_CONTENT)]
            )],
            ttl=datetime.timedelta(minutes=30),
            display_name="story_starter_editorial_playbook"
        )
    )
    return cache.name
```

---

## 5. Endpoints & State Machine Execution

### Endpoint 1: `/api/session` (Initialize Session)
*   **Method:** `POST`
*   **Authentication:** Optional (Supports Guest or JWT Authorized User)
*   **Payload:** `{ "story_seed": "A space station custodian accidentally drinks experimental alien liquid." }`
*   **Backend Steps:**
    1. Create record in `story_starter_sessions` with `turn_count = 1`, `current_stage = 'foundations'`, and link `user_id` if authorized.
    2. Write user’s `story_seed` message to `story_starter_messages`.
    3. Warm up or retrieve the cached context.
    4. Call **Gemini 1.5 Flash** with the system prompt, requesting a JSON response containing the **Six-Parameter State Audit** findings *and* the Socratic Turn 1 response.

#### JSON Schema for Turn 1 Response Structuring:
To handle the initial audit and questions cleanly, the backend requests a structured JSON output from Gemini on Turn 1:

```json
{
  "type": "OBJECT",
  "properties": {
    "state_audit": {
      "type": "OBJECT",
      "properties": {
        "genre": { "type": "STRING" },
        "premise": { "type": "STRING" },
        "character": { "type": "STRING" },
        "setting": { "type": "STRING" },
        "theme": { "type": "STRING" },
        "scope": { "type": "STRING" }
      },
      "required": ["genre", "premise", "character", "setting", "theme", "scope"]
    },
    "conversational_response": {
      "type": "STRING",
      "description": "The natural, editorial response containing exactly two probing questions and quick-select options, completely free of system headers."
    }
  },
  "required": ["state_audit", "conversational_response"]
}
```

*   **Database Action:** Update `story_starter_sessions` with the audited parameters (e.g. `locked_character = \"space station custodian\"`) and save the model's `conversational_response` to `story_starter_messages` to serve to the client.

---

### Endpoint 2: `/api/session/{id}/turn` (Submit Turn 2 & Turn 3 Answers)
*   **Method:** `POST`
*   **Authentication:** Required for user sessions, open for active Guest session UUIDs
*   **Payload:** `{ "user_answer": \"Option B (it alters his DNA) and he wants to hide it before the corporate inspectors arrive.\" }`
*   **Backend Steps:**
    1. Retrieve session record. Assert `turn_count < 4`. Verify JWT match if the session has a `user_id`.
    2. Save `user_answer` to `story_starter_messages`.
    3. Retrieve the conversation transcript (Turn 1 prompt + response + Turn 2 answer).
    4. Call **Gemini 1.5 Flash** using the Cached Context.
    5. Append system direction based on active turn count:
       * **If Turn 2:** Evaluate *Conflict Density, Stakes, and Agency* in flowing prose, then ask exactly two refining questions.
       * **If Turn 3:** Categorize *Facts, Inferences, and Uncertainties* conversationally, declare scope/market positioning, and ask exactly one positioning confirmation question.
    6. Increment `turn_count` in DB and write the AI's response to `story_starter_messages`.

---

### Endpoint 3: `/api/session/{id}/report` (Turn 4 - Report Generation)
*   **Method:** `POST`
*   **Payload:** `{ "user_answer": \"Yes, standalone sci-fi thriller fits perfectly.\" }`
*   **Backend Steps:**
    1. Save final answer to `story_starter_messages`. Set `turn_count = 4` and `current_stage = 'complete'`.
    2. Recover the **full conversational history** of the 3 prior turns.
    3. Warm up the **Gemini 1.5 Pro** model (to ensure elite stylistic/report-writing quality).
    4. Call the model to generate the comprehensive, **8-section Story Viability Report**.
    5. Enforce **Structured Schema Output** for Turn 4 to separate the Markdown report from the plain-text Story Bible Payload:

```python
# python-genai SDK Turn 4 Call Configuration
response = client.models.generate_content(
    model="models/gemini-1.5-pro",
    contents=full_conversation_history,
    config=types.GenerateContentConfig(
        system_instruction=SYSTEM_INSTRUCTION_CONTENT,
        response_mime_type="application/json",
        response_schema=types.Schema(
            type=types.Type.OBJECT,
            properties={
                "report_markdown": types.Schema(
                    type=types.Type.STRING,
                    description="The full 7 sections of the Story Viability Report in Markdown format."
                ),
                "verdict": types.Schema(
                    type=types.Type.STRING,
                    enum=["GO", "PIVOT", "ABANDON"]
                ),
                "viability_score": types.Schema(type=types.Type.INTEGER),
                "story_bible_payload": types.Schema(
                    type=types.Type.STRING,
                    description="Clean, unformatted plain-text block containing raw key-value structural data. ABSOLUTELY zero markdown, bolding, or headers."
                )
            },
            required=["report_markdown", "verdict", "viability_score", "story_bible_payload"]
        )
    )
)
```

6. **Database Write:** Write the output components (`report_markdown`, `verdict`, `viability_score`, `story_bible_payload`) to the `story_starter_sessions` table.
7. **Frontend Service:** Deliver the structured JSON payload to the user interface.

---

## 6. QA Safety & Zero-Prose Guardrail

To guarantee that the Gemini engine stays dedicated to structural auditing and never drifts into ghostwriting story prose, deploy a backend **regular expression check and validation gate** on outgoing LLM text:

```python
import re

PROSE_FLAG_KEYWORDS = [
    r"Chapter\s+\d+", 
    r"\"[^\"]{10,}\"\s+said",  # Catches dialogue lines
    r"once upon a time", 
    r"\bprose\b"
]

def assert_zero_prose_compliance(text_content: str) -> bool:
    """Scans generated output to verify that no narrative prose has been generated."""
    # Check for direct dialogue sequences or novelistic narrative structures
    for pattern in PROSE_FLAG_KEYWORDS:
        if re.search(pattern, text_content, re.IGNORECASE):
            return False
    return True
```

If the outgoing content fails validation, or the user attempts to inject a direct request like *"Write chapter one of this story"*, the API intercepts the transaction and serves a fallback response: 
> *"As a structural diagnostic engine, I am calibrated to analyze and refine your story's architecture. I cannot write narrative prose or drafts. Let's return to stress-testing your stakes."*

---

## 7. JWT-Based User Authentication & Security

To secure individual user workspaces and track historical session logs, the backend API enforces stateless JWT (JSON Web Token) authentication.

### The Authentication Flow
1. **Signup/Registration:** The user submits `email` and `password` to `/api/auth/register`. The backend validates the inputs, hashes the password using **bcrypt** (minimum cost factor of 12), and writes the user record.
2. **Login/Token Generation:** The user authenticates at `/api/auth/login`. On credential verification, the backend generates an HS256-signed Access Token containing the user's `id` as the subject (`sub`) and an expiration timestamp (`exp`) set to 24 hours.
3. **Request Verification:** The frontend stores the token in memory or a secure `HttpOnly` cookie and attaches it as a bearer token (`Authorization: Bearer <JWT>`) to all state-changing endpoints.

### Python Backend Authentication Implementation (FastAPI Example)
```python
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import bcrypt

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-story-starter-key-change-in-prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440 # 24 Hours

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Cryptography helpers
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(12)).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# JWT Generation
def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": user_id, "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Dependency to secure routes
def get_current_user_id(token: str = Depends(oauth2_scheme)) -> str:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return user_id
    except JWTError:
        raise credentials_exception
```

---

## 8. Front-End UI/UX Architecture & Responsive Tailwind Components

The Story Starter interface uses a single-page interactive wizard designed with **React** and styled with utility-first **Tailwind CSS**. The interface features a clean, highly immersive typography-driven aesthetic inspired by professional publishing.

### Immersive Design Guidelines
*   **Palette:** Deep slate grays (`bg-slate-900`, `text-slate-100`), crisp margins, and low-contrast details (`text-slate-400`). Contrast colors should be minimal—using sage greens (`emerald-500`) for "Go", muted golds (`amber-500`) for "Pivot", and warm rusts (`rose-500`) for "Abandon" verdicts.
*   **Typography:** Editorial Serif headings (`font-serif`) for headers and story summaries; monospaced font blocks (`font-mono`) for the exportable payload.
*   **Pacing Progress Indicator:** A quiet, minimalist 4-dot status tracker positioned at the top of the chat area, indicating the current state (Foundations $\rightarrow$ Stress-Test $\rightarrow$ Verification $\rightarrow$ Report Complete).

### Turn 1–3 Conversation View Mockup (Tailwind CSS)
During active diagnostic turns, the interface displays a split-screen design. The left panel shows the **"Locked Parameters State Board"** (which populates in real-time as the State Audit updates the database), and the right panel hosts the active Socratic conversation.

```html
<!-- Main Application Wrapper -->
<div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
  
  <!-- Left Panel: State Board (Hidden on mobile, sticky on desktop) -->
  <aside class="w-full md:w-80 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col justify-between">
    <div>
      <h2 class="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-6 font-mono">Audited Narrative State</h2>
      <div class="space-y-4">
        <!-- Genre Parameter block -->
        <div class="p-3 bg-slate-950/50 rounded border border-slate-800">
          <span class="text-[10px] uppercase text-emerald-500 font-mono tracking-wide">Locked Genre</span>
          <p class="text-sm font-serif font-medium mt-1">Sci-Fi Thriller</p>
        </div>
        <!-- Character Parameter block -->
        <div class="p-3 bg-slate-950/50 rounded border border-slate-800">
          <span class="text-[10px] uppercase text-emerald-500 font-mono tracking-wide">Locked Character</span>
          <p class="text-sm font-serif font-medium mt-1">Space station custodian</p>
        </div>
        <!-- Setting Parameter block -->
        <div class="p-3 bg-slate-950/50 rounded border border-slate-800">
          <span class="text-[10px] uppercase text-slate-500 font-mono tracking-wide">Locked Setting</span>
          <p class="text-sm font-serif italic text-slate-400 mt-1">Pending Turn 2...</p>
        </div>
      </div>
    </div>
    
    <!-- Progress Indicator -->
    <div class="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
      <span class="text-xs text-slate-400 font-mono">Step 2 of 4</span>
      <div class="flex space-x-2">
        <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
        <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
        <span class="h-2 w-2 rounded-full bg-slate-700"></span>
        <span class="h-2 w-2 rounded-full bg-slate-700"></span>
      </div>
    </div>
  </aside>

  <!-- Right Panel: Socratic Conversation Area -->
  <main class="flex-1 flex flex-col h-screen max-h-screen">
    <!-- Chat Header -->
    <header class="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
      <h1 class="text-lg font-serif font-semibold tracking-tight">Story Starter Studio</h1>
      <span class="px-2.5 py-1 text-[10px] font-mono bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">Socratic Engine Active</span>
    </header>

    <!-- Scrollable Dialogue Hub -->
    <section class="flex-1 overflow-y-auto p-6 space-y-6">
      
      <!-- AI Editorial Message (No robotic uppercase headers) -->
      <div class="max-w-2xl bg-slate-900 border border-slate-800/80 rounded-lg p-6 space-y-4">
        <p class="text-sm text-slate-300 leading-relaxed font-serif">
          Your core setup has strong potential. The idea of a custodian hiding a dangerous biological change captures immediate stakes. However, to sustain a full manuscript, we must establish what stands in his path before corporate forces arrive.
        </p>
        <div class="border-t border-slate-800 pt-4 space-y-3">
          <p class="text-xs font-mono text-slate-400">Select an option or write a custom answer below:</p>
          <div class="grid grid-cols-1 gap-2">
            <button class="text-left text-sm p-3 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 transition">
              <span class="font-bold text-emerald-400">A.</span> His body begins reacting violently, rendering him unable to hide his symptoms.
            </button>
            <button class="text-left text-sm p-3 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 transition">
              <span class="font-bold text-emerald-400">B.</span> The station's diagnostic computer automatically flags his bio-signature.
            </button>
          </div>
        </div>
      </div>
      
    </section>

    <!-- User Response Input -->
    <footer class="p-4 border-t border-slate-800 bg-slate-950">
      <form class="max-w-2xl mx-auto flex gap-3">
        <input type="text" placeholder="Type your narrative choice or custom direction here..." class="flex-1 bg-slate-900 border border-slate-800 rounded px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition" />
        <button type="submit" class="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-6 py-3 rounded text-sm transition">Send Turn</button>
      </form>
    </footer>
  </main>
</div>
```

---

## 9. Deployment & Hosting Infrastructure

For cost-effectiveness, zero-maintenance scaling, and seamless management, the platform utilizes Google Cloud's serverless infrastructure.

### Production Environment Setup
1. **Backend Service: Google Cloud Run**
   * Deploy the FastAPI backend inside a lightweight Docker container. Cloud Run automatically scales down to zero instances during idle periods (eliminating active hosting costs) and handles sudden bursts of user activity natively.
   * Connect to **Google Secret Manager** to securely inject runtime environment variables (`GEMINI_API_KEY`, `JWT_SECRET`, and `DATABASE_URL`) directly into the Cloud Run container at startup.
2. **Database: Google Cloud SQL (PostgreSQL)**
   * Provision a serverless PostgreSQL instance on Google Cloud SQL, configuring automatic daily backups and enabling SSL communication between Cloud Run and the database.
   * Alternatively, use a serverless hosting provider like **Supabase** or **Neon** for a highly responsive, cost-friendly PostgreSQL tier.
3. **Frontend: Vercel or Netlify**
   * Build the React frontend as static assets and host on Vercel or Netlify for edge-optimized delivery, sub-millisecond load times, and automated CI/CD deployments directly from your Git repository.

### Complete Production Configuration (`.env.production` Template)
```env
# 1. API Server Settings
NODE_ENV=production
API_PORT=8000
ALLOWED_ORIGINS=https://storystar.com,https://www.storystar.com

# 2. Database Connection (Secure SSL Enforced)
DATABASE_URL=postgresql://db_user:db_strong_password@cloud-sql-endpoint:5432/storystarter_prod?sslmode=require

# 3. Security & Cryptography
JWT_SECRET=f98a287b41e3d69c28929b0aef1923058decf1c1f516a2ef7491d900600a943a
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# 4. Google AI Studio Credentials
GEMINI_API_KEY=AIzaSyD_ExampleGeminiAPIKeyProvidedByGoogleAIStudio

# 5. Native Cache Configuration
GEMINI_CACHE_TTL_MINUTES=30
```
