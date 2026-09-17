# SourceClip

![Build extension](https://github.com/dipsy778/sourceclip/actions/workflows/build.yml/badge.svg)
![Manifest V3](https://img.shields.io/badge/manifest-v3-black.svg?style=flat)
![Windows](https://img.shields.io/badge/platform-Windows-0078D4.svg?style=flat)
![Local only](https://img.shields.io/badge/storage-local_only-brightgreen.svg?style=flat)
![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)

> Source-aware clipboard history for Windows. Copy text, keep the page it came from.

## Supported browsers

<p align="center">
  <img alt="Google Chrome supported" src="https://img.shields.io/badge/Chrome-Supported-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white">
  <img alt="Microsoft Edge supported" src="https://img.shields.io/badge/Edge-Supported-0078D7?style=for-the-badge&logo=microsoftedge&logoColor=white">
  <img alt="Brave supported" src="https://img.shields.io/badge/Brave-Supported-FB542B?style=for-the-badge&logo=brave&logoColor=white">
  <img alt="Firefox supported" src="https://img.shields.io/badge/Firefox-Supported-FF7139?style=for-the-badge&logo=firefoxbrowser&logoColor=white">
  <img alt="Opera supported" src="https://img.shields.io/badge/Opera-Supported-FF1B2D?style=for-the-badge&logo=opera&logoColor=white">
</p>

SourceClip supports the major Windows browsers from one Manifest V3 codebase:

| Browser | Windows support | Mac support |
| --- | :---: | :---: |
| Google Chrome | Yes | No |
| Microsoft Edge | Yes | No |
| Brave | Yes | No |
| Mozilla Firefox 121+ | Yes | No |
| Opera | Yes | No |

Chrome, Edge, Brave and Opera use the Manifest V3 service worker. Firefox uses the Manifest V3 background-script fallback from the same extension package.

## Why

Copying from the web is easy. Remembering where that useful quote, code snippet, product note or research detail came from is the annoying part.

SourceClip saves copied text with its page title, site, original URL and saved page position, so you can return close to the exact place you were when you copied it.

That's why SourceClip exists.

## Install

Build SourceClip on Windows:

```bash
npm install
npm run build
```

The generated `dist` folder contains the extension for all supported browsers.

## Setup

### Google Chrome

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

### Brave

1. Open `brave://extensions`
2. Turn on **Developer mode**
3. Click **Load unpacked**
4. Select the generated `dist` folder
5. Pin SourceClip to the toolbar

### Opera

1. Open `opera://extensions`
2. Turn on **Developer mode**
3. Click **Load unpacked**
4. Select the generated `dist` folder
5. Pin SourceClip to the toolbar

### Mozilla Firefox

For local development/testing:

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on…**
3. Open the generated `dist` folder
4. Select `manifest.json`
5. Pin SourceClip to the toolbar if required

Firefox temporary add-ons are removed when Firefox closes. Permanent Firefox distribution requires the extension to be signed or published through Mozilla Add-ons.

## Usage

### Copy from a webpage

Highlight text on any normal `http://` or `https://` page and press:

```text
Ctrl + C
```

SourceClip stores the copied text with the page title, website, URL and saved page position. It does not capture or store screenshots or page images.

### Return to the saved page state

Click the external-link icon on a saved clip.

SourceClip opens the original live page, waits for it to load, scrolls back to the saved position and tries to locate the copied text again. When it finds the text, the text itself is temporarily highlighted in yellow so you can immediately see where the clip came from.

Websites can change after you save a clip, so dynamic content cannot always be restored perfectly and the original text may no longer be present.

### Save a selection manually

Right-click highlighted text and choose **Save selection to SourceClip**.

### Copy with source

Open the SourceClip popup and click **Copy + source** to copy the saved text with its original page link attached.

## Features

- Automatic source-aware capture with `Ctrl + C`
- Saved scroll position and viewport state
- Reopen a page at its saved position
- Temporarily highlight the original copied text in yellow
- Search across copied text, page titles, domains and URLs
- Copy text again with one click
- Copy text together with a source link
- Pin important clips
- Delete clips or clear history
- Adjustable history limit from 1 to 250 clips
- Light, dark and system themes
- Local-only storage
- No screenshot or page-image capture
- No account, backend, analytics or telemetry
- One cross-browser Manifest V3 package for Windows

## Permissions

| Permission | Why SourceClip needs it |
| --- | --- |
| `storage` | Saves clips, settings and page-state data locally in the browser |
| `contextMenus` | Adds the right-click save action |
| `clipboardWrite` | Copies saved text back to your clipboard |
| `scripting` | Activates capture on already-open tabs after install or reload |
| `http://*/*`, `https://*/*` | Detects copy actions, records source-page state and restores saved positions |

Browser-internal pages such as `chrome://`, `edge://`, `brave://`, `opera://`, `about:` and some built-in PDF viewers are restricted by the browser, so automatic capture is unavailable there.

## Privacy

SourceClip is designed to keep clipboard history on your device.

It does not request clipboard-read permission, does not continuously inspect your system clipboard, does not capture screenshots or page images, does not send clips to a server and does not include analytics or tracking code.

See [PRIVACY.md](PRIVACY.md) for the full privacy notes.

## Platform Support

SourceClip is focused on **Windows 10 and Windows 11** across Chrome, Edge, Brave, Firefox and Opera.

## Next changes

- Import/export clip history
- Tags and saved filters
- Domain-level privacy controls
- Better source formatting templates
- Keyboard navigation inside the popup
- Optional favicon capture for saved sources
- Release ZIP from GitHub Actions
- Signed browser-store releases

## Development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Pull requests run a GitHub Actions build check to make sure the extension bundle contains the manifest, background script/service worker, content script, popup, icons and bundled fonts.

## License

[MIT](LICENSE)
