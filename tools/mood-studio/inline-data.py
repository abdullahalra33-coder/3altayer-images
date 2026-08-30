#!/usr/bin/env python3
"""يستبدل `const DATA = {...};` في index.html بمحتوى perfumes.json.

    python3 extract.py            # يبني perfumes.json من ملفات الإكسل
    node photo-quality.mjs        # يعلّم الصور القابلة للقص بـ k:1
    python3 inline-data.py        # يحقنها في index.html
"""
import io, os, re, json

here = os.path.dirname(os.path.abspath(__file__))
data = io.open(os.path.join(here, 'perfumes.json'), encoding='utf-8').read().strip()
json.loads(data)                                   # لا تحقن ملفاً مكسوراً

path = os.path.join(here, 'index.html')
s = io.open(path, encoding='utf-8').read()
m = re.search(r'^const DATA = .*?;$', s, re.M | re.S)
if not m:
    raise SystemExit('ما لقيت سطر const DATA في index.html')
out = s[:m.start()] + 'const DATA = ' + data + ';' + s[m.end():]
assert len(out) > 200000
io.open(path, 'w', encoding='utf-8').write(out)
print('حُقنت %d بايت من perfumes.json' % len(data))
