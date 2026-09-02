#!/bin/bash
# scripts/download_fonts.sh
# -------------------------
# Downloads Plus Jakarta Sans woff2 files into the frontend assets directory.
# Run this script from the workspace root.

FONT_DIR="frontend/src/assets/fonts"
mkdir -p "$FONT_DIR"

echo "Downloading Plus Jakarta Sans fonts to $FONT_DIR..."

WEIGHTS=(400 500 600 700 800)

for w in "${WEIGHTS[@]}"; do
  URL="https://cdn.jsdelivr.net/fontsource/fonts/plus-jakarta-sans@latest/files/plus-jakarta-sans-latin-${w}-normal.woff2"
  OUT="$FONT_DIR/plus-jakarta-sans-latin-${w}-normal.woff2"
  
  echo "Fetching weight $w..."
  curl -L -s -o "$OUT" "$URL"
  
  if [ $? -eq 0 ]; then
    echo "✓ Saved weight $w to $OUT"
  else
    echo "✗ Failed to download weight $w"
  fi
done

echo "Font download complete."
