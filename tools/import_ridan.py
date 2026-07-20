import json

from config import OUTPUT_JSON, CATALOG_DIR
from excel_reader import read_catalog
from slug import make_slug


def main():

    products = read_catalog(CATALOG_DIR)

    print("\nУдаляем дубликаты...")

    unique = {}

    for product in products:
        article = product["article"]

        if article not in unique:
            unique[article] = product

    print(f"Уникальных товаров: {len(unique)}")


    result = []


    for product in unique.values():

        article = product["article"]

        item = {
            "id": article,
            "slug": make_slug(
                article,
                product["name"]
            ),

            "name": product["name"],

            "description": product.get(
                "description",
                ""
            ),

            "price": float(
                product["price"]
            ) if product.get("price") else 0,


            "imageUrl": product.get(
                "imageUrl",
                ""
            ),


            "rating": 0,

            "reviewCount": 0,

            "inStock": True,


            "category": product.get(
                "category",
                ""
            ),

            "subcategory": product.get(
                "subcategory",
                ""
            ),

            "series": product.get(
                "series",
                ""
            ),


            "reviews": [],
        }


        result.append(item)



    OUTPUT_JSON.parent.mkdir(
        parents=True,
        exist_ok=True
    )


    with open(
        OUTPUT_JSON,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            result,
            file,
            ensure_ascii=False,
            indent=2
        )


    print()
    print("===================================")
    print("Импорт завершён успешно!")
    print(f"Сохранено товаров: {len(result)}")
    print(f"Файл: {OUTPUT_JSON}")
    print("===================================")



if __name__ == "__main__":
    main()