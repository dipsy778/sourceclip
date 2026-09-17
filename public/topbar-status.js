const DEFAULT_CAPTURE_ENABLED = true

function getSettingsButton() {
  return document.querySelector('.topbar button[aria-label="Settings"]')
}

function ensureStatusElement() {
  const settingsButton = getSettingsButton()
  if (!settingsButton) return null

  let actions = settingsButton.parentElement
  if (!actions?.classList.contains('topbar-actions')) {
    actions = document.createElement('div')
    actions.className = 'topbar-actions'
    settingsButton.before(actions)
    actions.appendChild(settingsButton)
  }

  let status = actions.querySelector('.sourceclip-status')
  if (!status) {
    status = document.createElement('span')
    status.className = 'sourceclip-status'
    status.setAttribute('aria-live', 'polite')
    status.setAttribute('aria-label', 'SourceClip status')
    actions.prepend(status)
  }

  return status
}

function renderStatus(enabled) {
  const status = ensureStatusElement()
  if (!status) return false
  status.textContent = enabled ? 'On' : 'Off'
  status.dataset.enabled = String(enabled)
  status.title = enabled ? 'SourceClip is enabled' : 'SourceClip is disabled'
  return true
}

async function syncStatus() {
  const stored = await chrome.storage.local.get('settings')
  const enabled = stored.settings?.captureEnabled ?? DEFAULT_CAPTURE_ENABLED
  renderStatus(Boolean(enabled))
}

const observer = new MutationObserver(() => {
  if (ensureStatusElement()) syncStatus().catch(() => {})
})

observer.observe(document.documentElement, { childList: true, subtree: true })
syncStatus().catch(() => {})

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local' || !changes.settings) return
  const enabled = changes.settings.newValue?.captureEnabled ?? DEFAULT_CAPTURE_ENABLED
  renderStatus(Boolean(enabled))
})
