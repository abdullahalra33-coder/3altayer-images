#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""عدد المقيّمين من سلة إلى الكتالوج، بدون ملف إكسل.

ملف التصدير ما كان موجوداً، فسُحبت المنتجات من واجهة سلة (products_list)
صفحةً صفحة، وكل صفحة JSON بالشكل {data:[{id, name, brand:{name}, description}]}.

    python3 salla-votes.py harvest page1.json page2.json … > votes.json
    python3 salla-votes.py merge votes.json          # يكتب الحقل v في perfumes.json

المطابقة: بالمعرّف `i` لمن له صورة، وإلا بنفس مفتاح (البراند، الاسم) الذي
يبنيه extract.py — فالعطر الواحد له عدة منتجات (أحجام وعينات) تحمل الرقم نفسه.
"""
import sys, json, re, io, os, types
HERE = os.path.dirname(os.path.abspath(__file__))

# نحتاج latin_tail و clean_name من extract.py بدون تشغيل الاستخراج نفسه
sys.modules.setdefault('openpyxl', types.ModuleType('openpyxl'))
_src = io.open(os.path.join(HERE, 'extract.py'), encoding='utf-8').read()
_ns = {'__file__': os.path.join(HERE, 'extract.py')}
_keep, sys.stdout = sys.stdout, io.StringIO()      # رأس extract.py يطبع عدّ الصور
try: exec(_src[:_src.index('FILES = ')], _ns)
finally: sys.stdout = _keep
latin_tail, clean_name = _ns['latin_tail'], _ns['clean_name']

RX_V = re.compile(r'من\s*([\d,]+)\s*تقييم على Fragrantica')
RX_C = re.compile(r'تقييم المجتمع.{0,400}?(\d+(?:\.\d+)?)\s*من\s*5', re.S)

def key_of(brand_raw, name):
    brand = re.sub(r'^Christian\s+', '', latin_tail(brand_raw), flags=re.I)
    pname = clean_name(name, brand)
    return (brand.lower(), re.sub(r'\s+', ' ', pname.lower())) if brand and pname else None

def harvest(paths):
    out = {}
    for path in paths:
        d = json.load(io.open(path, encoding='utf-8'))
        for p in d.get('data') or []:
            mv = RX_V.search(p.get('description') or '')
            if not mv: continue
            rec = {'v': int(mv.group(1).replace(',', '')), 'name': p.get('name') or '',
                   'brand': ((p.get('brand') or {}).get('name')) or ''}
            mc = RX_C.search(p.get('description') or '')
            if mc: rec['c'] = float(mc.group(1))
            out[str(p['id'])] = rec
    return out

def merge(votes, write=True):
    path = os.path.join(HERE, 'perfumes.json')
    data = json.loads(io.open(path, encoding='utf-8').read())
    by_key = {}
    for pid, r in votes.items():
        k = key_of(r.get('brand', ''), r.get('name', ''))
        if k: by_key.setdefault(k, []).append(r['v'])
    hit_id = hit_key = 0
    for row in data['p']:
        v = None
        if row.get('i') and row['i'] in votes:
            v = votes[row['i']]['v']; hit_id += 1
        else:
            k = (row['b'].lower(), re.sub(r'\s+', ' ', row['n'].lower()))
            if k in by_key: v = max(by_key[k]); hit_key += 1
        if v: row['v'] = v
        else: row.pop('v', None)
    n = sum(1 for r in data['p'] if r.get('v'))
    print(f'{len(votes)} منتجاً فيه عدد مقيّمين · طابق بالمعرّف {hit_id} · بالاسم {hit_key} · '
          f'عطور الكتالوج التي صار لها v: {n}/{len(data["p"])}')
    if write:
        io.open(path, 'w', encoding='utf-8').write(json.dumps(data, ensure_ascii=False, separators=(',', ':')))
    return n

if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == 'harvest':
        print(json.dumps(harvest(sys.argv[2:]), ensure_ascii=False))
    elif len(sys.argv) == 3 and sys.argv[1] == 'merge':
        merge(json.load(io.open(sys.argv[2], encoding='utf-8')), write='--dry' not in sys.argv)
    elif len(sys.argv) == 4 and sys.argv[1] == 'merge' and sys.argv[3] == '--dry':
        merge(json.load(io.open(sys.argv[2], encoding='utf-8')), write=False)
    else:
        print(__doc__)
