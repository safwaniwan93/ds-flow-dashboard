# DS Flow System Security Architecture

This document provides a deep dive into the security implementation of the DS Flow system, covering all layers from the administrative dashboard to the WordPress integration.

## 1. Authentication & Identity Management

### Administrative Dashboard (NextAuth.js)
The dashboard uses **Next-Auth** for session management and authentication.
- **Password Hashing**: Passwords are never stored in plain text. We use **bcrypt** with a cost factor of 10 to hash passwords before they enter the database.
- **JWT Session Strategy**: The system uses JSON Web Tokens (JWT) for session persistence, signed with a 256-bit secret (`NEXTAUTH_SECRET`).
- **Role-Based Access Control (RBAC)**:
  - `ADMIN`: Full access to user management, site connections, and content.
  - `STAFF`: Restricted to managing site content (promos/products). Access to user management is blocked at both the UI and API levels.

### User Security
- **Account Disabling**: Administrators can instantly revoke access by toggling the `isActive` flag in the database.
- **Self-Protection**: The system prevents administrators from accidentally disabling their own accounts.

---

## 2. Site Connection & Handshake (The "Blind" Security Model)

The connection between WordPress and the Dashboard uses a multi-stage security handshake designed to prevent unauthorized access even if one component is compromised.

### The Handshake Mechanism
1.  **Connection Keys**: When a site is added, a temporary `connectionKey` is generated.
2.  **One-Way Hashing**: Only the **SHA-256 hash** of the connection key is stored in the database (`connectionKeyHash`). The plain-text key is never stored.
3.  **One-Time Use**: Once a key is used to connect a site, it is marked as used (`connectionKeyUsedAt`) and cannot be reused.
4.  **Expiration**: Connection keys have a limited lifespan; they expire after a set time if not used.

### Permanent Site Tokens
Once the handshake is complete, the dashboard generates a 32-byte (64-character hex) `siteToken`.
- **Transmission**: The plain-text token is returned to the WordPress site **exactly once** during the handshake.
- **Storage**: The dashboard stores only the **SHA-256 hash** of this token.
- **Verification**: For every subsequent request, WordPress sends the token in the `Authorization: Bearer` header. The dashboard hashes the incoming token and compares it against the stored hash.

---

## 3. API Protection & Infrastructure

### Rate Limiting
To prevent brute-force attacks and DDoS attempts, we implement a database-backed rate limiting system:
- **Site Connection**: Limited to 5 attempts per 15 minutes per IP.
- **Config Fetching**: Limited to prevent scraping of promotional data.
- **Login Attempts**: Monitored to prevent password guessing.

### Audit Logging
The system maintains a comprehensive audit trail (`AuditLog` table) for all sensitive operations:
- **Redaction Logic**: A specialized logger automatically scans for and redacts sensitive keys like `password`, `token`, `connectionKey`, and `DATABASE_URL` before saving to the log.
- **Traceability**: Every log entry records the acting `userId`, the affected `siteId`, and the exact action performed.

### Environment Management
- **Secrets Isolation**: All sensitive credentials (database URLs, API secrets) are stored in `.env` files and are never committed to version control.
- **Connection Pooling**: Uses PgBouncer for secure, stable database connections to Supabase.

---

## 4. WordPress Plugin Security

The WordPress integration follows strict security standards to protect the host website:

- **Direct Access Protection**: All files begin with a check for `ABSPATH` to prevent direct script execution.
- **CSRF Protection**: All administrative actions (manual sync, config fetch) are protected by WordPress **Nonces**.
- **Capability Checks**: Operations are restricted to users with `manage_options` (Administrators) only.
- **Data Sanitization**: Incoming data from the dashboard is sanitized before being saved to the WordPress database.
- **Caching**: Remote configurations are stored in **Transients** for 30 minutes, reducing external API calls and protecting against dashboard downtime.

---

## 5. Summary of Security Strengths

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Identity** | NextAuth + bcrypt | Secure admin login |
| **API** | SHA-256 Hashing | Protect tokens/keys at rest |
| **Traffic** | Rate Limiting | Prevent brute-force/DDoS |
| **Trust** | Handshake Protocol | Secure site-to-dashboard link |
| **Visibility** | Redacted Audit Logs | Monitor system activity safely |
