#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
يولّد قوائم الكلمات المفتاحية البذرية من كتالوج عالطاير الحقيقي
(tools/mood-studio/perfumes.json + تصنيفات سلة) بصيغة جاهزة للصق في Semrush.

المخرجات في tools/semrush/out/:
  01_head_seeds.txt        -> بذور Keyword Magic Tool (شغّلها أولاً)
  02_brands_bulk_*.txt     -> دفعات 100 كلمة لـ Keyword Overview (Bulk)
  03_products_bulk_*.txt   -> دفعات 100 كلمة لأهم المنتجات
  04_dupes_bulk_*.txt      -> "شبيه/بديل" وهي أعلى نية شرائية في السوق السعودي
  catalog_index.csv        -> فهرس الكتالوج لمطابقة نتائج Semrush لاحقاً
"""
import json, csv, os, re, sys, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CATALOG = os.path.join(ROOT, "mood-studio", "perfumes.json")
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")
BATCH = 100  # سقف Semrush لـ Keyword Overview (Bulk)

# بذور رأس السوق — مشتقة من تصنيفات المتجر الفعلية في سلة
HEAD_SEEDS = [
    "عطور رجالية", "عطور نسائية", "عطور نيش", "عطور للجنسين",
    "عينات عطور", "تقسيمات عطور", "تسترات عطور", "عطور اصلية",
    "متجر عطور", "عطور فخمة", "عطور ثابتة", "اقوى عطر فوحان",
    "افضل عطر رجالي", "افضل عطر نسائي", "عطور الدوام", "عطور المناسبات",
    "عطور صيفية", "عطور شتوية", "عطر عود", "عطر مسك",
    "عطور هدايا", "عطر شعر", "عطور ديزاينر", "شبيه عطر",
    "عطور رخيصة وثابتة", "عطر يسألون عنه",
]

# لواحق النية الشرائية — تفصل الباحث المشتري عن الباحث المتفرّج
BUY_SUFFIXES = ["سعر", "اصلي", "السعودية", "تستر", "عينة"]
DUPE_PREFIXES = ["شبيه", "بديل", "زي"]

AR_DIAC = re.compile(r"[\u064B-\u065F\u0670\u0640\u06D6-\u06ED]")

def norm_ar(s):
    """تطبيع عربي خفيف: حذف التشكيل وتوحيد الألف/الياء/التاء المربوطة."""
    if not s:
        return ""
    s = unicodedata.normalize("NFKC", str(s))
    s = AR_DIAC.sub("", s)
    s = s.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا")
    s = s.replace("ى", "ي").replace("ة", "ه")
    return re.sub(r"\s+", " ", s).strip()

def load():
    with open(CATALOG, encoding="utf-8") as f:
        d = json.load(f)
    return d.get("ba", {}), d.get("p", [])

def dedupe(seq):
    seen, out = set(), []
    for x in seq:
        k = norm_ar(x)
        if k and k not in seen:
            seen.add(k)
            out.append(x)
    return out

def write_batches(name, keywords):
    """يقسّم القائمة إلى ملفات بحجم BATCH جاهزة للصق دفعة واحدة في Semrush."""
    paths = []
    for i in range(0, len(keywords), BATCH):
        chunk = keywords[i:i + BATCH]
        p = os.path.join(OUT, f"{name}_{i // BATCH + 1:02d}.txt")
        with open(p, "w", encoding="utf-8") as f:
            f.write("\n".join(chunk) + "\n")
        paths.append((p, len(chunk)))
    return paths

def main():
    brands, perfumes = load()
    os.makedirs(OUT, exist_ok=True)

    # --- 1. بذور الرأس ---
    with open(os.path.join(OUT, "01_head_seeds.txt"), "w", encoding="utf-8") as f:
        f.write("\n".join(HEAD_SEEDS) + "\n")

    # --- 2. الماركات: الاسم العربي + الإنجليزي + لاحقة سعر ---
    brand_kws = []
    for en, ar in brands.items():
        en = (en or "").strip()
        ar = (ar or "").strip()
        if ar:
            brand_kws += [f"عطر {ar}", f"عطور {ar}", f"{ar} سعر"]
        if en:
            brand_kws.append(f"{en} عطر")
    brand_kws = dedupe(brand_kws)
    b_paths = write_batches("02_brands_bulk", brand_kws)

    # --- 3. المنتجات: نرتّب بالتقييم ثم الثبات، لأن ميزانية Semrush محدودة ---
    def score(x):
        return (x.get("c") or 0) * 2 + (x.get("l") or 0) + (x.get("p") or 0)

    ranked = sorted(
        [x for x in perfumes if x.get("a") or x.get("n")],
        key=score, reverse=True,
    )

    prod_kws, dupe_kws, index_rows = [], [], []
    for rank, x in enumerate(ranked, 1):
        ar = (x.get("a") or "").strip()
        en = (x.get("n") or "").strip()
        brand = (x.get("b") or "").strip()
        label = ar or en
        if not label:
            continue
        index_rows.append({
            "rank": rank,
            "brand": brand,
            "brand_ar": brands.get(brand, ""),
            "name_en": en,
            "name_ar": ar,
            "rating": x.get("c"),
            "longevity": x.get("l"),
            "projection": x.get("p"),
            "year": x.get("y"),
            "price_ref": x.get("r"),
            "keyword_ar": f"عطر {ar}" if ar else "",
            "keyword_en": en,
        })
        # نُبقي قوائم الاستعلام على أعلى 600 منتج — ما بعدها طلبه ضئيل
        if rank <= 600:
            if ar:
                prod_kws.append(f"عطر {ar}")
                prod_kws.append(f"{ar} سعر")
            if en:
                prod_kws.append(en)
        if rank <= 300 and ar:
            for pre in DUPE_PREFIXES:
                dupe_kws.append(f"{pre} عطر {ar}")

    prod_kws = dedupe(prod_kws)
    dupe_kws = dedupe(dupe_kws)
    p_paths = write_batches("03_products_bulk", prod_kws)
    d_paths = write_batches("04_dupes_bulk", dupe_kws)

    # --- 4. فهرس الكتالوج للمطابقة لاحقاً مع مخرجات Semrush ---
    idx = os.path.join(OUT, "catalog_index.csv")
    with open(idx, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(index_rows[0].keys()))
        w.writeheader()
        w.writerows(index_rows)

    print(f"الماركات   : {len(brand_kws):5d} كلمة  في {len(b_paths)} ملف")
    print(f"المنتجات   : {len(prod_kws):5d} كلمة  في {len(p_paths)} ملف")
    print(f"الشبيهات   : {len(dupe_kws):5d} كلمة  في {len(d_paths)} ملف")
    print(f"فهرس الكتالوج: {len(index_rows)} صف -> {idx}")
    print(f"بذور الرأس  : {len(HEAD_SEEDS)} بذرة -> 01_head_seeds.txt")

if __name__ == "__main__":
    sys.exit(main())
