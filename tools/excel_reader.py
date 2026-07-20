from pathlib import Path
import json
import re
import pandas as pd


# ==========================
# Вспомогательные функции
# ==========================

def normalize(value) -> str:
    if pd.isna(value):
        return ""

    return str(value).strip()


def get_value(row, *columns):
    for col in columns:
        if col in row:
            value = normalize(row[col])

            if value:
                return value

    return ""


def slugify(text: str) -> str:

    text = normalize(text).lower()

    table = {
        "а": "a", "б": "b", "в": "v", "г": "g", "д": "d",
        "е": "e", "ё": "e", "ж": "zh", "з": "z", "и": "i",
        "й": "y", "к": "k", "л": "l", "м": "m", "н": "n",
        "о": "o", "п": "p", "р": "r", "с": "s", "т": "t",
        "у": "u", "ф": "f", "х": "h", "ц": "c", "ч": "ch",
        "ш": "sh", "щ": "sch", "ъ": "", "ы": "y", "ь": "",
        "э": "e", "ю": "yu", "я": "ya"
    }

    text = "".join(
        table.get(c, c)
        for c in text
    )

    text = re.sub(
        r"[^a-z0-9]+",
        "-",
        text
    )

    return text.strip("-")


# ==========================
# Фото
# ==========================

def read_images(file: Path, excel) -> dict:

    images = {}

    if "Фото и документы" not in excel.sheet_names:
        return images


    photo_df = pd.read_excel(
        file,
        sheet_name="Фото и документы"
    )


    photo_df.columns = [
        str(c).strip()
        for c in photo_df.columns
    ]


    print(
        "Колонки фото:",
        list(photo_df.columns)
    )


    for _, row in photo_df.iterrows():

        article = get_value(
            row,
            "Материал",
            "Артикул",
            "Код"
        )


        if not article:
            continue


        for col in photo_df.columns:

            value = normalize(
                row[col]
            )


            if (
                value.startswith("http")
                and any(
                    ext in value.lower()
                    for ext in [
                        ".jpg",
                        ".jpeg",
                        ".png",
                        ".webp"
                    ]
                )
            ):

                images[article] = value
                break


    return images



# ==========================
# Один Excel файл
# ==========================

def read_excel(file: Path) -> list[dict]:

    print(
        f"\n📖 Читаю {file.name}"
    )


    excel = pd.ExcelFile(file)


    print(
        "Листы:",
        excel.sheet_names
    )


    if "Каталог" not in excel.sheet_names:

        raise Exception(
            "Лист 'Каталог' не найден"
        )


    catalog = pd.read_excel(
        file,
        sheet_name="Каталог"
    )


    catalog.columns = [
        str(c).strip()
        for c in catalog.columns
    ]


    catalog = catalog.dropna(
        how="all"
    )


    images = read_images(
        file,
        excel
    )


    print(
        f"📷 Найдено фото: {len(images)}"
    )


    print(
        "Колонки каталога:"
    )

    print(
        list(catalog.columns)
    )


    products = []
    categories = set()


    for _, row in catalog.iterrows():


        article = get_value(
            row,
            "Материал",
            "Артикул",
            "Код"
        )


        name = get_value(
            row,
            "Название из каталога",
            "Название",
            "Наименование"
        )


        if not article or not name:
            continue



        category = get_value(
            row,
            "Категория"
        )


        subcategory = get_value(
            row,
            "Подкатегория"
        )


        series = get_value(
            row,
            "Серия"
        )


        description = get_value(
            row,
            "Описание"
        )


        price = row.get(
            "Цена, без НДС",
            0
        )


        if pd.isna(price):

            price = 0


        try:

            price = float(price)

        except Exception:

            price = 0



        category_slug = slugify(
            category
        )


        subcategory_slug = slugify(
            subcategory
        )


        slug = slugify(
            f"{article}-{name}"
        )


        if category:

            categories.add(
                category
            )


        product = {

            "id": article,

            "slug": slug,


            "name": name,

            "description": description,


            "category": category,

            "categorySlug": category_slug,


            "subcategory": subcategory,

            "subcategorySlug": subcategory_slug,


            "series": series,

"price": 0,
"currency": "KZT",
"priceOnRequest": True,


            "imageUrl": images.get(
                article,
                ""
            )
        }


        products.append(
            product
        )


    print(
        f"\n✅ Найдено товаров: {len(products)}"
    )


    without_images = [
        p
        for p in products
        if not p["imageUrl"]
    ]


    print(
        f"🖼 Без фото: {len(without_images)}"
    )


    print(
        "\nКатегории:"
    )


    for c in sorted(categories):

        print(
            " -",
            c
        )


    return products



# ==========================
# Все Excel
# ==========================

def read_catalog(folder: Path) -> list[dict]:

    all_products = []


    for file in sorted(
        folder.glob("*.xlsx")
    ):


        try:

            all_products.extend(
                read_excel(file)
            )


        except Exception as e:

            print(
                f"❌ {file.name}: {e}"
            )



    print(
        "\n==================================="
    )

    print(
        f"Всего товаров: {len(all_products)}"
    )

    print(
        "===================================\n"
    )


    return all_products



# ==========================
# Сохранение JSON
# ==========================

def save_products(
    products,
    output: Path
):

    output.parent.mkdir(
        parents=True,
        exist_ok=True
    )


    with open(
        output,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            products,
            f,
            ensure_ascii=False,
            indent=2
        )


    print(
        f"💾 Сохранено: {output}"
    )



# ==========================
# Запуск
# ==========================

if __name__ == "__main__":

    BASE_DIR = Path(__file__).resolve().parent.parent

    excel_folder = BASE_DIR / "catalog"

    output_file = BASE_DIR / "public/data/products.json"


    products = read_catalog(
        excel_folder
    )


    save_products(
        products,
        output_file
    )