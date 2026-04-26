# Product Requirements Document (PRD)

## Project Name
DS Flow (Hybrid Dashboard + WordPress Plugin)

---

## 1. Overview

This system is designed to eliminate manual editing of multiple sales pages by introducing a centralized promo management dashboard that dynamically renders product combo sections across multiple WordPress websites using a plugin.

The system follows a hybrid architecture:
- **Dashboard (Antigravity Web App)** → Central control panel
- **WordPress Plugin** → Rendering engine + connector
- **WooCommerce** → Source of truth for product data

---

## 2. Objectives

- Reduce manual effort updating promo combos across multiple pages
- Centralize control of promo sections
- Enable dynamic rendering via shortcode
- Maintain WooCommerce as the source of truth
- Allow flexible customization per staff/site

---

## 3. Key Concepts

### 3.1 Promo Section (Slot)
A section block rendered on sales pages via shortcode.

Examples:
- evergreen-offers
- special-promo-offers

Each section contains:
- Section header (label, title, description)
- List of product cards

---

### 3.2 Product Card
Represents a promo combo displayed inside a section.

Structure includes:
- Title (e.g. SET TRIAL A)
- Badge (e.g. POPULAR)
- Top label (e.g. TAHAN 30 HARI)
- Promo text (e.g. Beli 1 Percuma 1)
- Poster image
- Price display
- Savings label
- Feature list
- CTA button

---

### 3.3 WooCommerce Integration
WooCommerce is the source of truth for:
- Product ID
- SKU
- Product name
- Price
- Stock status

Dashboard uses this data and extends it with display customization.

---

## 4. User Roles

### 4.1 Admin
- View all users
- View all connected sites
- Monitor activity
- Manage system-wide settings

### 4.2 Staff
- Manage their own site(s)
- Sync WooCommerce products
- Create/edit promo sections
- Customize product cards
- Publish changes

---

## 5. System Architecture

### 5.1 Dashboard (Antigravity)
Handles:
- Authentication
- Site management
- Product sync display
- Promo section builder
- Preview & publish

### 5.2 WordPress Plugin
Handles:
- Site connection to dashboard
- WooCommerce product sync
- Fetching published config
- Caching data
- Rendering shortcode output

### 5.3 Data Flow

1. Plugin syncs WooCommerce products → Dashboard
2. Staff configures promo sections in dashboard
3. Staff publishes config
4. Plugin fetches config
5. Sales page renders via shortcode

---

## 6. Functional Requirements

### 6.1 Authentication
- Email/password login
- Role-based access (Admin / Staff)

---

### 6.2 Site Management
- Connect WordPress site via plugin
- Store:
  - site_id
  - domain
  - API key/token
  - last sync

---

### 6.3 WooCommerce Product Sync

#### Features:
- Fetch products from plugin
- Store product mapping
- Manual sync button
- Auto sync (interval-based)

#### Synced Fields:
- wc_product_id
- sku
- name
- price
- image
- stock status

---

### 6.4 Promo Section Management

#### Section Fields:
- slot_key
- label_text
- title_line_1
- title_line_2
- description
- theme_variant
- status (draft/published)

#### Default Sections:
- evergreen-offers
- special-promo-offers

---

### 6.5 Product Card Management

#### Card Fields:
- wc_product_id
- card_title
- top_label
- promo_chip
- mini_offer_text
- poster_override
- feature_list[]
- button_text
- visible
- sort_order

#### Computed:
- checkout_url = site_domain + "?add-to-cart=" + wc_product_id

---

### 6.6 Section Assignment
- Assign cards to section
- Reorder cards (drag & drop)
- Show/hide cards

---

### 6.7 Preview System
- Real-time preview of section
- Reflect template structure

---

### 6.8 Publish System

States:
- Draft
- Published

On publish:
- Generate config version
- Push or allow plugin to fetch

---

## 7. WordPress Plugin Requirements

### 7.1 Core Features
- Settings page (connect dashboard)
- Store API credentials
- Sync Woo products
- Fetch config
- Cache config locally
- Shortcode renderer

---

### 7.2 Shortcode

Example:
```
[olivehouse_combo slot="special-promo-offers"]
```

Output:
- Full promo section
- Header + cards

---

### 7.3 CTA Logic

Auto-generated:
```
site_url + "?add-to-cart=" + wc_product_id
```

---

### 7.4 Caching
- Store config locally
- Reduce API calls
- Manual refresh option

---

## 8. UI/UX Requirements

### Section Layout
- Label above
- Two-line headline
- Description text
- 3-column product grid

### Card Layout
- Consistent structure
- Theme-based styling
- Mobile responsive

---

## 9. Non-Functional Requirements

- Fast rendering (cached data)
- Scalable for multiple sites
- Secure API communication
- Fault-tolerant sync

---

## 10. MVP Scope

### Included:
- User login
- Site connection
- WooCommerce sync
- Promo section builder
- Product card customization
- Preview
- Publish
- Plugin shortcode rendering

### Excluded (Future):
- Analytics
- A/B testing
- Advanced permissions
- Multi-template builder

---

## 11. Future Enhancements

- Campaign scheduling
- Auto promo switching
- Performance analytics
- Multi-template themes
- Cross-site cloning

---

## 12. Success Metrics

- Reduction in manual page edits
- Faster promo deployment time
- Consistent rendering across sites
- Lower human error rate

---

## 13. Summary

This system transforms static sales pages into dynamic, centrally managed promo sections, enabling scalable and efficient operations across multiple websites.

