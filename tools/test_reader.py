from config import CATALOG_DIR
from excel_reader import read_catalog

products = read_catalog(CATALOG_DIR)

print()
print(products[:5])