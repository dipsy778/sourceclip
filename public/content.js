if (!globalThis.__sourceClipContentLoaded) {
  globalThis.__sourceClipContentLoaded = true

  function getSelectedText() {
    const active = document.activeElement

    if (
      active instanceof HTMLInputElement &&
      active.type !== 'password' &&
      typeof active.selectionStart === 'number' &&
      typeof active.selectionEnd === 'number'
    ) {
      return active.value.slice(active.selectionStart, active.selectionEnd)
    }

    if (
      active instanceof HTMLTextAreaElement &&
      typeof active.selectionStart === 'number' &&
      typeof active.selectionEnd === 'number'
    ) {
      return active.value.slice(active.selectionStart, active.selectionEnd)
    }

    return window.getSelection()?.toString() || ''
  }

  function sourcePayload(text) {
    return {
      text,
      title: document.title || 'Untitled page',
      url: location.href,
    }
  }

  function captureSelection() {
    const text = getSelectedText().trim()
    if (!text) return

    try {
      chrome.runtime.sendMessage({
        type: 'sourceclip-save',
        payload: sourcePayload(text),
      })
    } catch {
      // The extension may have been reloaded while this page stayed open.
    }
  }

  // The copy event is the canonical path for normal browser copying.
  document.addEventListener('copy', captureSelection, true)

  // Some sites intercept copy events. Capture Ctrl/Cmd+C as a fallback too.
  document.addEventListener(
    'keydown',
    (event) => {
      const isCopy =
        event.key?.toLowerCase() === 'c' &&
        (event.ctrlKey || event.metaKey) &&
        !event.altKey

      if (!isCopy) return
      window.setTimeout(captureSelection, 0)
    },
    true,
  )

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== 'sourceclip-get-selection') return false

    const text = getSelectedText().trim()
    sendResponse(text ? sourcePayload(text) : { text: '' })
    return false
  })
}
