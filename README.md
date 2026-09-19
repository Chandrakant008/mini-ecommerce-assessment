# ApexStore — Mini E-Commerce Platform

> **Technical Assessment Implementation**  
> A high-performance, maintainable, and professionally architected mini e-commerce web application built using **React (Vite + TypeScript)** and **Python (Django + Django REST Framework + SQLite)**.

---

## 1. Project Overview

ApexStore is a full-stack mini e-commerce application demonstrating modern full-stack development best practices. The project fulfills all mandatory assessment requirements including dynamic product catalogs, multi-attribute filtering, combinable search and sorting, authoritative inventory rules, and real-time shopping cart mathematics.

---

## 2. Key Features

- **Product Catalog Listing**: Responsive product grid displaying product images, titles, brands, MRP, selling price, computed discount percentage badges, and live stock badges.
- **Backend Search**: Real-time / debounced search querying across product name, brand, category, subcategory, and SKU.
- **Brand & Category Filtering**: Dynamic filter dropdowns derived directly from active database records.
- **Price Sorting**: Sort products by *Price: Low to High* and *Price: High to Low*, combinable with active search and filter queries.
- **Product Detail Page (`/products/:id`)**: Two-column layout with large media preview, detailed specifications table, warehouse stock count, and quantity selector.
- **Authoritative Inventory Rules**:
  - `Stock = 0` → **Out of Stock** (Add to Cart disabled, purchase blocked)
  - `Stock = 1 or 2` → **Only Few Left** (Purchase allowed up to available stock)
  - `Stock >= 3` → **In Stock** (Purchase allowed up to available stock)
- **Multi-Level Inventory Protection**: Enforced at UI level (stepper bounds), State level (`CartContext` reducer), and Backend level (`POST /api/inventory/check/`).
- **Shopping Cart (`/cart`)**: Live quantity management, individual line totals, total discount savings, and final payable calculations with `localStorage` persistence.
- **Resilient Data Import**: Management command capable of ingesting CSV catalogs row-by-row, skipping invalid data (missing names, prices > MRP, negative stock, duplicate SKUs) with full error reporting.
- **Automated Test Suite**: 28 automated Django tests covering inventory rules, discounts, validation errors, and all REST endpoints.

---

## 3. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 + TypeScript + Vite | Component-driven, type-safe user interface |
| **Routing** | React Router DOM v7 | Client-side routing (`/`, `/products/:id`, `/cart`) |
| **Icons & Styling** | Lucide React + Vanilla CSS | Modern responsive design system with CSS custom properties |
| **HTTP Client** | Axios | RESTful backend communication |
| **Backend** | Python 3.13 + Django 6.1 | Web framework and ORM |
| **API Layer** | Django REST Framework (DRF) | RESTful API endpoints and serializers |
| **CORS** | django-cors-headers | Cross-origin resource sharing between Vite and Django |
| **Database** | SQLite (`db.sqlite3`) | Relational database storage |

---

## 4. Architecture & Data Flow

```
┌────────────────────────────────────────────────────────┐
│               Frontend: React 19 + Vite                │
│   (TypeScript, React Router DOM, Modern Vanilla CSS)   │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (HTTP)
                            ▼
┌────────────────────────────────────────────────────────┐
│            Backend API: Django 6.1 + DRF               │
│   (CorsHeaders, Serializers, Routing, REST Views)      │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│        Domain Services & Validation Layer              │
│   (services.py: get_stock_status, validate_inventory)  │
│   (validators.py: validate_product_data)               │
└───────────────────────────┬────────────────────────────┘
                            │ Django ORM
                            ▼
┌────────────────────────────────────────────────────────┐
│               Database: SQLite (db.sqlite3)           │
│   (Product Table, Unique SKU index, Price indexes)     │
└────────────────────────────────────────────────────────┘
```

For detailed architecture diagrams and layer responsibilities, refer to [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## 5. Project Directory Structure

```text
mini-ecommerce-assessment/
├── README.md                          # Project documentation and interview guide
├── .gitignore                         # Python, Django, Node, and editor ignore rules
├── .env.example                       # Environment variables template
├── run_servers.bat                    # One-click Windows startup script for both servers
│
├── docs/                              # Formal assessment documentation
│   ├── ASSESSMENT_REQUIREMENTS.md    # Requirement-by-requirement traceability matrix
│   ├── ARCHITECTURE.md               # System architecture and data flow diagrams
│   ├── API.md                        # Full REST API specification with sample payloads
│   ├── VALIDATION.md                 # Data validation and error handling rules
│   └── FINAL_AUDIT.md                # Final verification audit (100% PASS)
│
├── data/                              # Product datasets
│   ├── products.csv                   # Valid sample catalog with varied stock levels
│   └── invalid_sample_products.csv    # Test data demonstrating row-by-row error handling
│
├── backend/                           # Django backend application
│   ├── manage.py
│   ├── requirements.txt
│   ├── db.sqlite3
│   ├── config/
│   │   ├── settings.py                # Django settings, CORS, and DRF config
│   │   ├── urls.py                    # Root URL router
│   │   ├── asgi.py
│   │   └── wsgi.py
│   └── products/
│       ├── models.py                  # Product catalog and stock model
│       ├── services.py                # Stock rules, inventory checks, discount logic
│       ├── validators.py              # Independent row validation rules
│       ├── serializers.py             # Product and inventory serializers
│       ├── views.py                   # REST API controllers
│       ├── urls.py                    # API route definitions
│       ├── admin.py                   # Django Admin registration
│       ├── tests.py                   # 28 automated tests
│       └── management/commands/
│           └── import_products.py     # CSV import CLI command
│
└── frontend/                          # React + TypeScript frontend
    ├── package.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── api/productApi.ts          # Centralized Axios service layer
        ├── types/product.ts           # TypeScript interfaces
        ├── utils/
        │   ├── cartCalculations.ts    # Centralized ecommerce calculations
        │   └── formatCurrency.ts      # INR currency formatting utility
        ├── context/CartContext.tsx    # Cart state reducer + localStorage persistence
        ├── hooks/useCart.ts           # useCart convenience hook
        ├── components/                # Reusable UI components
        │   ├── Header.tsx
        │   ├── Footer.tsx
        │   ├── SearchBar.tsx
        │   ├── FilterPanel.tsx
        │   ├── SortSelect.tsx
        │   ├── StockBadge.tsx
        │   ├── QuantitySelector.tsx
        │   ├── ProductCard.tsx
        │   ├── ProductGrid.tsx
        │   ├── CartItem.tsx
        │   ├── CartSummary.tsx
        │   ├── LoadingState.tsx
        │   ├── EmptyState.tsx
        │   ├── ErrorState.tsx
        │   └── Toast.tsx
        ├── pages/                     # Routed pages
        │   ├── ProductListingPage.tsx
        │   ├── ProductDetailPage.tsx
        │   └── CartPage.tsx
        ├── index.css                  # Custom CSS design system & tokens
        ├── App.tsx                    # Root application component
        └── main.tsx                   # Application entrypoint
```

---

## 6. Prerequisites

- **Python**: 3.10+ (Tested on Python 3.13.14)
- **Node.js**: 18+ (Tested on Node v22.15.0 with npm 11.11.0)
- **Git**: 2.30+

---

## 7. Step-by-Step Setup Instructions

### 7.1 Backend Setup (Django)

1. Open a terminal and navigate to the `backend/` directory:
   ```powershell
   cd mini-ecommerce-assessment\backend
   ```

2. (Optional) Create and activate a Python virtual environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. Install backend dependencies:
   ```powershell
   python -m pip install -r requirements.txt
   ```

4. Apply database migrations:
   ```powershell
   python manage.py migrate
   ```

5. Import sample product catalog into SQLite:
   ```powershell
   python manage.py import_products ..\data\products.csv --clear
   ```

6. Start the Django backend server:
   ```powershell
   python manage.py runserver 8000
   ```
   *The backend will be live at `http://127.0.0.1:8000/api/products/`.*

---

### 7.2 Frontend Setup (React + Vite)

1. Open a second terminal and navigate to the `frontend/` directory:
   ```powershell
   cd mini-ecommerce-assessment\frontend
   ```

2. Install npm dependencies:
   ```powershell
   npm install
   ```

3. Start the Vite development server:
   ```powershell
   npm run dev
   ```
   *The application will be accessible at `http://localhost:5173`.*

---

## 8. Data Import & Validation CLI

The project includes an importer capable of handling malformed or incomplete records gracefully without crashing.

### Command Syntax:
```powershell
cd backend
python manage.py import_products <path-to-csv> [--clear]
```

### Demonstration on Invalid Dataset:
```powershell
python manage.py import_products ..\data\invalid_sample_products.csv
```
**Output:**
```text
  [SKIPPED] Row 3 - Missing product name
  [SKIPPED] Row 4 - Missing selling price
  [SKIPPED] Row 5 - Duplicate SKU 'ERR-VALID-01'
  [SKIPPED] Row 6 - Negative inventory is not allowed (-3)
  [SKIPPED] Row 7 - Selling price (750.00) cannot be greater than MRP (500.00)
  [SKIPPED] Row 8 - Missing category

=============================================
PRODUCT IMPORT SUMMARY
=============================================
Total records processed : 8
Successfully imported    : 2
Skipped invalid records  : 6
=============================================
```

---

## 9. REST API Reference Summary

| Method | Endpoint | Query Parameters / Payload | Description |
|---|---|---|---|
| `GET` | `/api/products/` | `search`, `brand`, `category`, `ordering` | Fetch product catalog with combinable filters |
| `GET` | `/api/products/<id>/` | — | Fetch product details by ID |
| `POST` | `/api/inventory/check/` | `{ "product_id": 1, "quantity": 2 }` | Authoritative backend stock check |
| `GET` | `/api/brands/` | — | List of distinct brands |
| `GET` | `/api/categories/` | — | List of distinct categories |

For full request/response JSON schemas, see [docs/API.md](docs/API.md).

---

## 10. Stock Rules (Assessment Specification)

| Warehouse Stock | Display Badge | Customer Can Add / Purchase? | Stepper Behavior |
|---:|---|:---:|---|
| `<= 0` | `Out of Stock` (Red) | **NO** | Add to Cart button disabled |
| `1` or `2` | `Only Few Left` (Amber) | **YES** | Stepper capped at available stock |
| `>= 3` | `In Stock` (Green) | **YES** | Stepper capped at available stock |

Implemented centrally in `backend/products/services.py:get_stock_status()` and `frontend/src/utils/cartCalculations.ts:getStockStatus()`.

---

## 11. Cart Calculations

All calculations follow the exact formulas defined in Section 14:
- **Line Total**: `selling_price × quantity`
- **Line Discount**: `(MRP - selling_price) × quantity`
- **Subtotal**: `sum(line_total)`
- **Total Discount**: `sum(line_discount)`
- **Final Payable**: `subtotal`

No extra fees, taxes, or shipping surcharges are injected unless required.

---

## 12. Automated Testing

To run the full backend test suite:
```powershell
cd backend
python manage.py test products
```

**Results:**
```text
Ran 28 tests in 0.159s
OK (28 passed, 0 failures, 0 errors)
```

To test the frontend TypeScript build:
```powershell
cd frontend
npm run build
```
**Results:** `✓ built in 3.68s` (0 TypeScript or bundle errors).

---

## 13. Assumptions & Known Limitations

1. **Local Evaluation**: SQLite is utilized for simplicity and zero-configuration assessment evaluation.
2. **Product Dataset**: A realistic, curated catalog of 16 technology items has been provided in `data/products.csv`. When official interviewer data is provided, it can be imported directly via `python manage.py import_products <file> --clear`.
3. **Checkout Flow**: Real payment gateways and payment transactions are excluded to keep scope focused on mandatory assessment requirements; a simulated checkout action is provided.

---

## 14. Future Production Improvements

If extending this application for production-scale deployment:
1. **Database**: Migrate from SQLite to **PostgreSQL** for concurrent transaction isolation and high-throughput read replicas.
2. **Concurrency / Race-Conditions**: Implement database row-level locking (`select_for_update()`) or atomic inventory deductions inside database transactions during checkout.
3. **Caching**: Utilize **Redis** to cache product catalog listings, distinct brand lists, and frequently queried search results.
4. **Media Storage**: Upload images to AWS S3 / Cloudflare R2 behind a CDN rather than hotlinking.
5. **Authentication & Persistent Carts**: Implement JWT authentication with server-side persistent shopping carts.

---

## 15. AI Assistance Disclosure

AI coding assistants (Google DeepMind Antigravity) were utilized for scaffolding, rapid implementation of test suites, and documentation drafting. All code, database schemas, inventory rules, and arithmetic calculations were manually inspected, executed, and verified through automated tests and end-to-end browser walkthroughs.
