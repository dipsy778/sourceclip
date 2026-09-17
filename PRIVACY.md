# SourceClip privacy notes

SourceClip is built around a simple rule: clipboard history should stay on the user's device.

## Data SourceClip stores

When automatic capture is enabled and you copy selected text on a normal webpage, SourceClip can store:

- the copied text
- the page title
- the page URL and hostname
- the time the clip was saved
- whether the clip is pinned

Settings such as theme, capture state and history limit are also stored.

## Where data is stored

All SourceClip data is stored in the browser's extension-local storage (`chrome.storage.local`).

The project contains no backend, database, analytics SDK, telemetry service, advertising system or account system.

## What SourceClip does not do

- It does not request clipboard-read permission.
- It does not continuously inspect the operating system clipboard.
- It does not intentionally capture password-input selections.
- It does not send saved clips to a server.
- It does not sell or share clipboard history.

## Website access

Automatic source-aware capture requires the extension content script to run on regular `http://` and `https://` pages. That access is used to detect copy events and attach the current page title and URL to the selected text.

Browser-protected pages such as `chrome://` and `edge://` do not allow normal content scripts and are therefore not captured.

## Clearing data

Users can delete individual clips or clear their complete SourceClip history from the extension popup. Removing the extension also removes its extension-local storage according to the browser's normal extension-data behaviour.

## Self-hosting and review

SourceClip is open source. The production extension bundle is generated from the files in this repository with `npm run build`, so users can inspect and build the code themselves.
