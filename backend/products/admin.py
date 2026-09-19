from django.contrib import admin
from .models import Product
from .services import get_stock_status, calculate_discount_percentage


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "sku",
        "name",
        "brand",
        "category",
        "mrp",
        "selling_price",
        "discount_badge",
        "stock",
        "stock_status_badge",
        "updated_at",
    )
    list_filter = ("brand", "category", "created_at")
    search_fields = ("sku", "name", "brand", "category", "barcode")
    readonly_fields = ("created_at", "updated_at")
    list_editable = ("selling_price", "stock")

    def discount_badge(self, obj):
        disc = calculate_discount_percentage(obj.mrp, obj.selling_price)
        return f"{disc}%"
    discount_badge.short_description = "Discount"

    def stock_status_badge(self, obj):
        status, _ = get_stock_status(obj.stock)
        return status
    stock_status_badge.short_description = "Stock Status"
