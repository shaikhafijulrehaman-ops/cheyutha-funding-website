# Cheyutha Helping Society - NGO Website

A premium, modern, responsive NGO fundraising platform designed for **Cheyutha Helping Society** (referred to as Achuta Society in brief). The site is built to build visitor trust, showcase certified transparency, and maximize fundraising conversions through Razorpay.

## Key Features

1.  **Transparency Portal:** Showcases verified PDF certificates for Society Registration, Ministry of Corporate Affairs CSR, PAN Card, Section 12A, and Section 80G tax exemptions.
2.  **High-Conversion Donation Flow:** A smooth overlay modal with preset amount selectors, custom amount options, and full PAN field capture, integrated with Razorpay Checkout.
3.  **Real-Time Admin Dashboard:** Secured administrator panel with CRUD systems to instantly update community members, programs, media galleries, sponsors, rotating quotes, and events without redeployment.
4.  **Persistent Fallback Engine:** Features a dual-mode database service. By default, it operates with a localized JSON persistent database (`server/mock_db.json`) allowing immediate offline inspection and testing of admin updates, CRUDs, and payment completions. Changing one toggle links it to live Supabase Postgres.

---

## Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

### 2. Run the Backend Server
1.  Navigate to the `/server` folder:
    ```bash
    cd server
    ```
2.  Install dependencies (already pre-installed during scaffold):
    ```bash
    npm install
    ```
3.  Start the backend dev server (monitors changes via Nodemon):
    ```bash
    npm run dev
    ```
    The server will run on `http://localhost:5000` with the Mock Database enabled.

### 3. Run the Frontend Client
1.  Navigate to the `/client` folder:
    ```bash
    cd client
    ```
2.  Install dependencies (already pre-installed during scaffold):
    ```bash
    npm install
    ```
3.  Start the Vite development server:
    ```bash
    npm run dev
    ```
    Open the local URL printed in the terminal (usually `http://localhost:5173`) in your browser.

---

## Configuration & Custom Keys

### 1. Linking a Live Database (Supabase)
To shift from the local mock JSON database to your live cloud database:
1.  Create a project on [Supabase](https://supabase.com/).
2.  Open the SQL Editor in your Supabase Dashboard and run the queries defined in the root [schema.sql](file:///c:/Users/shaik/Documents/funding%20website/schema.sql) file to create the tables.
3.  Open [server/.env](file:///c:/Users/shaik/Documents/funding%20website/server/.env) and edit:
    ```env
    USE_MOCK_DATA=false
    SUPABASE_URL=https://your-project-id.supabase.co
    SUPABASE_KEY=your-supabase-service-role-or-anon-key
    ```
4.  Restart your backend server. All public reads and admin CRUD changes will now reflect on your live Supabase Postgres tables.

### 2. Linking Razorpay Payments
By default, the server runs in Sandbox checkout mode. To link your live business gateway:
1.  Obtain your Keys from the [Razorpay Dashboard](https://dashboard.razorpay.com/).
2.  Open [server/.env](file:///c:/Users/shaik/Documents/funding%20website/server/.env) and add your credentials:
    ```env
    RAZORPAY_KEY_ID=rzp_live_yourkeyid
    RAZORPAY_KEY_SECRET=yourkeysecret
    ```
3.  Set `USE_MOCK_DATA=false` to test verification. (For testing payments in sandbox mode without using real money, you can use Razorpay's test credentials).

---

## Credentials

*   **Admin Dashboard URL:** `/admin`
*   **Default Password:** `admin123` (Change this in [server/.env](file:///c:/Users/shaik/Documents/funding%20website/server/.env) under `ADMIN_PASSWORD`)
