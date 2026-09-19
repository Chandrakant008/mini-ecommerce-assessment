# System Architecture Specification

## 1. High-Level Architecture Overview

ApexStore is a decoupled full-stack e-commerce application designed with clear separation of concerns, defensive validation, and authoritative backend controls.

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

---

## 2. Layer Responsibilities

### 2.1 Frontend (`frontend/`)
- **UI & Presentation**: Modern, accessible user interface built with semantic HTML and responsive CSS.
- **Client Routing**: Managed via `react-router-dom` (`/` for catalog, `/products/:id` for detail, `/cart` for shopping cart).
- **Cart State Management**: Centralized `CartContext` with `useReducer` and `localStorage` persistence.
- **API Service Layer**: Centralized Axios client (`src/api/productApi.ts`) abstracting backend communication and environment base URLs.
- **Cart Calculations**: Centralized arithmetic functions in `src/utils/cartCalculations.ts` ensuring consistency with backend formulas.

### 2.2 Backend (`backend/`)
- **REST API Endpoints**: Stateless JSON endpoints exposing catalog browsing, filtering, sorting, and stock checks.
- **Authoritative Business Rules**: Centralized domain services (`products/services.py`) defining stock status strings, purchase capability, and discount calculations.
- **Defensive Data Validation**: Independent row validation engine (`products/validators.py`) preventing malformed or negative data from entering the database.
- **Data Ingestion**: Custom management command (`import_products.py`) supporting graceful CSV imports with detailed error summaries.

### 2.3 Database (`backend/db.sqlite3`)
- SQLite chosen for zero-dependency local setup, self-contained evaluation, and deterministic state.
- Indexed on `sku` (unique), `brand`, `category`, `selling_price`, and `created_at`.

---

## 3. Data Flow Diagrams

### 3.1 Catalog Browsing & Search Flow
```
User Enters Search / Changes Filter
             │
             ▼
Debounced Query Updated in URL SearchParams
             │
             ▼
fetchProducts({ search, brand, category, ordering })
             │
             ▼
GET /api/products/?search=...&brand=...&ordering=...
             │
             ▼
Django ProductListView -> QuerySet Filtering & Ordering
             │
             ▼
ProductSerializer Computes:
  - discount_percentage
  - stock_status ("Out of Stock" / "Only Few Left" / "In Stock")
  - can_purchase (boolean)
             │
             ▼
Frontend Renders ProductGrid with Active Filter Chips
```

### 3.2 Inventory Protection Flow (Multi-Tier Defense)
```
User clicks "Add to Cart" or adjusts Quantity
             │
             ▼
[Tier 1: UI Level]
Quantity stepper disabled if qty >= product.stock or stock == 0.
"Add to Cart" button disabled if stock == 0 or max already in cart.
             │
             ▼
[Tier 2: State / Context Level]
CartContext reducer validates quantity <= product.stock.
Rejects any payload resulting in quantity > available_stock.
             │
             ▼
[Tier 3: Backend Verification Level]
POST /api/inventory/check/ { product_id, quantity }
Authoritatively checks database Product.stock.
Returns { can_purchase: boolean, available_stock: int, message: str }.
```

---

## 4. Ecommerce Business Logic Design

### Stock Status Rules
| Stock Quantity | Status Label | Badge Style | Can Purchase? |
|---:|---|---|:---:|
| `<= 0` | `Out of Stock` | Crimson (`#ef4444`) | **No** |
| `1` or `2` | `Only Few Left` | Amber (`#f59e0b`) | **Yes** |
| `>= 3` | `In Stock` | Emerald (`#10b981`) | **Yes** |

Implemented centrally in `backend/products/services.py:get_stock_status()` and mirrored in `frontend/src/utils/cartCalculations.ts:getStockStatus()`.

### Cart Calculations
```text
line_total = selling_price * quantity
line_discount = (MRP - selling_price) * quantity
subtotal = sum(line_total)
total_discount = sum(line_discount)
final_payable = subtotal
```
Taxes, coupons, and delivery surcharges are deliberately excluded to strictly match the assessment specification.
