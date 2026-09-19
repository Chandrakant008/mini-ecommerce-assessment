from django.urls import path
from .views import (
    ProductListView,
    ProductDetailView,
    InventoryCheckView,
    BrandListView,
    CategoryListView,
)

urlpatterns = [
    path("products/", ProductListView.as_view(), name="product-list"),
    path("products/<int:pk>/", ProductDetailView.as_view(), name="product-detail"),
    path("inventory/check/", InventoryCheckView.as_view(), name="inventory-check"),
    path("brands/", BrandListView.as_view(), name="brand-list"),
    path("categories/", CategoryListView.as_view(), name="category-list"),
]
