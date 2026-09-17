# SourceClip

A free, privacy-first browser clipboard tool that remembers **where copied text came from**.

SourceClip runs locally in Chrome and Edge. Copy text on a webpage and it stores the text alongside the page title, site and URL, so you can find the original source later.

## Features

- Automatically remembers copied text and its source page
- Captures normal `Ctrl + C` / `Command + C` copying on regular webpages
- Injects capture support into already-open web tabs when the extension is installed or reloaded
- Search across clip text, page titles, domains and URLs
- Copy text again with one click
- Copy text together with a source citation
- Reopen the original page
- Pin important clips
- Delete individual clips or clear history
- Adjustable history limit
- Light, dark and system appearance
- Right-click **Save selection to SourceClip**
- Keyboard shortcut: `Ctrl + Shift + S` (`Command + Shift + S` on macOS)
- Local-only storage — no account, server, analytics or tracking
- Password inputs are intentionally excluded from capture

## Install locally

SourceClip is currently distributed as an unpacked Chromium extension.

### 1. Build

Requires Node.js 22 or newer.

```bash
npm install
npm run build
```

### 2. Load in Chrome

1. Open `chrome://extensions`
2. Turn on **Developer mode**
3. Click **Load unpacked**
4. Select the generated `dist` folder

### 3. Load in Microsoft Edge

1. Open `edge://extensions`
2. Turn on **Developer mode**
3. Click **Load unpacked**
4. Select the generated `dist` folder

After rebuilding an already-loaded unpacked extension, click **Reload** on the SourceClip extension card so Chrome/Edge uses the newest build.

## How it works

A small content script listens for copy actions on normal `http://` and `https://` pages. When selected text is copied, SourceClip sends the text, page title and page URL to the extension service worker. A `Ctrl/Cmd + C` listener provides a fallback on sites that interfere with the normal copy event. The service worker stores clips in `chrome.storage.local`.

On install, reload and browser startup, SourceClip also injects its capture script into already-open normal web tabs. This avoids requiring a manual page refresh just to start capturing.

The popup reads that local history and provides search, pinning, copy, copy-with-source, open-source and deletion controls.

SourceClip does **not** request clipboard-read permission and does not continuously inspect the system clipboard.

## Permissions

| Permission | Why SourceClip needs it |
| --- | --- |
| `storage` | Save clips and settings locally in the browser |
| `contextMenus` | Add “Save selection to SourceClip” to the right-click menu |
| `clipboardWrite` | Copy saved text back to your clipboard |
| `scripting` | Activate SourceClip on already-open normal web tabs after install/reload |
| Access to `http://*/*` and `https://*/*` | Detect copy events and remember the source page |

Browser-internal pages such as `chrome://` and `edge://` do not allow normal extension content scripts, so automatic capture is unavailable there.

## Tech

- Chrome Extension Manifest V3
- React
- Vite
- Geist Variable via Fontsource
- Remix Icon SVG React components

## Development

```bash
npm install
npm run dev
```

For a production extension build:

```bash
npm run build
```

Pull requests run a GitHub Actions build check to make sure the extension bundle contains the manifest, service worker, content script and popup.

## Privacy

SourceClip is designed to keep clipboard history on the device. It has no backend, account system, analytics SDK or telemetry endpoint. See [PRIVACY.md](PRIVACY.md) for the privacy notes.

## License

MIT
