#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
يحلّل ملفات CSV المصدّرة من Semrush ويحوّلها إلى قرارات.

الاستخدام:
    python3 tools/semrush/analyze.py                     # يقرأ كل ما في exports/
    python3 tools/semrush/analyze.py --domain 3altayer.com

يكتشف نوع كل ملف تلقائياً (Keyword Magic / Organic Positions / Keyword Gap /
Bulk Overview) من ترويسة الأعمدة، فلا يهم اسم الملف.

المخرجات في tools/semrush/out/:
  report.md              -> التقرير التنفيذي
  keywords_master.csv    -> كل الكلمات موحّدة بلا تكرار
  quick_wins.csv         -> فرص قابلة للتنفيذ خلال أسابيع
  catalog_demand.csv     -> منتجاتك مرتّبة بحجم الطلب الفعلي على Google
"""
import csv, os, re, sys, json, math, argparse, unicodedata
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
EXPORTS = os.path.join(HERE, "exports")
OUT = os.path.join(HERE, "out")
CATALOG_INDEX = os.path.join(OUT, "catalog_index.csv")

# ترويسات Semrush تختلف بين التقارير؛ نطابقها بالمرادفات لا بالاسم الحرفي.
ALIASES = {
    "keyword":    ["keyword", "الكلمة المفتاحية", "phrase"],
    "volume":     ["search volume", "volume", "حجم البحث"],
    "kd":         ["keyword difficulty", "kd", "difficulty", "kd %"],
    "cpc":        ["cpc", "cpc (usd)", "cpc (sar)"],
    "position":   ["position", "pos", "الترتيب"],
    "prev_pos":   ["previous position", "previous pos"],
    "url":        ["url", "landing page"],
    "traffic":    ["traffic", "traffic (%)"],
    "intent":     ["intent", "keyword intents", "keyword intent"],
    "competition":["competition", "competitive density"],
    "results":    ["number of results", "results"],
    "serp":       ["serp features by keyword", "serp features"],
}

AR_DIAC = re.compile(r"[\u064B-\u065F\u0670\u0640\u06D6-\u06ED]")

# إشارات النية — مبنية على سلوك السوق السعودي لا على تصنيف Semrush وحده،
# لأن Semrush يصنّف العربية بدقة أقل من الإنجليزية.
TXN_MARKERS = ["سعر", "اسعار", "شراء", "اشتري", "متجر", "طلب", "توصيل",
               "تخفيض", "عرض", "خصم", "اصلي", "تستر", "عينه", "عينة",
               "buy", "price", "shop", "store", "online", "sale"]
NAV_MARKERS = ["موقع", "رابط", "تطبيق", "login", "website"]
INFO_MARKERS = ["ما هو", "كيف", "افضل", "اقوى", "الفرق", "مراجعة", "تجربة",
                "معنى", "طريقة", "متى", "ليش", "وش", "how", "what", "best",
                "review", "vs", "difference"]


def norm_ar(s):
    if not s:
        return ""
    s = unicodedata.normalize("NFKC", str(s)).lower()
    s = AR_DIAC.sub("", s)
    s = s.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا")
    s = s.replace("ى", "ي").replace("ة", "ه")
    return re.sub(r"\s+", " ", s).strip()


def num(v, default=0.0):
    """Semrush يخرج أرقاماً بفواصل آلاف وعلامات %؛ ننظفها قبل التحويل."""
    if v is None:
        return default
    s = str(v).strip().replace(",", "").replace("%", "").replace("$", "")
    if s in ("", "-", "n/a", "N/A"):
        return default
    try:
        return float(s)
    except ValueError:
        return default


def sniff(path):
    """يحدد الفاصل والترميز — Semrush يصدّر UTF-8 أحياناً مع BOM."""
    for enc in ("utf-8-sig", "utf-8", "cp1256"):
        try:
            with open(path, encoding=enc, newline="") as f:
                head = f.read(8192)
            if not head.strip():
                return None, None
            delim = ";" if head.count(";") > head.count(",") else ","
            return enc, delim
        except UnicodeDecodeError:
            continue
    return None, None


def map_columns(header):
    """يبني خريطة {حقلنا: اسم العمود في الملف} من مرادفات الترويسة."""
    lower = {(h or "").strip().lower(): h for h in header}
    out = {}
    for field, names in ALIASES.items():
        for n in names:
            if n in lower:
                out[field] = lower[n]
                break
    return out


def detect_kind(cols, header):
    """
    Keyword Gap يضع عموداً لكل نطاق، فنتعرّف عليه بوجود أعمدة تشبه النطاقات.
    Organic Positions يتميز بوجود position + url معاً.
    """
    domainish = [h for h in header
                 if re.match(r"^[a-z0-9.-]+\.[a-z]{2,}$", (h or "").strip().lower())]
    if len(domainish) >= 2:
        return "gap", domainish
    if "position" in cols and "url" in cols:
        return "positions", domainish
    if "volume" in cols and "keyword" in cols:
        return "keywords", domainish
    return "unknown", domainish


def classify_intent(kw, semrush_intent=""):
    """
    نية الكلمة. نثق بـ Semrush إذا صرّح، وإلا نستنتج من الألفاظ.
    هذا الفصل هو جوهر التحليل: زيارات Google الحالية تحوّل بـ 0.18% مقابل
    0.87% للزيارات المباشرة — أي أن الترافيك الوارد نيّته خاطئة.
    """
    si = (semrush_intent or "").strip().lower()
    if "transactional" in si or "commercial" in si:
        return "شرائية"
    if "navigational" in si:
        return "تنقّلية"
    if "informational" in si:
        return "معلوماتية"
    n = norm_ar(kw)
    if any(m in n for m in (norm_ar(x) for x in TXN_MARKERS)):
        return "شرائية"
    if any(m in n for m in (norm_ar(x) for x in NAV_MARKERS)):
        return "تنقّلية"
    if any(m in n for m in (norm_ar(x) for x in INFO_MARKERS)):
        return "معلوماتية"
    return "غير مصنّفة"


def opportunity(volume, kd, intent, my_pos):
    """
    درجة الأولوية 0-100.
    المنطق: الحجم يرفع، الصعوبة تخفض، النية الشرائية تضاعف،
    ووجودك أصلاً في ترتيب متقدم يقلّل العائد الحدّي من العمل.
    """
    if volume <= 0:
        return 0.0
    base = math.log10(volume + 1) * 25          # 10 زيارة ≈ 25، 1000 ≈ 75
    base *= max(0.15, 1 - (kd / 100.0))          # KD 80 يقصّ 80% من القيمة
    base *= {"شرائية": 1.6, "تنقّلية": 0.7,
             "معلوماتية": 0.6, "غير مصنّفة": 1.0}[intent]
    if my_pos:
        if my_pos <= 3:
            base *= 0.15                          # متصدّر أصلاً
        elif my_pos <= 10:
            base *= 0.55                          # صفحة أولى، تحسين لا بناء
        elif my_pos <= 30:
            base *= 1.25                          # أقرب المكاسب
    return round(min(base, 100.0), 1)


def load_catalog():
    if not os.path.exists(CATALOG_INDEX):
        return []
    with open(CATALOG_INDEX, encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def read_export(path):
    enc, delim = sniff(path)
    if not enc:
        return None
    with open(path, encoding=enc, newline="") as f:
        rdr = csv.DictReader(f, delimiter=delim)
        header = rdr.fieldnames or []
        cols = map_columns(header)
        if "keyword" not in cols:
            return None
        kind, domains = detect_kind(cols, header)
        rows = list(rdr)
    return {"path": path, "kind": kind, "cols": cols,
            "domains": domains, "rows": rows, "header": header}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--domain", default="3altayer.com",
                    help="نطاقك، لتمييز أعمدتك في تقارير Keyword Gap")
    ap.add_argument("--exports", default=EXPORTS)
    args = ap.parse_args()

    os.makedirs(OUT, exist_ok=True)
    files = []
    for root, _, names in os.walk(args.exports):
        for n in sorted(names):
            if n.lower().endswith((".csv", ".tsv")):
                files.append(os.path.join(root, n))

    if not files:
        print(f"لا توجد ملفات CSV في {args.exports}")
        print("صدّر من Semrush وضع الملفات هناك ثم أعد التشغيل.")
        return 1

    master = {}        # keyword_norm -> record
    parsed, skipped = [], []

    for p in files:
        d = read_export(p)
        if not d:
            skipped.append(os.path.basename(p))
            continue
        parsed.append(d)
        c = d["cols"]
        mine = [x for x in d["domains"] if args.domain in x]
        rivals = [x for x in d["domains"] if args.domain not in x]

        for r in d["rows"]:
            kw = (r.get(c["keyword"]) or "").strip()
            if not kw:
                continue
            key = norm_ar(kw)
            rec = master.setdefault(key, {
                "keyword": kw, "volume": 0.0, "kd": 0.0, "cpc": 0.0,
                "intent_raw": "", "my_pos": None, "rival_pos": {},
                "url": "", "sources": set(),
            })
            rec["sources"].add(d["kind"])
            rec["volume"] = max(rec["volume"], num(r.get(c.get("volume"))))
            kd = num(r.get(c.get("kd")))
            if kd:
                rec["kd"] = kd if not rec["kd"] else max(rec["kd"], kd)
            rec["cpc"] = max(rec["cpc"], num(r.get(c.get("cpc"))))
            if c.get("intent") and r.get(c["intent"]):
                rec["intent_raw"] = r[c["intent"]]

            if d["kind"] == "positions":
                pos = num(r.get(c.get("position")))
                if pos:
                    rec["my_pos"] = pos if rec["my_pos"] is None else min(rec["my_pos"], pos)
                if c.get("url") and r.get(c["url"]):
                    rec["url"] = r[c["url"]]
            elif d["kind"] == "gap":
                for dom in mine:
                    pos = num(r.get(dom))
                    if pos:
                        rec["my_pos"] = pos if rec["my_pos"] is None else min(rec["my_pos"], pos)
                for dom in rivals:
                    pos = num(r.get(dom))
                    if pos:
                        prev = rec["rival_pos"].get(dom)
                        rec["rival_pos"][dom] = pos if prev is None else min(prev, pos)

    for rec in master.values():
        rec["intent"] = classify_intent(rec["keyword"], rec["intent_raw"])
        rec["score"] = opportunity(rec["volume"], rec["kd"],
                                   rec["intent"], rec["my_pos"])

    records = sorted(master.values(), key=lambda x: -x["score"])

    # ---------- keywords_master.csv ----------
    mpath = os.path.join(OUT, "keywords_master.csv")
    with open(mpath, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["الكلمة", "حجم البحث", "الصعوبة KD", "CPC", "النية",
                    "ترتيبك", "أفضل منافس", "ترتيبه", "الأولوية", "المصدر", "URL"])
        for r in records:
            best_rival, best_pos = "", ""
            if r["rival_pos"]:
                best_rival, best_pos = min(r["rival_pos"].items(), key=lambda kv: kv[1])
            w.writerow([r["keyword"], int(r["volume"]), r["kd"], r["cpc"],
                        r["intent"], r["my_pos"] or "", best_rival, best_pos,
                        r["score"], "|".join(sorted(r["sources"])), r["url"]])

    # ---------- quick_wins.csv ----------
    # منافس يتصدّر وأنت غائب أو خارج الصفحة الأولى، بصعوبة معقولة ونية شراء.
    wins = [r for r in records
            if r["volume"] >= 20
            and r["kd"] <= 45
            and r["intent"] in ("شرائية", "غير مصنّفة")
            and (r["my_pos"] is None or r["my_pos"] > 10)
            and (r["rival_pos"] or r["my_pos"])]
    wpath = os.path.join(OUT, "quick_wins.csv")
    with open(wpath, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["الكلمة", "حجم البحث", "KD", "النية", "ترتيبك",
                    "منافس يتصدّرها", "ترتيبه", "الأولوية"])
        for r in wins[:500]:
            best_rival, best_pos = "", ""
            if r["rival_pos"]:
                best_rival, best_pos = min(r["rival_pos"].items(), key=lambda kv: kv[1])
            w.writerow([r["keyword"], int(r["volume"]), r["kd"], r["intent"],
                        r["my_pos"] or "غائب", best_rival, best_pos, r["score"]])

    # ---------- catalog_demand.csv ----------
    catalog = load_catalog()
    cat_rows = []
    if catalog:
        by_kw = {norm_ar(r["keyword"]): r for r in records}
        for c in catalog:
            hits, vol = [], 0.0
            for field in ("keyword_ar", "keyword_en", "name_ar", "name_en"):
                k = norm_ar(c.get(field, ""))
                if k and k in by_kw:
                    hits.append(by_kw[k])
                    vol += by_kw[k]["volume"]
            if hits:
                best = max(hits, key=lambda x: x["volume"])
                cat_rows.append({
                    "brand": c.get("brand", ""),
                    "name_ar": c.get("name_ar", ""),
                    "name_en": c.get("name_en", ""),
                    "rating": c.get("rating", ""),
                    "search_volume": int(vol),
                    "kd": best["kd"],
                    "my_pos": best["my_pos"] or "",
                    "score": best["score"],
                })
        cat_rows.sort(key=lambda x: -x["search_volume"])
        cpath = os.path.join(OUT, "catalog_demand.csv")
        with open(cpath, "w", encoding="utf-8-sig", newline="") as f:
            w = csv.DictWriter(f, fieldnames=list(cat_rows[0].keys())) if cat_rows else None
            if w:
                w.writeheader()
                w.writerows(cat_rows)

    # ---------- report.md ----------
    total_vol = sum(r["volume"] for r in records)
    by_intent = defaultdict(lambda: [0, 0.0])
    for r in records:
        by_intent[r["intent"]][0] += 1
        by_intent[r["intent"]][1] += r["volume"]

    ranked = [r for r in records if r["my_pos"]]
    top10 = [r for r in ranked if r["my_pos"] <= 10]

    L = []
    L.append("# تحليل Semrush — عالطاير (3altayer.com)\n")
    L.append(f"- ملفات مقروءة: **{len(parsed)}**" +
             (f" (تجاهلنا {len(skipped)}: {', '.join(skipped)})" if skipped else ""))
    L.append(f"- كلمات فريدة: **{len(records):,}**")
    L.append(f"- إجمالي الطلب الشهري: **{int(total_vol):,}** بحث")
    L.append(f"- كلمات ترتّب عليها: **{len(ranked):,}** منها **{len(top10):,}** في الصفحة الأولى\n")

    L.append("## توزيع النية\n")
    L.append("| النية | عدد الكلمات | حجم البحث | الحصة |")
    L.append("|---|---:|---:|---:|")
    for k, (n, v) in sorted(by_intent.items(), key=lambda kv: -kv[1][1]):
        share = (v / total_vol * 100) if total_vol else 0
        L.append(f"| {k} | {n:,} | {int(v):,} | {share:.1f}% |")

    L.append("\n## أعلى 40 فرصة\n")
    L.append("| # | الكلمة | حجم | KD | النية | ترتيبك | الأولوية |")
    L.append("|---:|---|---:|---:|---|---:|---:|")
    for i, r in enumerate(records[:40], 1):
        L.append(f"| {i} | {r['keyword']} | {int(r['volume']):,} | {r['kd']:.0f} | "
                 f"{r['intent']} | {r['my_pos'] or '—'} | {r['score']} |")

    if cat_rows:
        L.append("\n## أعلى 30 منتج في كتالوجك عليه طلب فعلي\n")
        L.append("| # | الماركة | العطر | حجم البحث | KD | ترتيبك |")
        L.append("|---:|---|---|---:|---:|---:|")
        for i, c in enumerate(cat_rows[:30], 1):
            L.append(f"| {i} | {c['brand']} | {c['name_ar'] or c['name_en']} | "
                     f"{c['search_volume']:,} | {c['kd']:.0f} | {c['my_pos'] or '—'} |")

    L.append(f"\n## ملفات المخرجات\n")
    L.append(f"- `keywords_master.csv` — {len(records):,} كلمة موحّدة")
    L.append(f"- `quick_wins.csv` — {min(len(wins), 500):,} فرصة قابلة للتنفيذ")
    if cat_rows:
        L.append(f"- `catalog_demand.csv` — {len(cat_rows):,} منتج عليه طلب مؤكد")

    rpath = os.path.join(OUT, "report.md")
    with open(rpath, "w", encoding="utf-8") as f:
        f.write("\n".join(L) + "\n")

    print(f"كلمات فريدة : {len(records):,}")
    print(f"طلب شهري    : {int(total_vol):,}")
    print(f"فرص سريعة   : {len(wins):,}")
    print(f"التقرير      : {rpath}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
