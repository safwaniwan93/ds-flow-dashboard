# DS Flow Platform: Complete User & Admin Guide

Welcome to the DS Flow Platform. This guide provides step-by-step instructions for administrators and staff to manage WordPress promotional content centrally.

---

## 1. Getting Started: The Primary Admin

To begin, the platform requires an initial **ADMIN** user.

1.  **Seeding the Admin:** Run the command `npx ts-node seed.ts` from the `dashboard` directory.
2.  **Default Credentials:** 
    *   **Email:** `admin@example.com`
    *   **Password:** `admin123`
3.  **Security Note:** Once logged in, it is highly recommended to create a new admin account with a secure password and disable the default one.

---

## 2. User Management (Admin Only)

Administrators can manage the team via the **User Management** tab.

1.  **Access:** Navigate to `/dashboard/users`.
2.  **Creating Users:** 
    *   Input the staff email and a password (minimum 8 characters).
    *   Select the role: **STAFF** (can manage sites/promos) or **ADMIN** (full system access).
3.  **Disabling Accounts:** You can toggle the "Status" of any user to instantly revoke their access to the dashboard.

---

## 3. Connecting a WordPress Site

This process establishes a secure, encrypted link between your WordPress site and the dashboard.

### Step A: Generate a Key (Dashboard)
1.  Navigate to the **Sites** tab in the dashboard.
2.  Click **"Generate Connection Key"**.
3.  **Copy the Key** immediately. (For security, this key is only shown once and expires in 2 hours).

### Step B: Connect (WordPress)
1.  Install and activate the **DS Flow Plugin** on your WordPress site.
2.  Go to **DS Flow** in the WordPress sidebar.
3.  Paste the **Connection Key** and ensure the **API Base URL** points to your dashboard (e.g., `https://your-app.vercel.app/api/v1`).
4.  Click **"Connect"**.

*Success:* WordPress will securely receive a permanent `siteToken` and the status will change to **Connected**.

---

## 4. Synchronizing Products

Once connected, you must sync your WooCommerce products so the dashboard can build promo cards.

1.  In WordPress, go to the **DS Flow Settings** page.
2.  Click **"Manual WooCommerce Sync"**.
3.  The plugin will push your product SKUs, titles, prices, and images to the dashboard.
4.  *Note:* The plugin will also automatically sync individual products whenever they are updated in WooCommerce.

---

## 5. Building & Managing Promo Sections

1.  **Navigate to Builder:** In the dashboard, go to the **Sites** tab and click **"View Config"** or **"Manage"** for your site.
2.  **Slots:** You will see default slots like `evergreen-offers`.
3.  **Designing Cards:**
    *   Select a **Product** from the dropdown (synced from WooCommerce).
    *   Add a **Card Title**, **Promo Chip** (e.g., "HOT"), and **Feature List**.
    *   Override the price or image if needed.
4.  **Save vs. Publish:**
    *   **Save Draft:** Stores your changes in the dashboard only.
    *   **Publish:** Immediately pushes the changes live to your WordPress site and clears the plugin cache.

---

## 6. Implementation in WordPress (Shortcodes)

To display your designed promo sections on the website:

1.  Copy the **Slot Key** from the dashboard (e.g., `evergreen-offers`).
2.  In WordPress (Page or Post editor), use the following shortcode:
    ```text
    [ds_flow slot="evergreen-offers"]
    ```
3.  **Live Preview:** The section will now render with the latest published design, including RM pricing, feature lists, and "Beli Sekarang" buttons that link directly to the checkout.

---

## 7. Troubleshooting & Maintenance

*   **Cache Refresh:** If changes aren't appearing in WordPress, click **"Refresh Config Cache"** in the WordPress DS Flow settings.
*   **Re-syncing:** If you add new products to WooCommerce, run the **"Manual WooCommerce Sync"** to make them available in the dashboard builder.
*   **Security:** If a site is compromised, you can **"Disconnect"** it from the dashboard to instantly invalidate its access token.
