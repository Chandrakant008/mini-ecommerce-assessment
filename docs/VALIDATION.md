# Data Validation & Import Architecture

## 1. Overview & Strategy

Real-world e-commerce datasets frequently contain errors, incomplete records, negative stock numbers, or inverted pricing.

In accordance with Section 18 of the Technical Specification:
> **"Validate each record independently so one malformed row does not stop the entire import. Invalid rows are skipped and reported with the exact reason, while valid records continue to be processed."**

---

## 2. Validation Rules Matrix

| Field | Rule | Failure Reason | Handling Action |
|---|---|---|:---:|
| `sku` | Non-empty string | `"Missing SKU"` | Skip record |
| `sku` | Unique across database and incoming file | `"Duplicate SKU '<sku>'"` | Skip record |
| `name` | Non-empty string | `"Missing product name"` | Skip record |
| `category` | Non-empty string | `"Missing category"` | Skip record |
| `mrp` | Non-negative decimal (`>= 0.00`) | `"Invalid MRP value"` or `"MRP cannot be negative"` | Skip record |
| `selling_price` | Required, non-negative decimal | `"Missing selling price"` or `"Selling price cannot be negative"` | Skip record |
| `selling_price` vs `mrp` | `selling_price <= mrp` | `"Selling price (<sp>) cannot be greater than MRP (<mrp>)"` | Skip record |
| `stock` | Integer `>= 0` | `"Negative inventory is not allowed"` | Skip record |
| `brand` | String | Defaults to `"Generic"` if omitted | Sanitized & Imported |
| `barcode` | String | Defaults to `""` if omitted | Sanitized & Imported |
| `specifications` | JSON or `Key: Value; Key2: Value2` | Normalized into JSON object | Sanitized & Imported |

---

## 3. CSV Importer Command

The importer is built as a native Django management command:

```powershell
python manage.py import_products <path-to-csv> [--clear]
```

### Options
- `path-to-csv`: Relative or absolute path to the CSV file.
- `--clear` (optional): Clears the existing `Product` table before starting the import.

### Execution Output Example (`data/invalid_sample_products.csv`)

```text
Starting product import from: ..\data\invalid_sample_products.csv
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

Validation Errors Encountered:
  • Row 3 - Missing product name
  • Row 4 - Missing selling price
  • Row 5 - Duplicate SKU 'ERR-VALID-01'
  • Row 6 - Negative inventory is not allowed (-3)
  • Row 7 - Selling price (750.00) cannot be greater than MRP (500.00)
  • Row 8 - Missing category
=============================================
```

---

## 4. Inventory Rules

Inventory rules are enforced uniformly across the domain layer (`backend/products/services.py`), the API serializers (`backend/products/serializers.py`), and the frontend cart calculations (`frontend/src/utils/cartCalculations.ts`):

```python
def get_stock_status(stock: int) -> Tuple[str, bool]:
    if stock <= 0:
        return "Out of Stock", False
    elif stock in (1, 2):
        return "Only Few Left", True
    else:
        return "In Stock", True
```

### Protection Enforcement Points:
1. **Catalog UI**: The "Add to Cart" button is explicitly disabled if `stock <= 0`.
2. **Cart Context State**: Attempting to add or increase beyond `product.stock` is caught and capped, returning a clear status message.
3. **Backend API**: The endpoint `POST /api/inventory/check/` verifies the live database stock before any sensitive checkout step.
