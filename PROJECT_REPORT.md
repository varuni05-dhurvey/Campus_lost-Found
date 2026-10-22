# Full Stack Development Mini-Project Report

---

## 1. Title of the Project
**Campus Lost & Found Portal: A Centralized, Secure Web Application for University Belongings Recovery**

---

## 2. Motivation for Selection of the Topic
In collegiate and university environments, hundreds of students, faculty members, and administrative staff move across sprawling campuses, including lecture halls, laboratories, libraries, sports grounds, and cafeterias every day. Consequently, personal belongings—ranging from student identity smart cards, scientific calculators, and notebooks to high-value electronics such as laptop chargers, wireless earphones, keys, and wallets—are frequently misplaced or forgotten.

Traditionally, universities attempt to resolve lost-and-found communication informally through disorganized instant-messaging groups (e.g., WhatsApp, Telegram), physical notice boards, or informal inquiries with security guards. This approach suffers from critical weaknesses:
1. **Low Visibility and Fragmentation:** Lost item notifications quickly get buried under unrelated social chatter.
2. **Privacy and Safety Risks:** Students often publicly post their personal contact numbers, room numbers, or full descriptions of valuable possessions, creating risks of fraudulent claims or unsolicited harassment.
3. **Absence of Accountability:** There is no auditable record of who recovered an item, when it was returned, or whether the claimant was the genuine owner.

These challenges motivated the design and implementation of a centralized, responsive, role-authorized, full-stack web portal dedicated to streamlining campus item recovery while upholding user privacy.

---

## 3. Objectives of the Project
The primary engineering objectives of this project are:
- **Centralized Directory:** Provide a single, accessible database for cataloging all lost and found items across distinct campus facilities.
- **Granular Search & Filtering:** Enable multi-parameter querying by keywords, item category, campus location, incident date, and item recovery status.
- **Privacy-Preserving Verification:** Safeguard private identifying details (such as engravings, secret markings, lock-screen wallpapers, or internal card contents) so that they remain hidden from the public and are revealed only to authorized owners or moderators.
- **Structured Claim Workflow:** Implement a secure, auditable claim workflow where claimants must provide verifiable ownership evidence, and item finders can formally review, approve, or reject claims.
- **Role-Based Administrative Moderation:** Equip campus administrators with real-time analytics, automated recovery rate statistics, content moderation controls, and user oversight.
- **Full-Stack Syllabus Alignment:** Implement clean, maintainable MERN-stack architecture (MongoDB, Express.js, ReactJS, Node.js) with JWT authentication and RESTful API standards suitable for evaluation.

---

## 4. Customer Base / Target Users
The portal is designed specifically for higher education campus ecosystems:
1. **Students:** Undergraduate and postgraduate students across all departments who frequently move between classrooms, hostels, and recreational areas and need an immediate, trustworthy channel to locate misplaced items.
2. **Faculty Members:** Professors and instructors who find items left behind in lecture halls or laboratories and wish to hand them over safely or notify their students.
3. **Campus Staff & Security Personnel:** Security officers stationed at main entrance gates, library receptionists, and laboratory assistants who serve as official campus handover hubs.
4. **Campus Administrators & Evaluators:** System moderators responsible for maintaining content integrity, preventing spam, auditing claimed items, and tracking institutional recovery metrics.

---

## 5. Summary of the Project
The **Campus Lost & Found Portal** is an end-to-end full-stack web application designed and built with modern software engineering best practices:

- **Frontend Architecture:** Developed using **ReactJS** with functional components and modern React hooks (`useState`, `useEffect`, `useContext`, `useMemo`). Navigation is managed seamlessly through **React Router v6**, featuring protected routes for authenticated users and administrators. The visual design adheres to a collegiate navy palette (`#0f172a`, `#1e3a8a`) accented with emerald green (`#059669`) for recovered items. It utilizes a custom CSS3 design system (Flexbox, CSS Grid, custom properties) optimized for responsive mobile and desktop viewports without external bloated UI frameworks.
- **Backend Architecture:** Built with **Node.js** and **Express.js**, exposing RESTful API endpoints structured across controllers, routes, and middleware. It incorporates JSON Web Token (JWT) authorization, `bcryptjs` password hashing, and `express-rate-limit` for security. Uploaded item images are sanitized, MIME-validated, and served with a 5MB size limit via Multer.
- **Database & Data Modeling:** Powered by **MongoDB** with **Mongoose ODM**. Three primary collections are modeled:
  - `User`: Manages campus credentials, hashed passwords, roles (`student`, `faculty`, `staff`, `admin`), departments, and IDs.
  - `Item`: Tracks titles, descriptions, categories, incident dates, campus locations, optional photos, statuses (`lost`, `found`, `claim_pending`, `resolved`), and private identifying details (`select: false`).
  - `Claim`: Regulates the recovery lifecycle, linking claimants, item finders, identifying proof, claim statuses (`pending`, `approved`, `rejected`, `completed`), and review feedback.
- **Workflow & Testing:** Includes a fully automated 21-test API validation suite (`server/tests/api.test.js`) and a seed script (`server/seed/seed.js`) that populates realistic campus accounts and listings. Comprehensive unit and integration verification confirms 100% pass rates across authentication, CRUD operations, RBAC access control, and claim lifecycles.

---

## 6. Git Repository Link
- **GitHub Repository URL:** `[REPLACE WITH YOUR GITHUB REPOSITORY URL UPON CREATION, e.g., https://github.com/your-username/campus-lost-and-found-portal]`
- **Local Repository Status:** Initialized with Git, structured with `.gitignore`, initial commit prepared.
- **Postman API Collection:** `Campus_Lost_and_Found_API.postman_collection.json` included in repository root.

---
*Submitted for Full Stack Development Mini-Project Evaluation.*
