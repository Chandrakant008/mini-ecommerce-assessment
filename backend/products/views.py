from django.db.models import Q
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Product
from .serializers import (
    ProductSerializer,
    InventoryCheckRequestSerializer,
    InventoryCheckResponseSerializer,
)
from .services import validate_inventory_purchase


class ProductListView(APIView):
    """
    GET /api/products/
    Returns list of products with support for:
      - search (query across name, brand, category, sku)
      - brand (filter by brand)
      - category (filter by category)
      - ordering (price_asc, price_desc, newest)
    All query parameters are combinable.
    """
    def get(self, request):
        queryset = Product.objects.all()

        # 1. Search filter
        search_query = request.query_params.get("search", "").strip()
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query)
                | Q(brand__icontains=search_query)
                | Q(category__icontains=search_query)
                | Q(sku__icontains=search_query)
                | Q(subcategory__icontains=search_query)
            )

        # 2. Brand filter
        brand = request.query_params.get("brand", "").strip()
        if brand and brand.lower() != "all" and brand.lower() != "all brands":
            queryset = queryset.filter(brand__iexact=brand)

        # 3. Category filter
        category = request.query_params.get("category", "").strip()
        if category and category.lower() != "all" and category.lower() != "all categories":
            queryset = queryset.filter(category__iexact=category)

        # 4. Sorting / Ordering
        ordering = request.query_params.get("ordering", "").strip().lower()
        if ordering in ("price_asc", "price_low_to_high", "price"):
            queryset = queryset.order_by("selling_price")
        elif ordering in ("price_desc", "price_high_to_low", "-price"):
            queryset = queryset.order_by("-selling_price")
        elif ordering in ("name_asc", "name"):
            queryset = queryset.order_by("name")
        else:
            # Default ordering
            queryset = queryset.order_by("-created_at")

        serializer = ProductSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProductDetailView(APIView):
    """
    GET /api/products/<int:pk>/
    Returns product details or 404 JSON.
    """
    def get(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response(
                {
                    "error": "PRODUCT_NOT_FOUND",
                    "message": f"Product with ID {pk} does not exist."
                },
                status=status.HTTP_404_NOT_FOUND
            )
        except (ValueError, TypeError):
            return Response(
                {
                    "error": "INVALID_ID",
                    "message": "Invalid product ID provided."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)


class InventoryCheckView(APIView):
    """
    POST /api/inventory/check/
    Authoritative real-time inventory validation endpoint.
    Payload: { "product_id": int, "quantity": int }
    """
    def post(self, request):
        serializer = InventoryCheckRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "error": "VALIDATION_ERROR",
                    "message": "Invalid inventory check request.",
                    "details": serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        product_id = serializer.validated_data["product_id"]
        quantity = serializer.validated_data["quantity"]

        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response(
                {
                    "error": "PRODUCT_NOT_FOUND",
                    "message": f"Product with ID {product_id} was not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        check_result = validate_inventory_purchase(product, quantity)
        response_serializer = InventoryCheckResponseSerializer(check_result)
        return Response(response_serializer.data, status=status.HTTP_200_OK)


class BrandListView(APIView):
    """
    GET /api/brands/
    Returns list of available brands for filter dropdown.
    """
    def get(self, request):
        brands = (
            Product.objects.exclude(brand="")
            .values_list("brand", flat=True)
            .distinct()
            .order_by("brand")
        )
        return Response(list(brands), status=status.HTTP_200_OK)


class CategoryListView(APIView):
    """
    GET /api/categories/
    Returns list of available categories for filter dropdown.
    """
    def get(self, request):
        categories = (
            Product.objects.exclude(category="")
            .values_list("category", flat=True)
            .distinct()
            .order_by("category")
        )
        return Response(list(categories), status=status.HTTP_200_OK)
