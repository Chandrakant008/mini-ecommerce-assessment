from decimal import Decimal
from typing import Dict, Any, Tuple


def get_stock_status(stock: int) -> Tuple[str, bool]:
    """
    Centralized stock status logic.
    Returns a tuple of (display_status: str, can_purchase: bool).
    
    Rules:
      - Stock <= 0: ("Out of Stock", False)
      - Stock == 1 or Stock == 2: ("Only Few Left", True)
      - Stock >= 3: ("In Stock", True)
    """
    if stock <= 0:
        return "Out of Stock", False
    elif stock in (1, 2):
        return "Only Few Left", True
    else:
        return "In Stock", True


def calculate_discount_percentage(mrp: Decimal, selling_price: Decimal) -> float:
    """
    Calculate discount percentage safely:
    discount_percentage = ((MRP - selling_price) / MRP) * 100
    
    Handles MRP <= 0, None, or selling_price > MRP gracefully.
    """
    try:
        mrp_dec = Decimal(str(mrp)) if mrp is not None else Decimal("0")
        sp_dec = Decimal(str(selling_price)) if selling_price is not None else Decimal("0")
        
        if mrp_dec <= Decimal("0"):
            return 0.0
        if sp_dec >= mrp_dec:
            return 0.0
        
        discount = ((mrp_dec - sp_dec) / mrp_dec) * Decimal("100")
        return round(float(discount), 1)
    except Exception:
        return 0.0


def validate_inventory_purchase(product, requested_quantity: int) -> Dict[str, Any]:
    """
    Authoritative backend inventory check service.
    Validates if requested quantity can be fulfilled against available product stock.
    """
    if requested_quantity <= 0:
        return {
            "product_id": product.id,
            "requested_quantity": requested_quantity,
            "available_stock": product.stock,
            "can_purchase": False,
            "stock_status": get_stock_status(product.stock)[0],
            "message": "Requested quantity must be at least 1."
        }
        
    stock_status, can_purchase_base = get_stock_status(product.stock)
    
    if not can_purchase_base or product.stock <= 0:
        return {
            "product_id": product.id,
            "requested_quantity": requested_quantity,
            "available_stock": product.stock,
            "can_purchase": False,
            "stock_status": "Out of Stock",
            "message": f"'{product.name}' is currently out of stock."
        }
        
    if requested_quantity > product.stock:
        return {
            "product_id": product.id,
            "requested_quantity": requested_quantity,
            "available_stock": product.stock,
            "can_purchase": False,
            "stock_status": stock_status,
            "message": f"Requested quantity ({requested_quantity}) exceeds available stock ({product.stock})."
        }
        
    return {
        "product_id": product.id,
        "requested_quantity": requested_quantity,
        "available_stock": product.stock,
        "can_purchase": True,
        "stock_status": stock_status,
        "message": "Inventory check successful."
    }
