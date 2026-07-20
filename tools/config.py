from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

CATALOG_DIR = ROOT / "catalog"

OUTPUT_JSON = ROOT / "public" / "data" / "products.json"

CATEGORY_MAP = {
    "Коттеджная автоматика": "cottage-automation",
    "Тепловая автоматика": "heating-automation",
    "Промышленная автоматика": "industrial-automation",
    "Насосное оборудование": "pumps",
    "Холодильная техника": "refrigeration",
    "Приводная техника": "drives",
    "Теплый пол и снеготаяние": "underfloor-heating",
}