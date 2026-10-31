# E-Vote Campus
> **Your Voice. Your Vote. Your Campus.**

An advanced, full-stack college Electronic Voting System built as a final-year Computer Science project on the MERN stack (MongoDB ODM, Express.js, React 19, and Node.js).

---

## 1. Core Architecture & Highlights

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router DOM, Axios, Lucide React, Recharts analytics, and Canvas Confetti.
- **Backend**: Node.js, Express.js REST API architecture, Zod schema validation, bcrypt password hashing, and HTTP-only session cookies.
- **Database**: Document collection architecture (`users`, `elections`, `candidates`, `voterEligibility`, `ballots`, `auditLogs`, `emailTokens`, `passwordResetTokens`, `sessions`) with atomic ACID transaction guarantees and compound unique index constraints.
- **Security & Privacy**:
  - **Decoupled Anonymity**: Voter eligibility records are strictly separated from anonymous ballot records. No student IDs, emails, or session tokens are stored in ballot documents.
  - **Cryptographic Receipts**: Each ballot generates a private voter receipt code (e.g. `EVC-2026-XXXX-XXXX`) whose SHA-256 hash is bound to the cast vote.
  - **Public Verification Tool**: Voters can input their receipt code into `/verify-receipt` to prove inclusion in the official ballot box without disclosing their choices.
  - **Sealed Tallies**: Live candidate totals are sealed during active voting to eliminate bandwagon bias.
  - **Audit Trail**: Tamper-evident logging for all administrative events, nominations, status transitions, and ballot timestamps.

---

## 2. Pre-Configured Demo Accounts

Use the **"Demo Roles"** button in the top navigation bar or the pre-configured credentials below to test all 4 primary user roles:

| Role | Name | Email | Password | Access Highlights |
|---|---|---|---|---|
| **ADMIN** | Dr. Arthur Sterling | `admin@campus.edu` | `Admin@123456` | Full election control, candidate approval, CSV roster import, publish results |
| **VOTER** | Alex Rivera | `student@campus.edu` | `Student@123456` | Active student ready to cast ballot for all 4 positions and obtain receipt |
| **VOTED** | John Doe | `john.doe@campus.edu` | `Student@123456` | Already voted; demonstrates duplicate vote prevention and receipt lookup (`EVC-2026-F41A-98BD`) |
| **CANDIDATE** | Elena Vance | `elena.vance@campus.edu` | `Candidate@123456` | Presidential candidate managing campaign manifesto, symbol, and nomination |
| **AUDITOR** | Prof. Janet O'Connor | `auditor@campus.edu` | `Auditor@123456` | Independent read-only oversight of audit logs and certified ballot counts |

---

## 3. Election Datasets

1. **College Student Union Election 2026** (Status: `ACTIVE`)
   - Positions: President, Vice President, General Secretary, Cultural Secretary
   - Candidates with verified profiles, campaign symbols, and manifestos.
2. **Department Representatives Council 2025** (Status: `PUBLISHED`)
   - Official certified results with 77.8% turnout, Recharts bar charts, and downloadable PDF report.
3. **Sports Advisory Board Election 2026** (Status: `SCHEDULED`)
   - Scheduled upcoming athletics delegate election.

---

## 4. REST API Endpoints

### Authentication
- `POST /api/auth/register` — Register student account
- `POST /api/auth/verify-email` — Verify college email via single-use token or 6-digit code
- `POST /api/auth/resend-verification` — Resend verification token
- `POST /api/auth/login` — Sign in and receive session token
- `POST /api/auth/logout` — Terminate session
- `GET /api/auth/me` — Current authenticated user profile
- `POST /api/auth/forgot-password` — Generate password reset code
- `POST /api/auth/reset-password` — Set new password using recovery code

### Elections
- `GET /api/elections` — List elections with optional status filter
- `GET /api/elections/:id` — Election details, positions, candidate list, and voter status
- `POST /api/elections` — Create election (Admin)
- `PUT /api/elections/:id` — Update draft or scheduled election (Admin)
- `PATCH /api/elections/:id/status` — State machine transition (`DRAFT` → `SCHEDULED` → `ACTIVE` → `CLOSED` → `PUBLISHED`)

### Candidates
- `GET /api/candidates` — Filter candidates by election and position
- `GET /api/candidates/:id` — Full candidate manifesto and campaign data
- `POST /api/candidates` — Nominate candidate (Admin / Candidate)
- `PUT /api/candidates/:id` — Update manifesto and symbol
- `PATCH /api/candidates/:id/approval` — Approve / reject candidate (Admin)
- `DELETE /api/candidates/:id` — Delete candidate (Admin)

### Voting & Voter Dashboard
- `GET /api/voter/dashboard` — Personal eligible elections and participation summary
- `GET /api/voter/history` — Participation history with receipt codes (zero candidate disclosure)
- `POST /api/votes/cast` — Atomic ballot submission and receipt generation
- `GET /api/votes/verify-receipt` — Cryptographic receipt verification

### Admin & Auditing
- `GET /api/admin/dashboard` — Overview metrics and analytics data
- `GET /api/admin/voters` — Searchable student directory
- `PATCH /api/admin/voters/:id/status` — Activate or suspend student accounts
- `POST /api/admin/eligibility/import` — CSV batch roster and eligibility import
- `GET /api/admin/audit-logs` — Tamper-evident administrative audit log stream

### Results
- `GET /api/results/:electionId` — Certified results, candidate vote counts, winners, and turnout
- `POST /api/results/:electionId/publish` — Publish and certify closed election results (Admin)

---

## 5. Verification & Testing

Run unit tests via Node test runner:
```bash
npx --yes tsx --test server/tests/voting_rules.test.ts
```

Compile TypeScript and verify build:
```bash
npm run build
```
