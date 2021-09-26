#!/bin/bash
echo "Fetching definitions...";
deno run --allow-read --allow-write --allow-net index.js $0 $1 $2 $3 $4 $5 $6 $7 $8 $9 > Definitions.md
echo "Converting to PDF..."
pandoc -V geometry:margin=1.2cm -V paperwidth=21cm -V paperheight=29.7cm Definitions.md -f markdown -o Definitions.pdf
exit
