# SourceClip

![Build extension](https://github.com/dipsy778/sourceclip/actions/workflows/build.yml/badge.svg)
![Manifest V3](https://img.shields.io/badge/manifest-v3-black.svg?style=flat)
![Local only](https://img.shields.io/badge/storage-local_only-brightgreen.svg?style=flat)
![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)

> Source-aware clipboard history for Chrome and Edge. Copy text, keep the page it came from.

<p align="center">
  <img width="144" src="public/icons/sourceclip-128.png" alt="SourceClip logo">
</p>

## Why

Copying from the web is easy. Remembering where that useful quote, code snippet, product note or research detail came from is the annoying part.

SourceClip saves copied text with its page title, site and original URL, so you can find the source again later instead of digging through tabs, browser history or screenshots.

That's why SourceClip exists.

## Install

SourceClip is currently distributed as an unpacked Chromium extension.

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

Highlight text on any normal `http://` or `https://` page and press `Ctrl + C`.

SourceClip stores the copied text with the page title, website and URL.

### Save a selection manually

Right-click highlighted text and choose **Save selection to SourceClip**.

You can also use the keyboard shortcut:

```text
Ctrl + Shift + S
```

On macOS:

```text
Command + Shift + S
```

### Copy with source

Open the SourceClip popup and click **Copy + source** to copy the saved text with its original page link attached.

### Find the original page

Search your saved clips by text, page title, website or URL, then click the source link to reopen where the text came from.

## Features

- Automatic source-aware capture on normal webpages
- Search across copied text, page titles, domains and URLs
- Copy text again with one click
- Copy text together with a source link
- Open the original page
- Pin important clips
- Delete clips or clear history
- Adjustable history limit
- Light, dark and system themes
- Local-only storage
- No account, backend, analytics or telemetry

## Permissions

| Permission | Why SourceClip needs it |
| --- | --- |
| `storage` | Saves clips and settings locally in the browser |
| `contextMenus` | Adds the right-click save action |
| `clipboardWrite` | Copies saved text back to your clipboard |
| `scripting` | Activates capture on already-open tabs after install or reload |
| `http://*/*`, `https://*/*` | Detects copy actions and records the source page |

Browser-internal pages such as `chrome://`, `edge://` and some built-in PDF viewers are restricted by Chromium, so automatic capture is unavailable there.

## Privacy

SourceClip is designed to keep clipboard history on your device.

It does not request clipboard-read permission, does not continuously inspect your system clipboard, does not send clips to a server and does not include analytics or tracking code.

See [PRIVACY.md](PRIVACY.md) for the full privacy notes.

## Browser Support

SourceClip targets Chromium browsers that support Manifest V3 extensions.

| Chrome | Edge | Brave | Arc |
| :---: | :---: | :---: | :---: |
| ✔ | ✔ | ✔ | ✔ |

Firefox support is not included yet because it needs separate Manifest V3 testing.

## Next changes

- Import/export clip history
- Tags and saved filters
- Domain-level privacy controls
- Better source formatting templates
- Keyboard navigation inside the popup
- Optional favicon capture for saved sources
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

Pull requests run a GitHub Actions build check to make sure the extension bundle contains the manifest, service worker, content script and popup.

## License

[MIT](LICENSE)
