# NeoConnect — Staff Feedback & Complaint Management Platform

> Every voice heard. Every case tracked.

NeoConnect is a full-stack staff feedback and complaint management platform built for the NeoStats Hackathon. It gives employees a safe place to raise issues, vote on polls, and see how management is responding — with full accountability at every step.

---

## 🔗 Links

| | Link |
|---|---|
| **Frontend** | [https://neoconnect-git-main-thanuja9sekuri-8240s-projects.vercel.app](https://neoconnect-mu.vercel.app/)|
| **Backend API** | https://neoconnect-server.onrender.com |
| **GitHub Repo** | https://github.com/thanujaa9/neoconnect |
| **Presentation (PPT)** | https://docs.google.com/presentation/d/15iP0DMMS6OeX_cSppnyZ7NPajAngRGGq/edit?usp=drive_link&ouid=114322488330643517506&rtpof=true&sd=true |

---



---

## 📋 Overview

NeoConnect solves a real workplace problem — complaints getting lost in email chains with no accountability or tracking. The platform provides:

- A structured submission system with unique tracking IDs
- Role-based access for Staff, Secretariat, Case Managers, and Admin
- Auto-escalation of unactioned cases after 7 working days
- A public hub showing how staff feedback leads to real change
- Analytics that flag departments with recurring issues

---

## 🚀 Features

### 4.1 Submission Form (Staff)
- Submit feedback or complaints with category, department, location, and severity
- Anonymous submission toggle — name hidden from all users
- File attachment support (images and PDFs via Cloudinary)
- Every submission gets a unique tracking ID in format `NEO-YYYY-001`
- Past submissions stored locally so staff can always find their cases

### 4.2 Case Management (Secretariat & Case Manager)
- Secretariat sees all incoming cases in an inbox with status filters
- Assign cases to Case Managers via dropdown — no manual ID copying
- Assignment ownership — only the assigning secretariat can reassign (admin can override)
- Case Manager sees only their assigned cases, updates status and adds investigation notes
- Resolution summary form — Case Manager documents what action was taken before closing
- 7-day rule — cases with no response auto-escalate via a cron job running every weekday at 9am

### 4.3 Public Hub (All Staff)
- **Quarterly Digest** — list of all resolved cases
- **Impact Tracking** — table showing what was raised, what action was taken, what changed
- **Minutes Archive** — searchable list of uploaded meeting PDFs (secretariat upload only)

### 4.4 Polling System
- Secretariat creates polls with multiple options
- Only staff can vote (once per poll)
- Secretariat and Case Managers can view results only
- Results shown as progress bars with leading option highlighted
- Secretariat can close polls

### 4.5 Analytics Dashboard (Secretariat & Admin)
- Bar chart — cases by department
- Pie chart — cases by category
- Bar chart — cases by status
- Hotspot flagging — red alert when 5+ cases share same department and category
- Summary stats — total, resolved, in-progress, escalated

### Admin (IT)
- View all users in a searchable table
- Change any user's role instantly
- Stats showing user count by role

---

## 🔐 User Roles

| Role | Access |
|---|---|
| **Staff** | Submit cases, track cases, vote in polls, view public hub |
| **Secretariat** | All cases inbox, assign cases, my assigned cases, analytics, polls, public hub |
| **Case Manager** | My cases, update status, investigation notes, resolution summary |
| **Admin** | All cases, analytics, user management, override assignments |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (JavaScript) + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Authentication | JWT (JSON Web Tokens) |
| File Storage | Cloudinary |
| Scheduling | node-cron (7-day escalation) |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |

---

## 🗂️ Project Structure

```
neoconnect/
├── client/                          # Next.js frontend
│   ├── app/
│   │   ├── page.js                  # Login
│   │   ├── register/page.js         # Register
│   │   ├── dashboard/page.js        # Role-based redirect
│   │   ├── staff-dashboard/page.js  # Staff home
│   │   ├── submit/page.js           # Submit a case
│   │   ├── track/page.js            # Track by ID (public)
│   │   ├── cases/page.js            # All cases (secretariat)
│   │   ├── cases/[id]/page.js       # Case detail
│   │   ├── mycase/[id]/page.js      # Staff case view
│   │   ├── mycases/page.js          # Case manager view
│   │   ├── secretariat-cases/page.js# My assigned cases
│   │   ├── polls/page.js            # Polls
│   │   ├── analytics/page.js        # Analytics dashboard
│   │   ├── hub/page.js              # Public hub
│   │   └── admin/page.js            # User management
│   ├── components/
│   │   ├── Layout.js                # Sidebar + main layout
│   │   └── Sidebar.js               # Role-aware navigation
│   └── lib/
│       └── api.js                   # All API calls in one file
│
└── server/                          # Express backend
    ├── models/
    │   ├── User.js                  # User schema
    │   ├── Case.js                  # Case schema with tracking ID
    │   ├── Poll.js                  # Poll schema
    │   └── Minutes.js               # Meeting minutes schema
    ├── routes/
    │   ├── auth.js                  # Register, login, user management
    │   ├── cases.js                 # Full case lifecycle
    │   ├── polls.js                 # Polls and voting
    │   ├── analytics.js             # Aggregation queries
    │   └── hub.js                   # Public hub endpoints
    ├── middleware/
    │   └── auth.js                  # JWT verify + role check
    ├── jobs/
    │   └── escalation.js            # 7-day cron job
    ├── seed.js                      # Test user seeder
    └── index.js                     # Express app entry point
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas account
- Cloudinary account (for file uploads)

### 1. Clone the repo

```bash
git clone https://github.com/thanujaa9/neoconnect.git
cd neoconnect
```

### 2. Setup server

```bash
cd server
npm install
```

Create a `.env` file (use `.env.example` as reference):

```env
MONGO_URI=mongodb://localhost:27017/neoconnect
JWT_SECRET=your_jwt_secret_here
PORT=8000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Seed test users:

```bash
node seed.js
```

Start the server:

```bash
npm run dev
```

Server runs at `http://localhost:8000`

### 3. Setup client

```bash
cd ../client
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Start the client:

```bash
npm run dev
```

Client runs at `http://localhost:3000`

---

## 🧪 Test Accounts (after seeding)

| Email | Password | Role |
|---|---|---|
| staff@test.com | password123 | Staff |
| secret@test.com | password123 | Secretariat |
| manager@test.com | password123 | Case Manager |
| admin@test.com | password123 | Admin |

---

## 🔄 Case Lifecycle

```
New → Assigned → In Progress → Pending → Resolved
                                       ↘ Escalated (auto after 7 days)
```

---

## 📌 Unique Design Decisions

1. **Assignment Ownership** — Only the secretariat who assigned a case can reassign it. Admin can override. Mirrors Jira/ServiceNow workflow.
2. **Resolution Summary** — Case Manager must document what action was taken before closing. This feeds the Public Hub Impact Tracking table automatically.
3. **Anonymous Tracking** — Anonymous submissions store the case ID in localStorage so staff can track progress without ever logging in with their identity.
4. **Hotspot Auto-Flagging** — MongoDB aggregation detects when 5+ cases share the same department and category and shows a red alert banner automatically.
5. **Public Hub Transparency** — Resolved cases are published publicly with full impact tracking so staff can see their feedback made a difference.
6. **7-Day Cron Escalation** — node-cron runs every weekday at 9am. Cases assigned but not actioned in 7 working days are auto-escalated — no manual checking needed.

---

## 🌐 Environment Variables Reference

### Server `.env`

```
MONGO_URI            MongoDB connection string
JWT_SECRET           Secret key for JWT signing
PORT                 Server port (default 8000)
CLOUDINARY_CLOUD_NAME  Cloudinary cloud name
CLOUDINARY_API_KEY   Cloudinary API key
CLOUDINARY_API_SECRET  Cloudinary API secret
```

### Client `.env.local`

```
NEXT_PUBLIC_API_URL  Backend API base URL
```

---

## 📄 License

Built for the NeoStats Full Stack Hackathon. All rights reserved.
