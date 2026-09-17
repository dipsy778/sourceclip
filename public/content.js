if (!globalThis.__sourceClipContentLoaded) {
  globalThis.__sourceClipContentLoaded = true

  let lastCaptureText = ''
  let lastCaptureAt = 0

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

  function findTextNode(root, needle) {
    const normalizedNeedle = needle.replace(/\s+/g, ' ').trim()
    if (!normalizedNeedle) return null

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement
        if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) {
          return NodeFilter.FILTER_REJECT
        }
        return node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
      },
    })

    while (walker.nextNode()) {
      const node = walker.currentNode
      const normalized = node.textContent.replace(/\s+/g, ' ')
      if (normalized.includes(normalizedNeedle)) return node
    }

    return null
  }

  function highlightRestoredText(text) {
    const probe = text.replace(/\s+/g, ' ').trim().slice(0, 180)
    const node = findTextNode(document.body, probe)
    if (!node?.parentElement) return false

    const target = node.parentElement
    target.scrollIntoView({ block: 'center', behavior: 'instant' })
    target.dataset.sourceclipRestore = 'true'
    target.style.outline = '2px solid #f2c94c'
    target.style.outlineOffset = '4px'
    target.style.borderRadius = '3px'

    window.setTimeout(() => {
      if (target.dataset.sourceclipRestore !== 'true') return
      target.style.outline = ''
      target.style.outlineOffset = ''
      target.style.borderRadius = ''
      delete target.dataset.sourceclipRestore
    }, 4500)

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
