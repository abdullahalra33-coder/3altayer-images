#!/usr/bin/env bash
# اختبار المحلّل على عيّنات بترويسات Semrush الحقيقية
set -euo pipefail
cd "$(dirname "$0")/.."/..
python3 tools/semrush/analyze.py --exports tools/semrush/fixtures --domain 3altayer.com
grep -q "كلمات فريدة: \*\*8\*\*" tools/semrush/out/report.md && echo "PASS: دمج 3 تقارير -> 8 كلمات فريدة"
grep -q "شبيه عطر بكارات روج 540" tools/semrush/out/quick_wins.csv && echo "PASS: رصد فرصة يتصدّرها منافس"
