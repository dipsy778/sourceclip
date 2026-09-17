# SourceClip privacy notes

SourceClip is built around a simple rule: clipboard history should stay on the user's device.

## Data SourceClip stores

When automatic capture is enabled and you copy selected text on a normal webpage, SourceClip can store:

- the copied text
- the page title
- the page URL and hostname
- the time the clip was saved
- whether the clip is pinned
- the page scroll position and viewport size at the time of the copy

SourceClip does **not** capture or store screenshots or page images.

Settings such as theme, capture state and history limit are also stored.

## Where data is stored

All SourceClip data is stored in the browser's extension-local storage (`chrome.storage.local`).

The project contains no backend, database, analytics SDK, telemetry service, advertising system or account system.

## What SourceClip does not do

- It does not request clipboard-read permission.
- It does not continuously inspect the operating system clipboard.
- It does not intentionally capture password-input selections.
- It does not capture or store screenshots or page images.
- It does not send saved clips to a server.
- It does not sell or share clipboard history.

## Website access

Automatic source-aware capture requires the extension content script to run on regular `http://` and `https://` pages. That access is used to detect copy events, attach the current page information to selected text, record the saved scroll position and restore that position later.

Browser-protected pages such as `chrome://` and `edge://` do not allow normal content scripts and are therefore not captured.

## Saved page state

When you use the open-state button on a saved clip, SourceClip opens the original live URL, scrolls back to the saved position and attempts to locate the copied text again.

When the copied text is found, SourceClip temporarily selects that text and highlights the selection in yellow so it is easy to spot. The highlight is applied to the live page and is not saved back to the website.

Websites can change after a clip is saved, so SourceClip cannot guarantee that a dynamic page will be identical later or that the original text will still exist.

## Clearing data

Users can delete individual clips or clear their complete SourceClip history from the extension popup. Removing the extension also removes its extension-local storage according to the browser's normal extension-data behaviour.

## Self-hosting and review

SourceClip is open source. The production extension bundle is generated from the files in this repository with `npm run build`, so users can inspect and build the code themselves.
