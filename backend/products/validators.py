from decimal import Decimal, InvalidOperation
from typing import Dict, Any, Tuple, Optional


def validate_product_data(data: Dict[str, Any], existing_skus: Optional[set] = None) -> Tuple[bool, Optional[str], Optional[Dict[str, Any]]]:
    """
    Validates a raw product dictionary (e.g. from CSV or API).
    Returns (is_valid: bool, error_message: Optional[str], sanitized_data: Optional[dict]).
    
    Validation Rules:
      1. SKU is required and must not be empty.
      2. SKU must be unique (checked against existing_skus set or DB).
      3. Product Name is required and must not be empty.
      4. Category is required and must not be empty.
      5. MRP must be a valid non-negative number.
      6. Selling Price is required, must be a valid non-negative number.
      7. Selling Price cannot be greater than MRP.
      8. Stock must be a valid integer and >= 0 (no negative inventory).
    """
    sku = str(data.get("sku", "")).strip()
    if not sku:
        return False, "Missing SKU", None

    if existing_skus is not None and sku in existing_skus:
        return False, f"Duplicate SKU '{sku}'", None

    name = str(data.get("name", "")).strip()
    if not name:
        return False, "Missing product name", None

    category = str(data.get("category", "")).strip()
    if not category:
        return False, "Missing category", None

    brand = str(data.get("brand", "")).strip()
    if not brand:
        brand = "Generic"

    # Validate MRP
    raw_mrp = data.get("mrp")
    try:
        if raw_mrp is None or str(raw_mrp).strip() == "":
            return False, "Missing MRP", None
        mrp = Decimal(str(raw_mrp).strip())
        if mrp < Decimal("0"):
            return False, f"MRP cannot be negative ({mrp})", None
    except (InvalidOperation, ValueError, TypeError):
        return False, f"Invalid MRP value '{raw_mrp}'", None

    # Validate Selling Price
    raw_sp = data.get("selling_price")
    try:
        if raw_sp is None or str(raw_sp).strip() == "":
            return False, "Missing selling price", None
        selling_price = Decimal(str(raw_sp).strip())
        if selling_price < Decimal("0"):
            return False, f"Selling price cannot be negative ({selling_price})", None
    except (InvalidOperation, ValueError, TypeError):
        return False, f"Invalid selling price value '{raw_sp}'", None

    # Check Selling Price <= MRP
    if selling_price > mrp:
        return False, f"Selling price ({selling_price}) cannot be greater than MRP ({mrp})", None

    # Validate Stock
    raw_stock = data.get("stock", 0)
    try:
        if raw_stock is None or str(raw_stock).strip() == "":
            stock = 0
        else:
            stock = int(raw_stock)
        if stock < 0:
            return False, f"Negative inventory is not allowed ({stock})", None
    except (ValueError, TypeError):
        return False, f"Invalid stock value '{raw_stock}'", None

    sanitized = {
        "sku": sku,
        "barcode": str(data.get("barcode", "")).strip(),
        "name": name,
        "brand": brand,
        "category": category,
        "subcategory": str(data.get("subcategory", "")).strip(),
        "mrp": mrp,
        "selling_price": selling_price,
        "stock": stock,
        "image": str(data.get("image", "")).strip(),
        "specifications": data.get("specifications", {}) if isinstance(data.get("specifications"), dict) else {},
    }

    return True, None, sanitized
