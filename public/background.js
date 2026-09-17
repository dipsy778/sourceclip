const DEFAULT_SETTINGS = {
  captureEnabled: true,
  maxClips: 100,
  theme: 'system',
}

async function getState() {
  const stored = await chrome.storage.local.get(['clips', 'settings'])
  return {
    clips: Array.isArray(stored.clips) ? stored.clips : [],
    settings: { ...DEFAULT_SETTINGS, ...(stored.settings || {}) },
  }
}

function getHostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

function makeId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

async function saveClip(payload, { force = false } = {}) {
  const text = String(payload?.text || '').trim()
  if (!text) return { saved: false, reason: 'empty' }

  const { clips, settings } = await getState()
  if (!settings.captureEnabled && !force) {
    return { saved: false, reason: 'disabled' }
  }

  const url = String(payload?.url || '')
  const now = Date.now()
  const duplicateIndex = clips.findIndex(
    (clip) => clip.text === text && clip.url === url && now - clip.createdAt < 3000,
  )

  if (duplicateIndex >= 0) {
    const duplicate = { ...clips[duplicateIndex], createdAt: now }
    const next = [duplicate, ...clips.filter((_, index) => index !== duplicateIndex)]
    await chrome.storage.local.set({ clips: next })
    return { saved: true, id: duplicate.id, deduped: true }
  }

  const clip = {
    id: makeId(),
    text,
    title: String(payload?.title || 'Untitled page'),
    url,
    hostname: getHostname(url),
    createdAt: now,
    pinned: false,
    manual: Boolean(payload?.manual),
  }

  const next = [clip, ...clips]
  const pinned = next.filter((item) => item.pinned)
  const unpinned = next.filter((item) => !item.pinned)
  const limited = [...pinned, ...unpinned].slice(0, Math.max(10, settings.maxClips))

  await chrome.storage.local.set({ clips: limited })
  return { saved: true, id: clip.id }
}

async function ensureDefaults() {
  const { clips, settings } = await getState()
  await chrome.storage.local.set({ clips, settings })
}

function createMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'sourceclip-save-selection',
      title: 'Save selection to SourceClip',
      contexts: ['selection'],
    })
  })
}

chrome.runtime.onInstalled.addListener(async () => {
  await ensureDefaults()
  createMenus()
})

chrome.runtime.onStartup.addListener(ensureDefaults)

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'sourceclip-save') return false

  saveClip(message.payload)
    .then(sendResponse)
    .catch((error) => sendResponse({ saved: false, error: error.message }))
  return true
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== 'sourceclip-save-selection' || !info.selectionText) return

  saveClip(
    {
      text: info.selectionText,
      title: tab?.title || 'Untitled page',
      url: tab?.url || '',
      manual: true,
    },
    { force: true },
  )
})

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'save-selection') return

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.id) return

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'sourceclip-get-selection' })
    if (!response?.text) return

    await saveClip(
      {
        ...response,
        manual: true,
      },
      { force: true },
    )
  } catch {
    // Restricted browser pages do not allow content scripts. Ignore them gracefully.
  }
})
