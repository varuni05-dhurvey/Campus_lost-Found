# Campus Lost & Found Portal

> **Full Stack Development Mini-Project**  
> A centralized, modern, and secure web application for college campuses to report, track, claim, and recover lost and found belongings.

---

## 1. Project Overview

### Problem Statement
On college campuses, students, faculty, and staff frequently misplace personal items such as ID cards, notebooks, scientific calculators, water bottles, keys, wallets, and laptop chargers. Relying on disorganized WhatsApp/Telegram groups, physical notice boards, or word-of-mouth makes tracking lost items stressful, slow, and unreliable.

### Solution
The **Campus Lost & Found Portal** provides a centralized, database-backed platform where campus members can:
- Report lost belongings with descriptions, categories, and campus locations.
- Report items found on campus with safe contact or handover preferences.
- Search and filter active listings in real time.
- Protect private identifying details from public view.
- Submit ownership claim requests with distinguishing evidence.
- Review and approve claims as listing finders, automatically marking items as recovered.
- Provide administrators with a dashboard for content moderation, analytics, and user oversight.

---

## 2. Technology Stack

- **Frontend**:
  - ReactJS (Functional Components, Hooks: `useState`, `useEffect`, `useContext`, `useMemo`)
  - React Router v6 for client-side routing and protected routes
  - Vanilla CSS3 with CSS Grid, Flexbox, and CSS Variables (no Tailwind; clean collegiate navy and emerald theme)
  - Lucide React for modern, lightweight SVG icons
  - Vite for development and production bundling

- **Backend**:
  - Node.js & Express.js RESTful API architecture
  - Mongoose ODM for MongoDB schemas, indexes, and aggregations
  - JSON Web Tokens (JWT) for authentication
  - `bcryptjs` for secure password hashing (10 salt rounds)
  - Multer with MIME validation and 5MB size limit for image uploads
  - `express-rate-limit` for rate limiting against brute force attacks
  - Centralized error handling and validation middleware

- **Database**:
  - MongoDB (local or MongoDB Atlas via `MONGODB_URI`)

---

## 3. Project Folder Structure

```
Campus Lost & found Portal/
├── client/                               # React + Vite Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/                   # Navbar, Footer, ItemCard, FilterBar, ClaimModal, StatusBadge, etc.
│   │   ├── context/                      # AuthContext.jsx
│   │   ├── pages/                        # Home, BrowseItems, ItemDetails, ReportItem, Login, Register, Dashboard, MyReports, ClaimsPage, AdminDashboard, NotFound
│   │   ├── services/                     # api.js, authService.js, itemService.js, claimService.js, adminService.js
│   │   ├── styles/                       # index.css (Complete Design System)
│   │   ├── App.jsx                       # Routes & Route Guards
│   │   └── main.jsx                      # React DOM Entry
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── .env
├── server/                               # Node.js + Express + MongoDB Backend
│   ├── config/                           # db.js (Mongoose Connection)
│   ├── controllers/                      # authController, itemController, claimController, adminController
│   ├── middleware/                       # authMiddleware, uploadMiddleware, errorMiddleware
│   ├── models/                           # User.js, Item.js, Claim.js
│   ├── routes/                           # authRoutes, itemRoutes, claimRoutes, adminRoutes
│   ├── seed/                             # seed.js (Populates realistic campus demo data & admin)
│   ├── tests/                            # api.test.js (Automated 21-test API validation suite)
│   ├── uploads/                          # Statically served uploaded item images
│   ├── app.js                            # Express app configuration & middleware
│   ├── server.js                         # Server entry point
│   ├── package.json
│   ├── .env.example
│   └── .env
├── Campus_Lost_and_Found_API.postman_collection.json # Complete Postman API Collection
├── PROJECT_REPORT.md                     # Two-Page Academic Project Report
├── VIVA_PREPARATION.md                   # 25+ Viva Q&A Guide for Evaluators
├── README.md
└── .gitignore
```

---

## 4. Default Demo Accounts

The project comes with a seed script that creates realistic campus accounts:

| Role | Name | Email | Password | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | Campus Administrator | `admin@campus.edu` | `AdminPass123!` | Moderate listings, review stats, manage users |
| **Student 1** | Rohit Sharma (CSE) | `rohit.sharma@college.edu` | `StudentPass123!` | Report lost items, submit claims |
| **Student 2** | Ananya Verma (ECE) | `ananya.verma@college.edu` | `StudentPass123!` | Report found items, review claims |
| **Faculty** | Dr. Arindam Sen | `prof.sen@college.edu` | `FacultyPass123!` | Campus faculty member |

*(The login page includes 1-click Quick Demo buttons to instantly populate these credentials during faculty evaluation!)*

---

## 5. Local Setup & Running Instructions (Windows)

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Server running locally on port 27017, or a free MongoDB Atlas connection string.

### Step 1: Clone or Open Project
```powershell
cd "c:\Varuni Work\Campus Lost & found Portal"
```

### Step 2: Backend Setup
```powershell
cd server
npm install
```

Configure `server/.env` (already created, or copy from `server/.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/campus_lost_found
JWT_SECRET=super_secret_jwt_key_campus_lost_found_2026
CLIENT_URL=http://localhost:5173
ADMIN_DEFAULT_EMAIL=admin@campus.edu
ADMIN_DEFAULT_PASSWORD=AdminPass123!
```

### Step 3: Seed Database
Populate realistic sample campus data and demo accounts:
```powershell
node seed/seed.js
```

### Step 4: Run Backend Tests
Run the automated test suite to verify all 21 REST API endpoints:
```powershell
node tests/api.test.js
```

### Step 5: Start the Backend Server
```powershell
node server.js
```
The backend will run on `http://localhost:5000`.

### Step 6: Frontend Setup (in a separate terminal)
```powershell
cd ..\client
npm install
node node_modules/vite/bin/vite.js
```
The frontend will run on `http://localhost:5173`. Open this URL in your web browser.

---

## 6. REST API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new student or faculty account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `POST` | `/api/auth/logout` | Public | Clear user session |
| `GET` | `/api/auth/me` | Private | Get authenticated user profile |
| `PUT` | `/api/auth/profile` | Private | Update user profile information |

### Items (`/api/items`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/items` | Public | Browse & search items (category, location, status, page) |
| `GET` | `/api/items/:id` | Public/Auth | View item details (reveals private fields to owner/admin) |
| `GET` | `/api/items/mine` | Private | List all items reported by current user |
| `POST` | `/api/items` | Private | Create new lost or found report (optional image upload) |
| `PUT` | `/api/items/:id` | Private (Owner) | Update an existing report |
| `PATCH`| `/api/items/:id/status` | Private (Owner) | Quick status change (e.g. mark resolved) |
| `DELETE`| `/api/items/:id` | Private (Owner) | Delete report and related claims |

### Claims (`/api/claims`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/claims` | Private | Submit claim with private identifying evidence |
| `GET` | `/api/claims/mine` | Private | View claims submitted by current user |
| `GET` | `/api/claims/received` | Private | View claims received for current user's items |
| `PATCH`| `/api/claims/:id/status`| Private (Owner) | Approve or reject claim with feedback |

### Administrator (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Admin | Real-time portal statistics and distribution charts |
| `GET` | `/api/admin/items` | Admin | View all reports with moderation flags |
| `PATCH`| `/api/admin/items/:id/moderate` | Admin | Flag suspicious listings or add moderator notes |
| `DELETE`| `/api/admin/items/:id` | Admin | Permanently remove inappropriate listings |
| `GET` | `/api/admin/users` | Admin | View registered campus members and activity counts |

---

## 7. Testing & Verification

The project includes an automated test suite (`server/tests/api.test.js`) testing all critical workflows against the live MongoDB instance:
- **System Health**: Verifies 200 OK and JSON health payload.
- **Authentication**: Admin login, new student registration, password hashing verification, and `/me` session profile.
- **Items CRUD**: Querying listings, keyword text search, category and location filters, creating new reports, updating fields, and verifying 401 unauthorized rejection.
- **Claims Workflow**: Prevents self-claims, submits identifying evidence, and verifies retrieval.
- **Role-Based Access Control (RBAC)**: Validates that regular students are rejected with `403 Forbidden` on admin endpoints.
- **Moderation**: Administrator item flagging and deletion.

**Result**: 21 / 21 Tests Passed (0 Failures).

---

## 8. Render Deployment Instructions

### A. Deploy Backend Web Service on Render
1. Push your repository to GitHub.
2. Sign in to [Render](https://render.com) and click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Set the following settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Under **Environment Variables**, add:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: *Your MongoDB Atlas connection string (e.g. `mongodb+srv://<user>:<password>@cluster0.mongodb.net/campus_lost_found?retryWrites=true&w=majority`)*
   - `JWT_SECRET`: *A long random secret string*
   - `CLIENT_URL`: *The Render URL of your frontend (e.g. `https://campus-lost-found-client.onrender.com`)*
6. Click **Deploy Web Service**. Render will assign you an API URL (e.g., `https://campus-lost-found-api.onrender.com`).

### B. Deploy Frontend Static Site on Render
1. In Render, click **New +** -> **Static Site**.
2. Connect the same GitHub repository.
3. Set the following settings:
   - **Root Directory**: `client`
   - **Build Command**: `npm install && node node_modules/vite/bin/vite.js build`
   - **Publish Directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: *Your Render backend service URL (e.g. `https://campus-lost-found-api.onrender.com`)*
5. Under **Redirects/Rewrites**:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite` *(ensures React Router single-page navigation works on page refresh)*
6. Click **Deploy Static Site**.

---

## 9. Academic Deliverables Included
- **[PROJECT_REPORT.md](PROJECT_REPORT.md)**: 2-page print-ready academic project report following the required 6-section structure.
- **[VIVA_PREPARATION.md](VIVA_PREPARATION.md)**: 25+ viva interview questions and detailed answers covering React, Node, Express, MongoDB, security, and project architecture.
- **[Campus_Lost_and_Found_API.postman_collection.json](Campus_Lost_and_Found_API.postman_collection.json)**: Ready-to-import Postman collection.
#   C a m p u s _ l o s t - F o u n d  
 