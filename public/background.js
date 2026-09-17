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
    const duplicate = {
      ...clips[duplicateIndex],
      createdAt: now,
      scrollX: Number(payload?.scrollX) || 0,
      scrollY: Number(payload?.scrollY) || 0,
      viewportWidth: Number(payload?.viewportWidth) || clips[duplicateIndex].viewportWidth || 0,
      viewportHeight: Number(payload?.viewportHeight) || clips[duplicateIndex].viewportHeight || 0,
    }
    delete duplicate.snapshot

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
    scrollX: Number(payload?.scrollX) || 0,
    scrollY: Number(payload?.scrollY) || 0,
    viewportWidth: Number(payload?.viewportWidth) || 0,
    viewportHeight: Number(payload?.viewportHeight) || 0,
  }

  const next = [clip, ...clips]
  const pinned = next.filter((item) => item.pinned)
  const unpinned = next.filter((item) => !item.pinned)
  const limited = [...pinned, ...unpinned].slice(0, Math.max(1, settings.maxClips))

  await chrome.storage.local.set({ clips: limited })
  return { saved: true, id: clip.id }
}

async function ensureDefaults() {
  const { clips, settings } = await getState()
  const cleanedClips = clips.map((clip) => {
    if (!Object.prototype.hasOwnProperty.call(clip, 'snapshot')) return clip
    const cleaned = { ...clip }
    delete cleaned.snapshot
    return cleaned
  })
  await chrome.storage.local.set({ clips: cleanedClips, settings })
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

async function injectIntoOpenTabs() {
  const tabs = await chrome.tabs.query({})
  await Promise.allSettled(
    tabs.map((tab) => {
      if (!tab.id || !/^https?:\/\//i.test(tab.url || '')) return Promise.resolve()
      return chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js'],
      })
    }),
  )
}

function waitForTabLoad(tabId, timeoutMs = 15000) {
  return new Promise((resolve) => {
    let finished = false

    const done = () => {
      if (finished) return
      finished = true
      chrome.tabs.onUpdated.removeListener(listener)
      clearTimeout(timer)
      resolve()
    }

    const listener = (updatedTabId, changeInfo) => {
      if (updatedTabId === tabId && changeInfo.status === 'complete') done()
    }

    const timer = setTimeout(done, timeoutMs)
    chrome.tabs.onUpdated.addListener(listener)
  })
}

async function restoreClipState(clip) {
  const url = String(clip?.url || '')
  if (!/^https?:\/\//i.test(url)) return { opened: false }

  const tab = await chrome.tabs.create({ url })
  if (!tab.id) return { opened: false }

  await waitForTabLoad(tab.id)

  const state = {
    text: String(clip?.text || ''),
    scrollX: Number(clip?.scrollX) || 0,
    scrollY: Number(clip?.scrollY) || 0,
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: 'sourceclip-restore-state',
        state,
      })
      return { opened: true, restored: true, tabId: tab.id }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 400))
    }
  }

  return { opened: true, restored: false, tabId: tab.id }
}

injectIntoOpenTabs().catch(() => {})

chrome.runtime.onInstalled.addListener(async () => {
  await ensureDefaults()
  createMenus()
  await injectIntoOpenTabs()
})

chrome.runtime.onStartup.addListener(async () => {
  await ensureDefaults()
  createMenus()
  await injectIntoOpenTabs()
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'sourceclip-save') {
    saveClip(message.payload)
      .then(sendResponse)
      .catch((error) => sendResponse({ saved: false, error: error.message }))
    return true
  }

  if (message?.type === 'sourceclip-open-state') {
    restoreClipState(message.clip)
      .then(sendResponse)
      .catch((error) => sendResponse({ opened: false, error: error.message }))
    return true
  }

  return false
})

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== 'sourceclip-save-selection' || !info.selectionText) return

  let pageState = {}
  try {
    if (tab?.id) {
      pageState = await chrome.tabs.sendMessage(tab.id, { type: 'sourceclip-get-selection' })
    }
  } catch {
    pageState = {}
  }

  await saveClip(
    {
      ...pageState,
      text: info.selectionText,
      title: tab?.title || pageState.title || 'Untitled page',
      url: tab?.url || pageState.url || '',
      manual: true,
    },
    { force: true },
  )
})
