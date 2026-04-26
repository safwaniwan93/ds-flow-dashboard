# DS Flow Platform: Architecture & Security Audit (Production Hardened)

This document serves as a comprehensive technical audit of the **DS Flow Platform** architecture, detailing the underlying tech stack, security protocols, multi-tenant isolation, and the WordPress integration model.

---

## 1. High-Level Architecture Overview

The DS Flow Platform is a decoupled web architecture consisting of a **Management Dashboard** (Next.js) and a **Client Implementation** (WordPress Plugin).

### Tech Stack
*   **Framework:** Next.js 14+ (App Router)
*   **Database:** PostgreSQL (Supabase)
*   **ORM:** Prisma
*   **Authentication:** NextAuth.js (Dashboard), SHA-256 Hashed Bearer Tokens (API)
*   **Security Utilities:** Bcrypt (Passwords), SHA-256 (API Tokens/Connection Keys)
*   **Infrastructure:** Vercel (Next.js), Supabase (Postgres)

---

## 2. Authentication & Authorization Models

### 2.1 Dashboard User Authentication (NextAuth.js)
*   **Strategy:** JWT-based session management.
*   **Provider:** `CredentialsProvider`.
*   **Account Security:** 
    *   Passwords hashed with **bcrypt**.
    *   Account status (`isActive`) checked on every login attempt.
    *   Admin-only user creation flow; STAFF cannot manage users or roles.
*   **Role-Based Access Control (RBAC):** Users are assigned `ADMIN` or `STAFF` roles. API routes and Server Actions verify these roles via the signed JWT.

### 2.2 System API Authentication (One-Time Handshake)
To secure the link between WordPress and the Dashboard, a one-time secure handshake is implemented:
1.  **Key Generation:** An Admin generates a 32-byte random `connectionKey`. The dashboard stores only the **SHA-256 hash** of this key with a **2-hour expiration**.
2.  **Handshake:** The WordPress plugin sends the plaintext key. The Dashboard hashes it, verifies it matches the stored hash, and ensures it hasn't been used.
3.  **Token Issuance:** Upon success, the Dashboard generates a permanent 32-byte `siteToken`. It stores the **SHA-256 hash** and returns the plaintext to WordPress **exactly once**.
4.  **API Requests:** All subsequent API calls use `Authorization: Bearer <plaintext_token>`. The Dashboard hashes the incoming token to verify against its database.

---

## 3. Multi-Tenant Isolation & Data Integrity

### 3.1 Application-Layer Isolation
*   **Supabase RLS:** Since Prisma connects via server-side credentials (`DATABASE_URL`), **Supabase Row Level Security (RLS) is bypassed**. 
*   **Enforcement:** All data isolation is strictly enforced at the **Application Layer**. Every Prisma query for `STAFF` users includes a `where: { userId: session.user.id }` clause. 
*   **Machine Isolation:** API requests from WordPress are scoped to the `siteId` resolved from the unique `siteTokenHash`.

### 3.2 Audit Logging
A centralized `AuditLog` table tracks critical system events:
*   User Login (Success/Failure)
*   Site Connection (Success)
*   Product Synchronization
*   Promo Configuration (Draft/Publish/Delete)
*   User Management Actions
*   *Note: Sensitive data (passwords, tokens, keys) is never stored in audit logs.*

---

## 4. API Security & Rate Limiting

### 4.1 Production Hardening
*   **Rate Limiting:** Public endpoints are protected using a database-backed `RateLimit` table.
    *   **Site Connection:** 5 attempts per 15 minutes.
    *   **Product Sync:** 100 attempts per hour.
    *   **Config Fetch:** 5000 requests per hour.
*   **Hashed Secrets:** No plaintext tokens or connection keys are stored in the database.
*   **Input Validation:** All incoming payloads are validated before processing.

---

## 5. WordPress Plugin Security

The custom WordPress plugin implements standard security best practices:
*   **Capability Checks:** All settings and manual actions require `manage_options` capability.
*   **CSRF Protection:** Every form submission is protected by a WordPress **Nonce**.
*   **Data Sanitization:** Incoming API data is escaped using `esc_html`, `esc_attr`, and `esc_url` before rendering.
*   **Webhook Security:** The cache-clearing webhook verifies the dashboard's identity by hashing the local `siteToken` and comparing it to the incoming Bearer hash.

---

## 6. Deployment Requirements

The following environment variables are mandatory for production deployment on Vercel:
*   `DATABASE_URL`: Pooled connection (Port 6543) for application use.
*   `DIRECT_URL`: Direct connection (Port 5432) for Prisma migrations/pushes.
*   `NEXTAUTH_SECRET`: Random string for JWT signing.
*   `NEXTAUTH_URL`: Canonical URL of the dashboard.
