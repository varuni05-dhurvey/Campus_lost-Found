# MongoDB Database Files & Upload Guide

This directory contains the complete database export for the **Campus Lost & Found Portal**, ready to be imported into **MongoDB Atlas (Cloud)**, **MongoDB Compass (GUI)**, or any local/remote MongoDB instance.

---

## 1. Database Structure & Files Included

Database Name: `campus_lost_found`

| File | Collection Name | Records | Description |
| :--- | :--- | :--- | :--- |
| **`users.json`** | `users` | 4 documents | Administrator, student reporters, finders, and faculty accounts with hashed passwords. |
| **`items.json`** | `items` | 6 documents | Realistic lost & found items across categories (Electronics, IDs, Stationery, Wallets, Keys). |
| **`claims.json`** | `claims` | 2 documents | Ownership claim requests linking users and items with verification evidence. |
| **`campus_lost_found_database.json`** | *(All)* | Consolidated | Single unified JSON containing database metadata and all 3 collections together. |

---

## 2. Option A: Upload to MongoDB Atlas (Cloud Database)

Use this method when hosting your project online (e.g. on Render or Heroku) or sharing with evaluators.

### Step 1: Create a Free Cluster on MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in.
2. Click **Create** -> Choose **M0 Free Shared Cluster**.
3. Under **Security Quickstart**:
   - Create a database user with a **Username** and **Password** (e.g. `campus_user` and a strong password). Note these down.
   - Under **Network Access** / IP Access List, click **Add Current IP Address** or add `0.0.0.0/0` (Allow Access from Anywhere).

### Step 2: Get your Connection String
1. Click **Connect** -> **Drivers** (Node.js).
2. Copy your connection URI, which looks like:
   ```text
   mongodb+srv://campus_user:<password>@cluster0.abcde.mongodb.net/campus_lost_found?retryWrites=true&w=majority
   ```
   *(Replace `<password>` with your actual database user password).*

### Step 3: Instant 1-Command Upload
From your project root folder in PowerShell or Command Prompt, run:
```powershell
node server/seed/importDB.js "mongodb+srv://campus_user:YOUR_PASSWORD@cluster0.abcde.mongodb.net/campus_lost_found?retryWrites=true&w=majority"
```
All users, items, and claims will be automatically created and uploaded into your Atlas cluster in seconds!

### Step 4: Connect your Backend to Atlas
In `server/.env`, update `MONGODB_URI`:
```env
MONGODB_URI=mongodb+srv://campus_user:YOUR_PASSWORD@cluster0.abcde.mongodb.net/campus_lost_found?retryWrites=true&w=majority
```

---

## 3. Option B: Upload via MongoDB Compass (Desktop GUI)

Use this if you or your faculty prefer using MongoDB Compass.

### Step 1: Connect to MongoDB
1. Open **MongoDB Compass**.
2. Connect to your local instance (`mongodb://localhost:27017`) or paste your Atlas connection URI.

### Step 2: Create Database & Collections
1. Click the **`+`** icon next to **Databases** on the left sidebar.
2. Enter:
   - **Database Name**: `campus_lost_found`
   - **Collection Name**: `users`
3. Click **Create Database**.
4. Inside `campus_lost_found`, click **Create Collection** twice more to add:
   - `items`
   - `claims`

### Step 3: Import the JSON files
For each collection:
1. Click on the **`users`** collection.
2. Click **Add Data** -> **Import JSON or CSV file**.
3. Browse and select `database/users.json`.
4. Ensure the file type is set to **JSON** and click **Import**.
5. Repeat the exact same steps for:
   - Collection **`items`** -> Import `database/items.json`
   - Collection **`claims`** -> Import `database/claims.json`

---

## 4. Option C: Quick Local Reset / Restore

If running locally on your laptop:

- To re-import from the `database/` JSON files:
  ```powershell
  node server/seed/importDB.js
  ```
- Or generate fresh data using the seed script:
  ```powershell
  npm run seed
  ```
- To re-export anytime after making new reports or claims:
  ```powershell
  npm run db:export
  ```
