#!/bin/bash

OUTPUT_DIR="${HEADLAMP_PLUGIN_DIR:-/plugins}"

echo "Using plugin output dir as ${OUTPUT_DIR}"
mkdir -p $OUTPUT_DIR

cp -a /dist/. ${OUTPUT_DIR}

echo "Copied plugins:"
ls ${OUTPUT_DIR}
