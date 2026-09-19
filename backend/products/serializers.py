from rest_framework import serializers
from .models import Product
from .services import get_stock_status, calculate_discount_percentage


class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer for Product list and detail views.
    Includes dynamically computed ecommerce fields:
    - discount_percentage
    - stock_status
    - can_purchase
    """
    discount_percentage = serializers.SerializerMethodField()
    stock_status = serializers.SerializerMethodField()
    can_purchase = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "sku",
            "barcode",
            "name",
            "brand",
            "category",
            "subcategory",
            "mrp",
            "selling_price",
            "discount_percentage",
            "stock",
            "stock_status",
            "can_purchase",
            "image",
            "specifications",
            "created_at",
            "updated_at",
        ]

    def get_discount_percentage(self, obj) -> float:
        return calculate_discount_percentage(obj.mrp, obj.selling_price)

    def get_stock_status(self, obj) -> str:
        status, _ = get_stock_status(obj.stock)
        return status

    def get_can_purchase(self, obj) -> bool:
        _, can_purchase = get_stock_status(obj.stock)
        return can_purchase


class InventoryCheckRequestSerializer(serializers.Serializer):
    """
    Validates payload for POST /api/inventory/check/
    """
    product_id = serializers.IntegerField(required=True, min_value=1)
    quantity = serializers.IntegerField(required=True, min_value=1)


class InventoryCheckResponseSerializer(serializers.Serializer):
    """
    Authoritative response schema for inventory checks.
    """
    product_id = serializers.IntegerField()
    requested_quantity = serializers.IntegerField()
    available_stock = serializers.IntegerField()
    can_purchase = serializers.BooleanField()
    stock_status = serializers.CharField()
    message = serializers.CharField()
