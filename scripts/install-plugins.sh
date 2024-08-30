#!/bin/bash

OUTPUT_DIR="${HEADLAMP_PLUGIN_DIR:-/plugins}"

echo "Using plugin output dir as ${OUTPUT_DIR}"
mkdir -p $OUTPUT_DIR

cp -a /dist/. ${OUTPUT_DIR}

echo "Copied plugins:"
ls ${OUTPUT_DIR}

find ${OUTPUT_DIR} -type f -name "main.js" | while read -r file; do
  echo "Processing $file..."
  for INJECT_VAR in $(printenv | grep '^INJECT_' | awk -F= '{print $1}'); do
    placeholder=$(echo "$INJECT_VAR" | sed 's/^INJECT_//')
    value=${!INJECT_VAR}
    echo "Replacing $placeholder with '$value'"
    sed -i.bak "s|<$placeholder>|$value|g" "$file"
  done

  rm -f "${file}.bak"
done
