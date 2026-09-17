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
    status = document.createElement('button')
    status.type = 'button'
    status.className = 'sourceclip-status'
    status.setAttribute('aria-live', 'polite')
    status.addEventListener('click', toggleCapture)
    actions.prepend(status)
  }

  return status
}

function renderStatus(enabled) {
  const status = ensureStatusElement()
  if (!status) return false
  status.textContent = enabled ? 'On' : 'Off'
  status.dataset.enabled = String(enabled)
  status.setAttribute('aria-label', enabled ? 'Turn SourceClip off' : 'Turn SourceClip on')
  status.setAttribute('aria-pressed', String(enabled))
  return true
}

async function getCaptureEnabled() {
  const stored = await chrome.storage.local.get('settings')
  return stored.settings?.captureEnabled ?? DEFAULT_CAPTURE_ENABLED
}

async function syncStatus() {
  renderStatus(Boolean(await getCaptureEnabled()))
}

async function toggleCapture() {
  const stored = await chrome.storage.local.get('settings')
  const settings = stored.settings || {}
  const enabled = settings.captureEnabled ?? DEFAULT_CAPTURE_ENABLED
  const nextSettings = { ...settings, captureEnabled: !enabled }
  await chrome.storage.local.set({ settings: nextSettings })
  renderStatus(!enabled)
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
