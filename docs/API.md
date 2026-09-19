-# REST API Reference Manual

Base API Endpoint: `http://localhost:8000/api`

---

## 1. Product Catalog

### `GET /api/products/`
Retrieves a list of catalog products. Supports multiple combinable query parameters for search, filtering, and sorting.

#### Query Parameters
| Parameter | Type | Required | Description | Example |
|---|---|:---:|---|---|
| `search` | `string` | No | Search query matched against product name, brand, category, subcategory, and SKU | `?search=Pro` |
| `brand` | `string` | No | Filter by exact brand name (case-insensitive) | `?brand=Apple` |
| `category` | `string` | No | Filter by exact category name (case-insensitive) | `?category=Electronics` |
| `ordering` | `string` | No | Sort order: `price_asc` (low to high), `price_desc` (high to low), `name_asc` (A-Z), default (`-created_at`) | `?ordering=price_asc` |

#### Combined Example
```http
GET /api/products/?search=pro&brand=Apple&category=Electronics&ordering=price_asc
```

#### Successful Response (`200 OK`)
```json
[
  {
    "id": 1,
    "sku": "TECH-APL-001",
    "barcode": "8901234001",
    "name": "Apple iPhone 15 Pro 128GB",
    "brand": "Apple",
    "category": "Electronics",
    "subcategory": "Smartphones",
    "mrp": "134900.00",
    "selling_price": "124900.00",
    "discount_percentage": 7.4,
    "stock": 2,
    "stock_status": "Only Few Left",
    "can_purchase": true,
    "image": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
    "specifications": {
      "Display": "6.1-inch Super Retina XDR",
      "Processor": "A17 Pro Chip",
      "Storage": "128GB",
      "Camera": "48MP Triple System"
    },
    "created_at": "2026-09-18T05:52:42.123456Z",
    "updated_at": "2026-09-18T05:52:42.123456Z"
  }
]
```

---

## 2. Product Detail

### `GET /api/products/<id>/`
Retrieves detailed information for a single product by primary key ID.

#### URL Parameters
| Parameter | Type | Required | Description |
|---|---|:---:|---|
| `id` | `integer` | Yes | Numeric Product ID |

#### Successful Response (`200 OK`)
```json
{
  "id": 1,
  "sku": "TECH-APL-001",
  "barcode": "8901234001",
  "name": "Apple iPhone 15 Pro 128GB",
  "brand": "Apple",
  "category": "Electronics",
  "subcategory": "Smartphones",
  "mrp": "134900.00",
  "selling_price": "124900.00",
  "discount_percentage": 7.4,
  "stock": 2,
  "stock_status": "Only Few Left",
  "can_purchase": true,
  "image": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
  "specifications": {
    "Display": "6.1-inch Super Retina XDR",
    "Processor": "A17 Pro Chip"
  },
  "created_at": "2026-09-18T05:52:42.123456Z",
  "updated_at": "2026-09-18T05:52:42.123456Z"
}
```

#### Error Response: Product Not Found (`404 Not Found`)
```json
{
  "error": "PRODUCT_NOT_FOUND",
  "message": "Product with ID 9999 does not exist."
}
```

#### Error Response: Invalid ID (`400 Bad Request`)
```json
{
  "error": "INVALID_ID",
  "message": "Invalid product ID provided."
}
```

---

## 3. Real-Time Inventory Verification

### `POST /api/inventory/check/`
Authoritative backend validation checking whether a requested purchase quantity can be fulfilled against available stock.

#### Request Body
```json
{
  "product_id": 1,
  "quantity": 2
}
```

#### Successful Response — In Stock & Allowed (`200 OK`)
```json
{
  "product_id": 1,
  "requested_quantity": 2,
  "available_stock": 2,
  "can_purchase": true,
  "stock_status": "Only Few Left",
  "message": "Inventory check successful."
}
```

#### Successful Response — Exceeds Stock (`200 OK`)
```json
{
  "product_id": 1,
  "requested_quantity": 5,
  "available_stock": 2,
  "can_purchase": false,
  "stock_status": "Only Few Left",
  "message": "Requested quantity (5) exceeds available stock (2)."
}
```

#### Successful Response — Out of Stock (`200 OK`)
```json
{
  "product_id": 5,
  "requested_quantity": 1,
  "available_stock": 0,
  "can_purchase": false,
  "stock_status": "Out of Stock",
  "message": "'Sony WH-1000XM5 Wireless Headphones' is currently out of stock."
}
```

#### Error Response — Validation Error (`400 Bad Request`)
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid inventory check request.",
  "details": {
    "quantity": ["Ensure this value is greater than or equal to 1."]
  }
}
```

---

## 4. Metadata Endpoints

### `GET /api/brands/`
Returns a list of all distinct brand names currently present in the catalog.
```json
[
  "Anker",
  "Apple",
  "Bose",
  "Dell",
  "Logitech",
  "Samsung",
  "Sony"
]
```

### `GET /api/categories/`
Returns a list of all distinct category names currently present in the catalog.
```json
[
  "Accessories",
  "Audio",
  "Electronics",
  "Wearables"
]
```
