if (!globalThis.__sourceClipContentLoaded) {
  globalThis.__sourceClipContentLoaded = true

  let lastCaptureText = ''
  let lastCaptureAt = 0
  let restoreStyle = null
  let restoreTimer = null

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
      scrollX: Math.round(window.scrollX),
      scrollY: Math.round(window.scrollY),
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    }
  }

  function captureSelection() {
    const text = getSelectedText().trim()
    if (!text) return

    const now = Date.now()
    if (text === lastCaptureText && now - lastCaptureAt < 350) return
    lastCaptureText = text
    lastCaptureAt = now

    try {
      chrome.runtime.sendMessage({
        type: 'sourceclip-save',
        payload: sourcePayload(text),
      })
    } catch {
      // The extension may have been reloaded while this page stayed open.
    }
  }

  function buildNormalizedTextMap(root) {
    const nodes = []
    const normalized = []
    let previousWasSpace = false

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement
        if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA'].includes(parent.tagName)) {
          return NodeFilter.FILTER_REJECT
        }
        return node.textContent ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
      },
    })

    while (walker.nextNode()) {
      const node = walker.currentNode
      const text = node.textContent || ''

      for (let offset = 0; offset < text.length; offset += 1) {
        const char = text[offset]
        const isSpace = /\s/.test(char)

        if (isSpace) {
          if (previousWasSpace || normalized.length === 0) continue
          normalized.push(' ')
          nodes.push({ node, offset })
          previousWasSpace = true
          continue
        }

        normalized.push(char)
        nodes.push({ node, offset })
        previousWasSpace = false
      }
    }

    return { text: normalized.join('').trimEnd(), map: nodes }
  }

  function ensureRestoreSelectionStyle() {
    if (restoreStyle?.isConnected) return
    restoreStyle = document.createElement('style')
    restoreStyle.dataset.sourceclipRestoreStyle = 'true'
    restoreStyle.textContent = `
      html[data-sourceclip-restoring='true'] ::selection {
        background: #ffeb3b !important;
        color: #111 !important;
      }
    `
    document.documentElement.appendChild(restoreStyle)
  }

  function clearRestoreHighlight() {
    if (restoreTimer) {
      clearTimeout(restoreTimer)
      restoreTimer = null
    }

    document.documentElement.removeAttribute('data-sourceclip-restoring')
    window.getSelection()?.removeAllRanges()
  }

  function highlightRestoredText(text) {
    const needle = String(text || '').replace(/\s+/g, ' ').trim()
    if (!needle) return false

    const { text: pageText, map } = buildNormalizedTextMap(document.body)
    const index = pageText.indexOf(needle)
    if (index < 0 || !map[index] || !map[index + needle.length - 1]) return false

    const start = map[index]
    const end = map[index + needle.length - 1]
    const range = document.createRange()
    range.setStart(start.node, start.offset)
    range.setEnd(end.node, Math.min(end.offset + 1, end.node.textContent?.length || 0))

    const selection = window.getSelection()
    if (!selection) return false

    ensureRestoreSelectionStyle()
    document.documentElement.dataset.sourceclipRestoring = 'true'
    selection.removeAllRanges()
    selection.addRange(range)

    const rect = range.getBoundingClientRect()
    const targetY = window.scrollY + rect.top - Math.max(80, (window.innerHeight - rect.height) / 2)
    window.scrollTo({ left: window.scrollX, top: Math.max(0, targetY), behavior: 'instant' })

    restoreTimer = window.setTimeout(clearRestoreHighlight, 4500)
    return true
  }

  function restoreState(state) {
    const x = Number(state?.scrollX) || 0
    const y = Number(state?.scrollY) || 0

    window.setTimeout(() => {
      window.scrollTo({ left: x, top: y, behavior: 'instant' })

      window.setTimeout(() => {
        if (state?.text) highlightRestoredText(String(state.text))
      }, 250)
    }, 250)
  }

  // The copy event is the canonical path for normal Windows copying.
  document.addEventListener('copy', captureSelection, true)

  // Some sites intercept copy events. Capture Ctrl+C as a fallback too.
  document.addEventListener(
    'keydown',
    (event) => {
      const isCopy = event.key?.toLowerCase() === 'c' && event.ctrlKey && !event.altKey
      if (!isCopy) return
      window.setTimeout(captureSelection, 0)
    },
    true,
  )

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'sourceclip-get-selection') {
      const text = getSelectedText().trim()
      sendResponse(text ? sourcePayload(text) : { text: '' })
      return false
    }

    if (message?.type === 'sourceclip-restore-state') {
      restoreState(message.state || {})
      sendResponse({ restored: true })
      return false
    }

    return false
  })
}
