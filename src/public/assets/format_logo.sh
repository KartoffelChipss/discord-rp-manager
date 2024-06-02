#!/bin/zsh

# Check if input PNG file is provided
if [ -z "$1" ]; then
  echo "Usage: $0 input.png"
  exit 1
fi

# Check if sips command is available
if ! command -v sips &> /dev/null; then
  echo "sips command not found. Please ensure you are running this on macOS."
  exit 1
fi

INPUT_PNG=$1
BASENAME=$(basename "$INPUT_PNG" .png)
ICONSET_DIR="${BASENAME}.iconset"

# Create iconset directory
mkdir -p "$ICONSET_DIR"

# Define the icon sizes
declare -a sizes=(16 32 128 256 512 1024)
for size in "${sizes[@]}"; do
  # Regular size
  sips -z $size $size "$INPUT_PNG" --out "$ICONSET_DIR/icon_${size}x${size}.png"
  
  # Retina size (2x)
  retina_size=$((size * 2))
  sips -z $retina_size $retina_size "$INPUT_PNG" --out "$ICONSET_DIR/icon_${size}x${size}@2x.png"
done

# Convert the iconset to icns
iconutil -c icns "$ICONSET_DIR"

# Cleanup: Remove the iconset directory if conversion is successful
if [ $? -eq 0 ]; then
  rm -r "$ICONSET_DIR"
  echo "Created ${BASENAME}.icns successfully."
else
  echo "Failed to create ${BASENAME}.icns."
fi
