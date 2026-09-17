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

function captureCopy() {
  const text = getSelectedText().trim()
  if (!text) return

  chrome.runtime.sendMessage({
    type: 'sourceclip-save',
    payload: sourcePayload(text),
  })
}

document.addEventListener('copy', captureCopy, true)

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'sourceclip-get-selection') return false

  const text = getSelectedText().trim()
  sendResponse(text ? sourcePayload(text) : { text: '' })
  return false
})
