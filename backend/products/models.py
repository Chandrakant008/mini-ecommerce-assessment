from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class Product(models.Model):
    """
    Product model storing catalog items and current stock inventory.
    """
    sku = models.CharField(
        max_length=64,
        unique=True,
        db_index=True,
        help_text="Unique Stock Keeping Unit identifier"
    )
    barcode = models.CharField(
        max_length=64,
        blank=True,
        default="",
        help_text="Barcode / EAN identifier"
    )
    name = models.CharField(
        max_length=255,
        db_index=True,
        help_text="Full product title"
    )
    brand = models.CharField(
        max_length=128,
        db_index=True,
        help_text="Brand name"
    )
    category = models.CharField(
        max_length=128,
        db_index=True,
        help_text="Primary category name"
    )
    subcategory = models.CharField(
        max_length=128,
        blank=True,
        default="",
        help_text="Secondary category or product type"
    )
    mrp = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
        help_text="Maximum Retail Price"
    )
    selling_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
        help_text="Current effective customer selling price"
    )
    stock = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Current available inventory quantity"
    )
    image = models.TextField(
        blank=True,
        default="",
        help_text="Product image URL or relative path"
    )
    specifications = models.JSONField(
        default=dict,
        blank=True,
        help_text="Key-value specifications object"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["brand", "category"]),
            models.Index(fields=["selling_price"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.sku}) - Stock: {self.stock}"
