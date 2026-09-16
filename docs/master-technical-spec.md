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
| **Gemini 1.5 Flash / 2.0 Flash** | **Turns 1, 2, and 3** (Conversational collection, state auditing, and stress-testing) | $0.075 (with caching: $0.01875) | $0.30 | High speed, near-zero cost, and fully capable of executing Socratic prompts and basic categorization. |
| **Gemini 1.5 Pro / 2.5 Pro** | **Turn 4 Only** (Massive 8-section report generation and structural diagnosis) | $1.25 (with caching: $0.3125) | $5.00 | Advanced reasoning capacity, exceptional adherence to complex stylistic guidelines, and high-fidelity analytical depth. |

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
   [ Backend API (Next.js / Node.js) ] <───> [ Database (PostgreSQL / D1) ]
        │      ▲
        │ HTTPS│ Gemini SDK 
        ▼      │
   [ Google AI Studio (Gemini API) ]
```

### The Stateless-to-Stateful Boundary
The LLM remains completely stateless. The Backend API acts as the state manager, storing the user’s narrative seed, answers, current turn count, and historical transcript in a database. On each turn, the backend retrieves the session history, appends the new message, and calls the Gemini API.

---

## 3. Database Schema (PostgreSQL / D1)

To support secure user account management and track user sessions across the strict 4-turn sequence:

```sql
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

```typescript
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
```

---

## 5. Endpoints & State Machine Execution

### Endpoint 1: `/api/session` (Initialize Session)
*   **Method:** `POST`
*   **Payload:** `{ "story_seed": "A space station custodian accidentally drinks experimental alien liquid." }`

### Endpoint 2: `/api/session/[id]/turn` (Submit Turn 2 & Turn 3 Answers)
*   **Method:** `POST`
*   **Payload:** `{ "user_answer": "Option B (it alters his DNA) and he wants to hide it before the corporate inspectors arrive." }`

### Endpoint 3: `/api/session/[id]/report` (Turn 4 - Report Generation)
*   **Method:** `POST`
*   **Payload:** `{ "user_answer": "Yes, standalone sci-fi thriller fits perfectly." }`

---

## 6. QA Safety & Zero-Prose Guardrail
A strict check to prevent the model from ghostwriting dialogue or prose, ensuring it remains an editorial diagnostic engine.

---

## 7. Front-End UI/UX Architecture
* Split-screen layout with real-time Audited State Board on the left and Socratic Dialogue Hub on the right.
* Dynamic quick-option buttons and custom answer input.
* 4-step progress tracker.
* Editorial Viability Report with scores, findings, next decisions, and exportable Story Bible payload.
