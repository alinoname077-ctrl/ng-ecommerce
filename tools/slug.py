from slugify import slugify

def make_slug(article: str, name: str) -> str:
    clean = name.replace("Ридан", "").replace(article, "").strip(" —-")
    return slugify(f"{article} {clean}")