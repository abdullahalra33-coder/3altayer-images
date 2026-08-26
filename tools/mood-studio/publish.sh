#!/usr/bin/env bash
# ينشر الستوديو على GitHub Pages.
#
# ليه فيه فرع منفصل: المستودع كله ~1.4 جيجا، وحد GitHub Pages جيجا واحد.
# فرع gh-pages يحمل اللي يحتاجه الستوديو بس — الأداة + صور المنتجات (~437 ميجا).
#
# شغّله من جذر المستودع بعد أي تعديل على tools/mood-studio/index.html:
#   bash tools/mood-studio/publish.sh
set -euo pipefail

SRC="${1:-HEAD}"
cd "$(git rev-parse --show-toplevel)"

studio=$(git rev-parse "$SRC:tools/mood-studio")
photos=$(git rev-parse "$SRC:store_orig")

nojekyll=$(git hash-object -w -t blob /dev/null)
index=$(git cat-file blob refs/heads/gh-pages:index.html 2>/dev/null | git hash-object -w -t blob --stdin) \
  || index=$(printf '<meta http-equiv="refresh" content="0; url=tools/mood-studio/">\n' | git hash-object -w -t blob --stdin)

tools=$(printf '040000 tree %s\tmood-studio\n' "$studio" | git mktree)
root=$(printf '100644 blob %s\t.nojekyll\n100644 blob %s\tindex.html\n040000 tree %s\tstore_orig\n040000 tree %s\ttools\n' \
        "$nojekyll" "$index" "$photos" "$tools" | git mktree)

parent=$(git rev-parse --verify -q refs/heads/gh-pages || true)
if [ -n "$parent" ] && [ "$(git rev-parse "$parent^{tree}")" = "$root" ]; then
  echo "لا يوجد جديد — الموقع محدّث أصلاً."
  exit 0
fi

commit=$(git commit-tree "$root" ${parent:+-p "$parent"} -m "Republish the story studio")
git update-ref refs/heads/gh-pages "$commit"
git push origin gh-pages

echo
echo "تم. الموقع يبني الحين، يجهز خلال دقيقة تقريباً:"
echo "  https://abdullahalra33-coder.github.io/3altayer-images/tools/mood-studio/"
