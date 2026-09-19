import csv
import json
import os
from django.core.management.base import BaseCommand
from products.models import Product
from products.validators import validate_product_data


class Command(BaseCommand):
    help = "Import products from a CSV file with independent row validation and comprehensive error summary."

    def add_arguments(self, parser):
        parser.add_argument("file_path", type=str, help="Path to the products CSV file")
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear existing products table before importing"
        )

    def handle(self, *args, **options):
        file_path = options["file_path"]
        clear = options["clear"]

        if not os.path.exists(file_path):
            self.stderr.write(self.style.ERROR(f"Error: File not found at '{file_path}'"))
            return

        if clear:
            deleted_count, _ = Product.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"Cleared {deleted_count} existing product records."))

        self.stdout.write(self.style.NOTICE(f"Starting product import from: {file_path}"))

        total_rows = 0
        imported_count = 0
        skipped_count = 0
        errors = []

        # Track existing SKUs in database and in current file to detect duplicates accurately
        existing_skus = set(Product.objects.values_list("sku", flat=True))

        try:
            with open(file_path, mode="r", encoding="utf-8-sig") as csvfile:
                reader = csv.DictReader(csvfile)
                
                # Normalize column headers (strip whitespace and lowercase)
                if not reader.fieldnames:
                    self.stderr.write(self.style.ERROR("Error: CSV file contains no headers or data."))
                    return

                for row_idx, raw_row in enumerate(reader, start=2):  # Row 1 is header
                    total_rows += 1
                    
                    # Normalize row keys
                    normalized_row = {
                        k.strip().lower().replace(" ", "_"): v.strip() if isinstance(v, str) else v
                        for k, v in raw_row.items()
                        if k is not None
                    }

                    # Parse specifications JSON or key:value format if present
                    specs_raw = normalized_row.get("specifications", "")
                    specs_dict = {}
                    if specs_raw:
                        if specs_raw.startswith("{") and specs_raw.endswith("}"):
                            try:
                                specs_dict = json.loads(specs_raw)
                            except Exception:
                                specs_dict = {"raw": specs_raw}
                        else:
                            # Format: "Color: Black; RAM: 16GB; Storage: 512GB"
                            pairs = [p.strip() for p in specs_raw.split(";") if ":" in p]
                            for pair in pairs:
                                k, v = pair.split(":", 1)
                                specs_dict[k.strip()] = v.strip()

                    validation_payload = {
                        "sku": normalized_row.get("sku", ""),
                        "barcode": normalized_row.get("barcode", ""),
                        "name": normalized_row.get("product_name") or normalized_row.get("name", ""),
                        "brand": normalized_row.get("brand", ""),
                        "category": normalized_row.get("category", ""),
                        "subcategory": normalized_row.get("subcategory", ""),
                        "mrp": normalized_row.get("mrp"),
                        "selling_price": normalized_row.get("selling_price"),
                        "stock": normalized_row.get("stock", 0),
                        "image": normalized_row.get("product_image") or normalized_row.get("image", ""),
                        "specifications": specs_dict,
                    }

                    is_valid, error_reason, sanitized = validate_product_data(
                        validation_payload,
                        existing_skus=existing_skus
                    )

                    if not is_valid:
                        skipped_count += 1
                        error_entry = f"Row {row_idx} - {error_reason}"
                        errors.append(error_entry)
                        self.stderr.write(self.style.WARNING(f"  [SKIPPED] {error_entry}"))
                        continue

                    # Create Product
                    try:
                        Product.objects.create(
                            sku=sanitized["sku"],
                            barcode=sanitized["barcode"],
                            name=sanitized["name"],
                            brand=sanitized["brand"],
                            category=sanitized["category"],
                            subcategory=sanitized["subcategory"],
                            mrp=sanitized["mrp"],
                            selling_price=sanitized["selling_price"],
                            stock=sanitized["stock"],
                            image=sanitized["image"],
                            specifications=sanitized["specifications"],
                        )
                        existing_skus.add(sanitized["sku"])
                        imported_count += 1
                    except Exception as exc:
                        skipped_count += 1
                        error_entry = f"Row {row_idx} - Database save error: {str(exc)}"
                        errors.append(error_entry)
                        self.stderr.write(self.style.ERROR(f"  [ERROR] {error_entry}"))

        except Exception as file_exc:
            self.stderr.write(self.style.ERROR(f"Failed to process CSV file: {str(file_exc)}"))
            return

        # Print final import summary matching specification Section 18
        self.stdout.write("\n" + "=" * 45)
        self.stdout.write(self.style.SUCCESS("PRODUCT IMPORT SUMMARY"))
        self.stdout.write("=" * 45)
        self.stdout.write(f"Total records processed : {total_rows}")
        self.stdout.write(self.style.SUCCESS(f"Successfully imported    : {imported_count}"))
        if skipped_count > 0:
            self.stdout.write(self.style.WARNING(f"Skipped invalid records  : {skipped_count}"))
            self.stdout.write("\nValidation Errors Encountered:")
            for err in errors:
                self.stdout.write(self.style.WARNING(f"  • {err}"))
        else:
            self.stdout.write(self.style.SUCCESS("Skipped invalid records  : 0 (All records valid!)"))
        self.stdout.write("=" * 45 + "\n")
