#!/usr/bin/env bash
# Quick check: is the bibi CLI available?
if command -v bibi &>/dev/null; then
  bibi --version
else
  echo "bibi not found."
  if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Install via Homebrew: brew install --cask jimmylv/bibigpt/bibigpt"
  else
    echo "Download from: https://bibigpt.co/download/desktop"
  fi
  exit 1
fi
