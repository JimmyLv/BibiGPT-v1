---
name: bibi
description: >
  BibiGPT CLI for summarizing videos, audio, and podcasts directly in the terminal.
  Use when the user wants to summarize a URL (YouTube, Bilibili, podcast, etc.)
  or check their BibiGPT authentication status.
  Requires the BibiGPT desktop app installed with an active login session,
  or a BIBI_API_TOKEN environment variable set.
---

# BibiGPT CLI (`bibi`)

Summarize videos, audio, and podcasts from the terminal using the BibiGPT API.

## Installation

### macOS (Homebrew)

```bash
brew install --cask jimmylv/bibigpt/bibigpt
```

### Windows

Download the installer from: **https://bibigpt.co/download/desktop**

> `winget install BibiGPT` is pending review and not yet available.

### Verify installation

```bash
bibi --version
```

## Authentication

After installing, the user must log in via the desktop app at least once. The CLI reads the saved session automatically from the desktop app's settings.

Alternatively, set an API token:

```bash
export BIBI_API_TOKEN=<token>
```

On Windows (PowerShell):

```powershell
$env:BIBI_API_TOKEN="<token>"
```

## Commands

### Summarize a URL

**Important**: URLs containing `?` or `&` must be quoted to avoid shell glob errors.

```bash
# Basic summary (Markdown output to stdout)
bibi summarize "<URL>"

# Async mode — recommended for long videos (>30min)
bibi summarize "<URL>" --async

# Chapter-by-chapter summary
bibi summarize "<URL>" --chapter

# Fetch subtitles/transcript only (no AI summary)
bibi summarize "<URL>" --subtitle

# Full JSON response
bibi summarize "<URL>" --json

# Combine flags
bibi summarize "<URL>" --subtitle --json
```

**Supported URL types**: YouTube, Bilibili, podcasts, audio files, and any URL supported by BibiGPT.

### Authentication

```bash
# Check current auth status
bibi auth check

# Open browser to log in
bibi auth login

# Show how to set API token
bibi auth set-token <TOKEN>
```

### Updates

```bash
# Check if a new version is available
bibi check-update

# Download and install the latest version
bibi self-update
```

## Output Format

- **Default**: Markdown summary text sent to stdout. Progress info goes to stderr.
- **--json**: Complete API response as pretty-printed JSON to stdout.

This means you can pipe the output:

```bash
bibi summarize "<URL>" > summary.md
bibi summarize "<URL>" --json | jq '.summary'
```

## Error Handling

| Exit Code | Meaning                                        |
| --------- | ---------------------------------------------- |
| 0         | Success                                        |
| 1         | Error (auth missing, API error, timeout, etc.) |

| HTTP Status | User Action                                                      |
| ----------- | ---------------------------------------------------------------- |
| 401         | Token expired — run `bibi auth login` or re-login in desktop app |
| 402/403     | Quota exceeded — visit https://bibigpt.co/pricing                |
| 429         | Rate limited — wait and retry                                    |

## Usage Tips

- For very long videos, use `--async` to avoid HTTP timeout.
- Use `--subtitle` to get raw subtitles/transcript without AI summarization.
- Use `--json` when you need structured data (e.g., `sourceUrl`, `htmlUrl`, `detail`).
- The `--chapter` flag provides section-by-section summaries, useful for lectures or tutorials.
- The CLI does NOT open any GUI window — all output goes to the terminal.
- Run `bibi check-update` periodically to get new features and bug fixes.
