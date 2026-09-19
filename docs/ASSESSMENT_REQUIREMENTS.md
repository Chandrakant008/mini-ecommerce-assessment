# Assessment Requirements Traceability Matrix

This document maps every requirement from the original `Website Developer Technical Assessment.docx` and the engineering specification to the concrete implementation in this repository.

---

## 1. Mandatory Functional Requirements

| Requirement | Specification | Implementation File(s) | Status | Verification Method |
|---|---|---|:---:|---|
| **Product Listing Page** | Display catalog with image, title, brand, MRP, selling price, discount %, stock status, Add to Cart | `frontend/src/pages/ProductListingPage.tsx`<br>`frontend/src/components/ProductCard.tsx` | **PASS** | Visual browser test + API serializer verification |
| **Search Products** | Real-time / debounced search by name, brand, SKU via backend query parameter (`?search=`) | `backend/products/views.py`<br>`frontend/src/components/SearchBar.tsx` | **PASS** | Automated Django test `test_search_products` + browser test |
| **Brand Filter** | Dynamic brand filter populated from catalog database (`?brand=`) | `backend/products/views.py` (`BrandListView`)<br>`frontend/src/components/FilterPanel.tsx` | **PASS** | Automated Django test `test_filter_by_brand` + browser test |
| **Category Filter** | Dynamic category filter from catalog database (`?category=`) | `backend/products/views.py` (`CategoryListView`)<br>`frontend/src/components/FilterPanel.tsx` | **PASS** | Automated Django test `test_filter_by_category` + browser test |
| **Price Sorting** | Price: Low to High (`price_asc`), Price: High to Low (`price_desc`) | `backend/products/views.py`<br>`frontend/src/components/SortSelect.tsx` | **PASS** | Automated Django tests `test_sort_by_price_ascending/descending` |
| **Combinable Query Params** | Search + Brand + Category + Sort working seamlessly together | `backend/products/views.py`<br>`frontend/src/pages/ProductListingPage.tsx` | **PASS** | Automated Django test `test_combined_search_filter_sort` |
| **Catalog States** | Loading state, error state with retry, empty state with reset, normal state | `frontend/src/components/LoadingState.tsx`<br>`frontend/src/components/EmptyState.tsx`<br>`frontend/src/components/ErrorState.tsx` | **PASS** | Browser UI inspection of all 4 states |
| **Product Detail Page** | `/products/:id` showing large image, brand, name, MRP, selling price, discount, available stock, stock badge, specs table, quantity selector, Add to Cart | `frontend/src/pages/ProductDetailPage.tsx` | **PASS** | Automated Django test `test_get_product_detail_success` + browser walkthrough |
| **Detail 404 / Error State** | Useful error screen when product ID is invalid or not found | `backend/products/views.py`<br>`frontend/src/pages/ProductDetailPage.tsx` | **PASS** | Automated Django test `test_get_product_detail_not_found` |
| **Shopping Cart** | `/cart` route supporting add, remove, increase, decrease, line totals, subtotal, discount, final payable | `frontend/src/pages/CartPage.tsx`<br>`frontend/src/context/CartContext.tsx`<br>`frontend/src/components/CartItem.tsx`<br>`frontend/src/components/CartSummary.tsx` | **PASS** | End-to-end cart test & state calculations |
| **Empty Cart State** | Display "Your cart is empty. Start shopping" when cart has 0 items | `frontend/src/pages/CartPage.tsx` | **PASS** | Browser UI inspection |
| **Inventory Rules** | Stock = 0: "Out of Stock", purchase disabled<br>Stock = 1 or 2: "Only Few Left", purchase allowed up to stock<br>Stock >= 3: "In Stock", purchase allowed up to stock | `backend/products/services.py`<br>`frontend/src/utils/cartCalculations.ts`<br>`frontend/src/components/StockBadge.tsx` | **PASS** | Automated Django test suite `StockRulesAndServicesTestCase` |
| **Inventory Protection** | Customer can never purchase or select quantity > available stock (enforced at UI, Context, and Backend API) | `backend/products/views.py` (`InventoryCheckView`)<br>`frontend/src/context/CartContext.tsx`<br>`frontend/src/components/QuantitySelector.tsx` | **PASS** | Automated Django tests `test_inventory_check_*` + UI boundary tests |
| **Cart Calculations** | `line_total = selling_price * qty`<br>`line_discount = (mrp - selling_price) * qty`<br>`subtotal = sum(line_total)`<br>`total_discount = sum(line_discount)`<br>`final_payable = subtotal` | `frontend/src/utils/cartCalculations.ts` | **PASS** | Unit tests and live cart summary verification |
| **Discount Calculation** | `((MRP - selling_price) / MRP) * 100` handling 0 MRP, missing prices safely | `backend/products/services.py`<br>`frontend/src/utils/cartCalculations.ts` | **PASS** | Automated Django test `test_discount_calculation_*` |
| **Database Storage** | SQLite database with Product model and indexes | `backend/products/models.py`<br>`backend/db.sqlite3` | **PASS** | Django migrations applied successfully |
| **Data Validation** | Row-by-row independent validation during import, skipping invalid records with clear summary | `backend/products/validators.py`<br>`backend/products/management/commands/import_products.py` | **PASS** | Automated Django tests `ProductValidationTestCase` + CLI import run on `invalid_sample_products.csv` |
| **Responsive Design** | Desktop, Tablet, Mobile responsive layout for header, grid, detail, and cart | `frontend/src/index.css` | **PASS** | Viewport testing across desktop & mobile widths |

---

## 2. Bonus Features Implemented

| Bonus Feature | Implementation Details | Status |
|---|---|:---:|
| **Automated Tests** | 28 automated tests in `backend/products/tests.py` testing services, validation, serializers, and all API endpoints | **PASS** |
| **CSV Product Importer** | `python manage.py import_products <path>` with `--clear` flag, row-by-row validation, and summary logs | **PASS** |
| **Django Admin Panel** | Standard Django admin registered in `backend/products/admin.py` with custom list columns, filters, and search | **PASS** |
| **localStorage Cart Persistence** | Safe cart hydration and syncing with stock integrity checks | **PASS** |
