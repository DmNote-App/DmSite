#!/usr/bin/env bash
# Pretendard 서브셋 생성. 결과물은 src/app/fonts/PretendardVariable.subset.woff2
#
# 통짜 Pretendard는 굵기 하나가 780KB라 네 벌이면 3.1MB다. 가변 폰트를
# KS X 1001 완성형 2350자로 줄이고 굵기 축을 실제 쓰는 400~700으로 좁히면
# 한 파일 307KB로 모든 굵기를 덮는다.
#
# KS X 1001은 현대 한국어 표기를 사실상 전부 포함한다. 문서에 표준 밖 글자가
# 들어가면 그 글자만 시스템 폰트로 떨어지므로, 그럴 때 COMMON에 더한다.
#
# 사용법: scripts/build-font.sh
set -euo pipefail

VERSION="1.3.9"
SRC_URL="https://cdn.jsdelivr.net/npm/pretendard@${VERSION}/dist/web/variable/woff2/PretendardVariable.woff2"
OUT="src/app/fonts/PretendardVariable.subset.woff2"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

python3 -m venv "$WORK/venv"
"$WORK/venv/bin/pip" -q install fonttools brotli

curl -sfL "$SRC_URL" -o "$WORK/full.woff2"

# 라틴, 라틴1 보충, 일반 문장부호, 통화, 화살표, CJK 문장부호, 한글 자모
COMMON="U+0020-007E,U+00A0-00FF,U+2000-206F,U+20A9,U+20AC,U+2190-21FF,U+3000-303F,U+3130-318F"

# KS X 1001 완성형 2350자. iso2022_kr이 정확히 이 집합만 인코딩한다
# (euc-kr 코덱은 실제로 CP949라 11172자를 다 통과시키므로 쓰면 안 된다)
KS=$("$WORK/venv/bin/python" - <<'PY'
out = []
for cp in range(0xAC00, 0xD7A4):
    try:
        chr(cp).encode("iso2022_kr")
        out.append(f"U+{cp:04X}")
    except UnicodeEncodeError:
        pass
print(",".join(out))
PY
)

# 굵기 축을 400~700으로 좁힌 뒤 서브셋. 축을 안 좁히면 438KB가 나온다
"$WORK/venv/bin/fonttools" varLib.instancer "$WORK/full.woff2" wght=400:700 \
  -o "$WORK/inst.ttf" --no-overlap-flag

"$WORK/venv/bin/pyftsubset" "$WORK/inst.ttf" \
  --output-file="$OUT" \
  --flavor=woff2 \
  --layout-features="kern,liga,calt,ccmp,mark,mkmk" \
  --unicodes="${COMMON},${KS}"

ls -l "$OUT"
