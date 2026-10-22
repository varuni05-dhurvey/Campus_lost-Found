# Viva Voce & Implementation Guide

> **Campus Lost & Found Portal**  
> Complete technical reference guide for viva examination, project demonstration, and faculty evaluation.

---

## 1. High-Level Architecture & Overview

### Q1: What is the purpose of the Campus Lost & Found Portal?
**Answer:**  
The portal is a centralized MERN-stack web application designed for collegiate campuses. It allows students, faculty, and administrative staff to report lost or found belongings, browse and filter listings across campus facilities, and securely claim items by providing verifiable identifying evidence without revealing secret details publicly. It replaces informal and insecure notice boards and chat groups with an auditable, privacy-preserving digital workflow.

### Q2: What is the high-level architecture of this application?
**Answer:**  
The application follows a modern **three-tier client-server architecture**:
1. **Presentation Layer (Frontend):** Built with ReactJS (Vite) and React Router v6. It communicates asynchronously with the backend using REST APIs and manages user state through an `AuthContext`.
2. **Application / Business Logic Layer (Backend):** Built with Node.js and Express.js. It implements modular routing, custom middleware for JWT validation, file uploads, rate limiting, and centralized error handling.
3. **Data Layer (Database):** MongoDB managed through Mongoose ODM, utilizing referenced document schemas (`User`, `Item`, `Claim`), text indexes for keyword searching, and compound indexes for fast filtering.

---

## 2. Frontend: ReactJS & CSS

### Q3: Why did you use ReactJS functional components and hooks instead of class components?
**Answer:**  
Functional components combined with React hooks (such as `useState`, `useEffect`, and `useContext`) provide:
- Cleaner, more readable code without the complexities of the `this` keyword or verbose lifecycle methods (`componentDidMount`, `componentDidUpdate`).
- Easier reuse of stateful logic through custom hooks.
- Better performance and tree-shaking support in modern bundlers like Vite.

### Q4: Which React hooks are used in this project and what are their specific roles?
**Answer:**  
- `useState`: Manages local component state, such as form input values, modal visibility (`claimModalOpen`, `editingItem`), and search filter criteria.
- `useEffect`: Triggers side-effects, such as fetching items from the API upon component mount or whenever search/filter parameters change in `BrowseItems.jsx`.
- `useContext`: Consumes the `AuthContext` to make authentication status, user profile, and `login`/`logout` functions available globally across all components without prop drilling.
- `useNavigate`: Programmatically redirects users (e.g., navigating to `/items/:id` after creating a report, or redirecting to `/login` if unauthenticated).
- `useParams`: Extracts dynamic route parameters from the URL, such as `id` in `/items/:id` to fetch the specific item details.
- `useSearchParams`: Reads and synchronizes query strings (e.g. `?search=AirPods&category=Electronics`) for shareable and bookmarkable filtered URLs.

### Q5: How is client-side routing implemented with React Router v6?
**Answer:**  
In `client/src/App.jsx`, routes are declared using `<BrowserRouter>`, `<Routes>`, and `<Route>` components. We implemented a custom `<ProtectedRoute>` wrapper that inspects the `AuthContext`. If an unauthenticated user attempts to access protected routes (such as `/report-lost`, `/dashboard`, or `/claims`), they are seamlessly redirected to `/login?redirect=...`. For the `/admin` route, the guard also validates that `user.role === 'admin'`.

### Q6: How does the application avoid using external bloated CSS frameworks like Tailwind?
**Answer:**  
The UI is styled using clean, modular Vanilla CSS3 defined in `client/src/styles/index.css`. It uses:
- **CSS Custom Properties (Variables):** Standardized color palettes (Collegiate Navy `#1e3a8a`, Emerald Accent `#059669`, Rose Red `#e11d48`), consistent spacing, and elevation shadows.
- **CSS Grid and Flexbox:** Used for responsive layouts such as the `items-grid` (`repeat(auto-fill, minmax(300px, 1fr))`) and the navbar.
- **Media Queries:** Tailored breakpoints at `1024px` and `768px` to guarantee full responsiveness across smartphones, tablets, and desktop displays.

---

## 3. Backend: Node.js & Express.js

### Q7: Explain the role of Express middleware in this project.
**Answer:**  
Middleware functions in Express intercept HTTP requests before they reach route handlers or response generation:
1. `express.json()` & `express.urlencoded()`: Parses incoming JSON and URL-encoded request bodies.
2. `cors()`: Regulates Cross-Origin Resource Sharing, allowing frontend requests from `CLIENT_URL`.
3. `apiLimiter` & `authLimiter`: Implemented via `express-rate-limit` to prevent brute-force login attacks and Denial-of-Service (DoS) abuse.
4. `authMiddleware.protect`: Inspects the `Authorization: Bearer <token>` header, decodes the JWT, verifies the user in MongoDB, and attaches `req.user`.
5. `authMiddleware.adminOnly`: Enforces role-based authorization by verifying `req.user.role === 'admin'`.
6. `uploadMiddleware`: Configured with Multer to validate image MIME types (`image/jpeg`, `image/png`, etc.) and limit file sizes to 5MB.
7. `errorMiddleware.errorHandler`: Intercepts unhandled errors, formats Mongoose validation errors into clean messages, and suppresses internal stack traces in production.

### Q8: What RESTful HTTP methods and status codes are used across the endpoints?
**Answer:**  
- **Methods:**
  - `GET`: Retrieve items, user profile, claims, or admin statistics.
  - `POST`: Create a new user (registration), log in, submit a report, or file a claim.
  - `PUT`: Update entire reports or user profiles.
  - `PATCH`: Partially update specific fields, such as item status or claim review status.
  - `DELETE`: Remove a listing and its associated claim inquiries.
- **HTTP Status Codes:**
  - `200 OK`: Successful retrieval or update.
  - `201 Created`: Resource successfully created (new user registered, new item reported, claim created).
  - `400 Bad Request`: Validation failure (empty required fields, mismatched passwords, invalid date format).
  - `401 Unauthorized`: Missing, invalid, or expired JWT token.
  - `403 Forbidden`: Authenticated user lacks required permissions (e.g. non-admin accessing admin endpoints).
  - `404 Not Found`: Requested item or route does not exist.
  - `409 Conflict`: Duplicate key conflict (e.g. attempting to register an already existing email address, or submitting a duplicate pending claim).
  - `500 Internal Server Error`: Unexpected server exception.

---

## 4. Database: MongoDB & Mongoose

### Q9: Describe the Mongoose data models and how relationships are handled.
**Answer:**  
1. **User Model (`User.js`):** Stores `name`, `email` (unique, validated), `passwordHash`, `role` (`student`, `faculty`, `staff`, `admin`), `department`, `idNumber`, and `phone`.
2. **Item Model (`Item.js`):** Contains `title`, `description`, `category`, `reportType` (`lost` or `found`), `dateOfIncident`, `campusLocation`, `locationDetails`, `imageUrl`, `identifyingDetails` (`select: false`), `contactPreference`, `status`, and a reference `reporter` pointing to the `User` model (`mongoose.Schema.Types.ObjectId`).
3. **Claim Model (`Claim.js`):** Represents an ownership claim. It references `item` (`Item`), `claimant` (`User`), and `itemOwner` (`User`), along with `message`, `identifyingEvidence`, `status` (`pending`, `approved`, `rejected`, `completed`), and `ownerFeedback`.
Relationships are maintained through normalized Mongoose `ObjectId` references and populated dynamically using `.populate('reporter', 'name email department')`.

### Q10: How are private identifying details protected in the database?
**Answer:**  
In `Item.js`, the field `identifyingDetails` is declared with `select: false`. When a query like `Item.find()` or `Item.findById()` executes, Mongoose omits this field from the database query projection by default. In `itemController.js`, `identifyingDetails` is only retrieved (`.select('+identifyingDetails')`) and included in the API response if the authenticated user is either the item's reporter or a designated administrator.

### Q11: What database indexes were created and why?
**Answer:**  
1. **Text Index:** `itemSchema.index({ title: 'text', description: 'text', locationDetails: 'text' })` enables fast, indexed full-text search across keywords.
2. **Compound Index:** `itemSchema.index({ reportType: 1, status: 1, category: 1, campusLocation: 1 })` optimizes high-frequency multi-field filtering queries.
3. **Compound Index on Claims:** `claimSchema.index({ item: 1, claimant: 1 })` speeds up checks preventing duplicate claim requests from the same user on the same item.

---

## 5. Authentication, Security & Validation

### Q12: How does the authentication flow work from login to protected routes?
**Answer:**  
1. The user enters email and password on `/login`.
2. The backend verifies the email and compares the password using `bcrypt.compare(enteredPassword, this.passwordHash)`.
3. If valid, the backend generates a signed JSON Web Token (JWT) containing the user's `id` and `role`, signed with `JWT_SECRET` and set to expire in 7 days.
4. The client receives the token and stores it in `localStorage`.
5. On subsequent requests, the client attaches the token in the HTTP `Authorization` header as `Bearer <token>`.
6. The backend `protect` middleware extracts the token, verifies the signature using `jwt.verify()`, retrieves the user document from MongoDB (excluding password), and assigns it to `req.user`.

### Q13: What security measures protect against common web vulnerabilities?
**Answer:**  
- **NoSQL Injection:** Inputs are sanitized and queries utilize Mongoose schema casting rather than raw, unvalidated query objects.
- **Cross-Site Scripting (XSS):** React automatically escapes all strings rendered inside JSX brackets `{...}`, preventing malicious injected `<script>` tags from executing.
- **Brute Force Attacks:** `express-rate-limit` throttles authentication endpoints to a maximum of 50 attempts per 15-minute window per IP.
- **Unrestricted File Uploads:** Multer checks real MIME types, rejects non-image formats, generates randomized filenames with sanitized extensions, and enforces a strict 5MB size limit.
- **Privilege Escalation:** Admin routes on the server strictly verify `req.user.role === 'admin'`. Frontend hiding is purely cosmetic; backend enforcement guarantees security.

---

## 6. Claim & Recovery Lifecycle

### Q14: Explain the complete end-to-end claim and recovery workflow.
**Answer:**  
1. **Reporting:** A student finds an item (e.g. CASIO calculator in the library) and reports it as `found`, leaving the identifying serial number or formula notes in the private `identifyingDetails` field.
2. **Discovery & Claim Submission:** The owner searches the directory, finds the listing, and clicks **Claim This Item**. The `ClaimModal` collects their explanation, contact info, and private identifying evidence.
3. **Finder Review:** The finder receives a notification badge on their dashboard and opens the **Claims I Received** tab.
4. **Verification & Approval:** The finder compares the submitted evidence against the item. If it matches, the finder clicks **Approve Claim** and leaves pickup instructions (e.g., "Handed to Central Library reception").
5. **Status Update:** The claim transitions to `approved`, and the item's status automatically updates to `resolved` / `Recovered`, updating the portal statistics.

---

## 7. Version Control, Deployment & Tooling

### Q15: How is this application configured for deployment on Render?
**Answer:**  
- **Backend (Web Service):** Root directory is `server`, start command is `node server.js`. It connects to a cloud-hosted MongoDB Atlas cluster via `MONGODB_URI` and accepts requests from the frontend using `CLIENT_URL`.
- **Frontend (Static Site):** Root directory is `client`, build command is `npm install && node node_modules/vite/bin/vite.js build`, and publish directory is `dist`. A rewrite rule (`/* -> /index.html`) is added to support HTML5 client-side pushState routing.

### Q16: How did you test the REST APIs during development?
**Answer:**  
We created:
1. **Automated Integration Test Suite (`server/tests/api.test.js`):** An automated test runner with 21 assertions that starts a test server, connects to MongoDB, and verifies registration, login, JWT validation, item CRUD, filtering, private field security, claims submission/approval, RBAC forbidden checks, and deletions.
2. **Postman Collection (`Campus_Lost_and_Found_API.postman_collection.json`):** A fully structured, runnable collection organized into Health, Auth, Items, Claims, and Admin folders with environment variables.

---

## 8. Source Code File Map

| File Path | Core Responsibility |
| :--- | :--- |
| `server/server.js` | Connects to MongoDB via Mongoose and launches Express HTTP server. |
| `server/app.js` | Configures Express middleware (CORS, body parser, rate limiter, static uploads, routes). |
| `server/models/Item.js` | Mongoose schema with text indexes, categories, campus locations, and private details. |
| `server/controllers/claimController.js` | Manages claim creation, validation (prevents self-claim), owner lists, and status changes. |
| `client/src/context/AuthContext.jsx` | React Context providing user session state, login, register, and logout globally. |
| `client/src/components/ProtectedRoute.jsx` | Route guard component enforcing authentication and administrator roles. |
| `client/src/pages/Home.jsx` | Landing page displaying hero section, live database statistics, recent items, and how-it-works. |
| `client/src/pages/BrowseItems.jsx` | Directory page supporting text search, category/location/status filters, and pagination. |
| `client/src/pages/ItemDetails.jsx` | Listing view showing photo, public information, and claim action modal. |
| `client/src/pages/AdminDashboard.jsx` | Administrator portal for moderation, analytics breakdown, and user management. |

---

## 9. Common Errors & Troubleshooting

### Q17: What happens if MongoDB fails to connect or is offline?
**Answer:**  
In `server/config/db.js`, the connection attempt is wrapped in a `try...catch` block. If MongoDB is offline, it logs:  
`[Database Error] MongoDB connection failed: ... Please make sure your MongoDB server is running or verify your MONGODB_URI.`  
The server exits gracefully rather than hanging silently, preventing phantom data operations.

### Q18: What causes a 401 Unauthorized error in the frontend?
**Answer:**  
A 401 error occurs if:
1. The user has not logged in and no `Authorization` header is attached.
2. The JWT token has expired (after 7 days).  
In our `client/src/services/api.js`, any 401 response automatically clears the stale token from `localStorage` and redirects the user to `/login?expired=true`.

### Q19: What causes a CastError in Mongoose and how is it handled?
**Answer:**  
A `CastError: Cast to ObjectId failed for value "123"` occurs when an invalid or malformed MongoDB ID string is passed in the URL (e.g., `/api/items/invalid-id`). Our centralized `errorMiddleware.js` catches `err.name === 'CastError'` and responds with a clean `400 Bad Request` and message `"Invalid resource ID format."`, preventing unhandled server crashes.
