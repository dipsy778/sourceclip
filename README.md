# SourceClip

![Build extension](https://github.com/dipsy778/sourceclip/actions/workflows/build.yml/badge.svg)
![Manifest V3](https://img.shields.io/badge/manifest-v3-black.svg?style=flat)
![Windows](https://img.shields.io/badge/platform-Windows-0078D4.svg?style=flat)
![Local only](https://img.shields.io/badge/storage-local_only-brightgreen.svg?style=flat)
![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)

> Source-aware clipboard history for Windows in Chrome and Edge. Copy text, keep the page it came from.
> 

## Why

Copying from the web is easy. Remembering where that useful quote, code snippet, product note or research detail came from is the annoying part.

SourceClip saves copied text with its page title, site, original URL and saved page position, so you can return close to the exact place you were when you copied it.

That's why SourceClip exists.

## Install

SourceClip is currently distributed as an unpacked Chromium extension for Windows.

```bash
npm install
npm run build
```

Then load the generated `dist` folder into Chrome or Microsoft Edge.

## Setup

### Chrome

1. Open `chrome://extensions`
2. Turn on **Developer mode**
3. Click **Load unpacked**
4. Select the generated `dist` folder
5. Pin SourceClip to the toolbar

### Microsoft Edge

1. Open `edge://extensions`
2. Turn on **Developer mode**
3. Click **Load unpacked**
4. Select the generated `dist` folder
5. Pin SourceClip to the toolbar

## Usage

### Copy from a webpage

Highlight text on any normal `http://` or `https://` page and press:

```text
Ctrl + C
```

SourceClip stores the copied text with the page title, website, URL, scroll position and a compressed snapshot of the visible page.

### Return to the saved page state

Click the external-link icon on a saved clip.

SourceClip opens the original live page, waits for it to load, scrolls back to the saved position and tries to locate and briefly highlight the text you copied.

Websites can change after you save a clip, so dynamic content cannot always be restored perfectly. The local screenshot preserves a visual record of what was visible at the time of the copy.

### Save a selection manually

Right-click highlighted text and choose **Save selection to SourceClip**.

### Copy with source

Open the SourceClip popup and click **Copy + source** to copy the saved text with its original page link attached.

## Features

- Automatic source-aware capture with `Ctrl + C`
- Local visible-page snapshots
- Saved scroll position and viewport state
- Reopen a page at its saved position
- Attempt to find and highlight the copied text again
- Search across copied text, page titles, domains and URLs
- Copy text again with one click
- Copy text together with a source link
- Pin important clips
- Delete clips or clear history
- Adjustable history limit from 1 to 250 clips
- Light, dark and system themes
- Local-only storage
- No account, backend, analytics or telemetry

## Permissions

| Permission | Why SourceClip needs it |
| --- | --- |
| `storage` | Saves clips, settings and page-state data locally in the browser |
| `unlimitedStorage` | Allows locally stored page snapshots without hitting the normal extension storage quota |
| `contextMenus` | Adds the right-click save action |
| `clipboardWrite` | Copies saved text back to your clipboard |
| `scripting` | Activates capture on already-open tabs after install or reload |
| `http://*/*`, `https://*/*` | Detects copy actions, records source-page state and restores saved positions |

Browser-internal pages such as `chrome://`, `edge://` and some built-in PDF viewers are restricted by Chromium, so automatic capture is unavailable there.

## Privacy

SourceClip is designed to keep clipboard history and page snapshots on your device.

It does not request clipboard-read permission, does not continuously inspect your system clipboard, does not send clips or screenshots to a server and does not include analytics or tracking code.

A page snapshot may contain other content that was visible in the browser viewport around the copied text. See [PRIVACY.md](PRIVACY.md) for the full privacy notes.

## Platform Support

SourceClip is currently focused on **Windows 10 and Windows 11**.

| Windows Browser | Support |
| --- | :---: |
| Google Chrome | ✔ |
| Microsoft Edge | ✔ |

Other platforms and browsers are not part of the current supported target.

## Next changes

- Import/export clip history
- Tags and saved filters
- Domain-level privacy controls
- Better source formatting templates
- Keyboard navigation inside the popup
- Optional favicon capture for saved sources
- Snapshot preview inside the popup
- Release ZIP from GitHub Actions

## Development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Pull requests run a GitHub Actions build check to make sure the extension bundle contains the manifest, service worker, content script, popup, icons and bundled fonts.

## License

[MIT](LICENSE)
