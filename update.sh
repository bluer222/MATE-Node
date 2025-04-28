#!/bin/bash

# CONFIGURE YOUR REPO HERE
REPO_URL="https://github.com/bluer222/MATE-Node.git"
TEMP_DIR="repo_temp"

# Get absolute path to script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_NAME="$(basename "$0")"

# Delete everything except the script itself
find "$SCRIPT_DIR" -mindepth 1 -not -name "$SCRIPT_NAME" -exec rm -rf {} +

# Clone the repo into a temp directory
git clone "$REPO_URL" "$SCRIPT_DIR/$TEMP_DIR"

# Move all files from temp directory to current directory, EXCEPT the script
shopt -s dotglob
for item in "$SCRIPT_DIR/$TEMP_DIR"/*; do
  basename_item="$(basename "$item")"
  if [ "$basename_item" != "$SCRIPT_NAME" ]; then
    mv "$item" "$SCRIPT_DIR/"
  fi
done
shopt -u dotglob

# Remove the temp directory
rmdir "$SCRIPT_DIR/$TEMP_DIR"

echo "Update completed. Installing npm packages..."

# Run npm install
cd "$SCRIPT_DIR"
npm install

echo "Starting application..."

# Run npm start
npm start
