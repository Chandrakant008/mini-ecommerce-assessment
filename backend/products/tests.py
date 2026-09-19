from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from products.models import Product
from products.services import (
    get_stock_status,
    calculate_discount_percentage,
    validate_inventory_purchase,
)
from products.validators import validate_product_data


class StockRulesAndServicesTestCase(TestCase):
    """
    Test suite for inventory rules, stock status strings, and discount calculations.
    """
    def test_stock_status_zero(self):
        status_text, can_purchase = get_stock_status(0)
        self.assertEqual(status_text, "Out of Stock")
        self.assertFalse(can_purchase)

    def test_stock_status_negative(self):
        status_text, can_purchase = get_stock_status(-5)
        self.assertEqual(status_text, "Out of Stock")
        self.assertFalse(can_purchase)

    def test_stock_status_one(self):
        status_text, can_purchase = get_stock_status(1)
        self.assertEqual(status_text, "Only Few Left")
        self.assertTrue(can_purchase)

    def test_stock_status_two(self):
        status_text, can_purchase = get_stock_status(2)
        self.assertEqual(status_text, "Only Few Left")
        self.assertTrue(can_purchase)

    def test_stock_status_three_or_more(self):
        status_text, can_purchase = get_stock_status(3)
        self.assertEqual(status_text, "In Stock")
        self.assertTrue(can_purchase)

        status_text_10, can_purchase_10 = get_stock_status(10)
        self.assertEqual(status_text_10, "In Stock")
        self.assertTrue(can_purchase_10)

    def test_discount_calculation_normal(self):
        # MRP = 1000, Selling Price = 800 => 20%
        disc = calculate_discount_percentage(Decimal("1000.00"), Decimal("800.00"))
        self.assertEqual(disc, 20.0)

    def test_discount_calculation_zero_or_negative_mrp(self):
        disc = calculate_discount_percentage(Decimal("0.00"), Decimal("500.00"))
        self.assertEqual(disc, 0.0)
        disc_neg = calculate_discount_percentage(Decimal("-100.00"), Decimal("50.00"))
        self.assertEqual(disc_neg, 0.0)

    def test_discount_calculation_selling_price_ge_mrp(self):
        disc = calculate_discount_percentage(Decimal("1000.00"), Decimal("1000.00"))
        self.assertEqual(disc, 0.0)
        disc_over = calculate_discount_percentage(Decimal("1000.00"), Decimal("1200.00"))
        self.assertEqual(disc_over, 0.0)


class ProductValidationTestCase(TestCase):
    """
    Test independent row validation according to assessment requirements.
    """
    def test_valid_product(self):
        raw = {
            "sku": "VAL-01",
            "name": "Super Phone",
            "brand": "TechCorp",
            "category": "Electronics",
            "mrp": "1000.00",
            "selling_price": "800.00",
            "stock": 5,
        }
        is_valid, err, sanitized = validate_product_data(raw)
        self.assertTrue(is_valid)
        self.assertIsNone(err)
        self.assertEqual(sanitized["sku"], "VAL-01")

    def test_missing_product_name(self):
        raw = {
            "sku": "VAL-02",
            "name": "",
            "category": "Electronics",
            "mrp": "1000.00",
            "selling_price": "800.00",
        }
        is_valid, err, _ = validate_product_data(raw)
        self.assertFalse(is_valid)
        self.assertIn("Missing product name", err)

    def test_missing_selling_price(self):
        raw = {
            "sku": "VAL-03",
            "name": "Super Phone",
            "category": "Electronics",
            "mrp": "1000.00",
            "selling_price": "",
        }
        is_valid, err, _ = validate_product_data(raw)
        self.assertFalse(is_valid)
        self.assertIn("Missing selling price", err)

    def test_selling_price_greater_than_mrp(self):
        raw = {
            "sku": "VAL-04",
            "name": "Super Phone",
            "category": "Electronics",
            "mrp": "500.00",
            "selling_price": "800.00",
        }
        is_valid, err, _ = validate_product_data(raw)
        self.assertFalse(is_valid)
        self.assertIn("cannot be greater than MRP", err)

    def test_negative_inventory(self):
        raw = {
            "sku": "VAL-05",
            "name": "Super Phone",
            "category": "Electronics",
            "mrp": "1000.00",
            "selling_price": "800.00",
            "stock": -4,
        }
        is_valid, err, _ = validate_product_data(raw)
        self.assertFalse(is_valid)
        self.assertIn("Negative inventory", err)

    def test_missing_category(self):
        raw = {
            "sku": "VAL-06",
            "name": "Super Phone",
            "category": "",
            "mrp": "1000.00",
            "selling_price": "800.00",
        }
        is_valid, err, _ = validate_product_data(raw)
        self.assertFalse(is_valid)
        self.assertIn("Missing category", err)

    def test_duplicate_sku(self):
        existing = {"DUP-01", "DUP-02"}
        raw = {
            "sku": "DUP-01",
            "name": "Duplicate Phone",
            "category": "Electronics",
            "mrp": "1000.00",
            "selling_price": "800.00",
        }
        is_valid, err, _ = validate_product_data(raw, existing_skus=existing)
        self.assertFalse(is_valid)
        self.assertIn("Duplicate SKU", err)


class ProductAPITestCase(TestCase):
    """
    Test REST APIs for listing, detail, filtering, searching, and sorting.
    """
    def setUp(self):
        self.client = APIClient()
        self.p1 = Product.objects.create(
            sku="SKU-001",
            name="Apple iPhone 15 Pro",
            brand="Apple",
            category="Electronics",
            mrp=Decimal("130000.00"),
            selling_price=Decimal("120000.00"),
            stock=2,
        )
        self.p2 = Product.objects.create(
            sku="SKU-002",
            name="Sony WH-1000XM5",
            brand="Sony",
            category="Audio",
            mrp=Decimal("35000.00"),
            selling_price=Decimal("29000.00"),
            stock=0,
        )
        self.p3 = Product.objects.create(
            sku="SKU-003",
            name="Apple Watch Ultra",
            brand="Apple",
            category="Wearables",
            mrp=Decimal("89000.00"),
            selling_price=Decimal("79000.00"),
            stock=5,
        )

    def test_get_product_list(self):
        response = self.client.get(reverse("product-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_search_products(self):
        response = self.client.get(reverse("product-list") + "?search=Sony")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["sku"], "SKU-002")

    def test_filter_by_brand(self):
        response = self.client.get(reverse("product-list") + "?brand=Apple")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_filter_by_category(self):
        response = self.client.get(reverse("product-list") + "?category=Audio")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Sony WH-1000XM5")

    def test_sort_by_price_ascending(self):
        response = self.client.get(reverse("product-list") + "?ordering=price_asc")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        prices = [float(p["selling_price"]) for p in response.data]
        self.assertEqual(prices, sorted(prices))

    def test_sort_by_price_descending(self):
        response = self.client.get(reverse("product-list") + "?ordering=price_desc")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        prices = [float(p["selling_price"]) for p in response.data]
        self.assertEqual(prices, sorted(prices, reverse=True))

    def test_combined_search_filter_sort(self):
        response = self.client.get(
            reverse("product-list") + "?search=Apple&category=Electronics&ordering=price_asc"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["sku"], "SKU-001")

    def test_get_product_detail_success(self):
        response = self.client.get(reverse("product-detail", kwargs={"pk": self.p1.id}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Apple iPhone 15 Pro")
        self.assertEqual(response.data["stock_status"], "Only Few Left")
        self.assertTrue(response.data["can_purchase"])

    def test_get_product_detail_not_found(self):
        response = self.client.get(reverse("product-detail", kwargs={"pk": 99999}))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "PRODUCT_NOT_FOUND")

    def test_inventory_check_allowed(self):
        payload = {"product_id": self.p1.id, "quantity": 2}
        response = self.client.post(reverse("inventory-check"), payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["can_purchase"])
        self.assertEqual(response.data["available_stock"], 2)

    def test_inventory_check_exceeding_stock(self):
        payload = {"product_id": self.p1.id, "quantity": 3}
        response = self.client.post(reverse("inventory-check"), payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["can_purchase"])
        self.assertIn("exceeds available stock", response.data["message"])

    def test_inventory_check_out_of_stock(self):
        payload = {"product_id": self.p2.id, "quantity": 1}
        response = self.client.post(reverse("inventory-check"), payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["can_purchase"])
        self.assertIn("out of stock", response.data["message"].lower())

    def test_brands_and_categories_endpoints(self):
        brand_res = self.client.get(reverse("brand-list"))
        self.assertEqual(brand_res.status_code, status.HTTP_200_OK)
        self.assertIn("Apple", brand_res.data)
        self.assertIn("Sony", brand_res.data)

        cat_res = self.client.get(reverse("category-list"))
        self.assertEqual(cat_res.status_code, status.HTTP_200_OK)
        self.assertIn("Electronics", cat_res.data)
        self.assertIn("Audio", cat_res.data)
