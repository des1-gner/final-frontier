#!/bin/sh
# Concatenates src/*.js into a single self-contained index.html
cd "$(dirname "$0")"
{ printf '%s\n' '<!DOCTYPE html>' '<html lang="en"><head><meta charset="utf-8">' '<meta name="viewport" content="width=device-width,initial-scale=1">' '<title>FINAL FRONTIER - a Star Trek themed roguelike</title>' '<style>html,body{margin:0;height:100%;background:#05060f;overflow:hidden}body{display:flex;align-items:center;justify-content:center}canvas{image-rendering:pixelated;image-rendering:crisp-edges;box-shadow:0 0 40px #000;cursor:none}</style>' '</head><body><canvas id="c"></canvas><script>'
  cat src/a_core.js src/b_data.js src/c_map.js src/d_combat.js src/e_away.js src/f_screens.js
  printf '%s\n' '</script></body></html>'; } > index.html
