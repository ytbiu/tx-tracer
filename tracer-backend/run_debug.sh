#!/bin/bash

# Check if arguments are provided
if [ -z "$1" ]; then
    INPUT="err.json"
else
    INPUT="$1"
fi

BLOCK_NUM=${2:-latest}

# If input is not a file and doesn't look like JSON (doesn't start with {), assume it's a file path
if [ ! -f "$INPUT" ] && [[ "$INPUT" != \{* ]]; then
    echo "Error: Input file '$INPUT' not found."
    exit 1
fi

echo "Running debug trace..."
if [ -f "$INPUT" ]; then
    echo "Input File: $INPUT"
else
    echo "Input Data: (raw json provided)"
fi
echo "Block: $BLOCK_NUM"
echo "----------------------------------------"

go run main.go -input "$INPUT" -block "$BLOCK_NUM"
