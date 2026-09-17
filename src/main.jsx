import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  RiComputerLine,
  RiDeleteBin6Line,
  RiExternalLinkLine,
  RiFileCopyLine,
  RiLinkM,
  RiMoonLine,
  RiPushpinFill,
  RiPushpinLine,
  RiSearch2Line,
  RiSettings3Line,
  RiSunLine,
} from '@remixicon/react'
import './styles.css'

const DEFAULT_SETTINGS = {
  captureEnabled: true,
  maxClips: 100,
  theme: 'system',
}

function timeAgo(timestamp) {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))
  if (seconds < 10) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function hostLabel(clip) {
  if (clip.hostname) return clip.hostname
  try {
    return new URL(clip.url).hostname.replace(/^www\./, '')
  } catch {
    return 'Local source'
  }
}

async function writeClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    textarea.remove()
    return ok
  }
}

function IconButton({ label, active = false, danger = false, onClick, children }) {
  return (
    <button
      className={`icon-button${active ? ' active' : ''}${danger ? ' danger' : ''}`}
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function App() {
  const [clips, setClips] = useState([])
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [historyLimitInput, setHistoryLimitInput] = useState(String(DEFAULT_SETTINGS.maxClips))
  const [query, setQuery] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [onlyPinned, setOnlyPinned] = useState(false)
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    chrome.storage.local.get(['clips', 'settings']).then((stored) => {
      const nextSettings = { ...DEFAULT_SETTINGS, ...(stored.settings || {}) }
      setClips(Array.isArray(stored.clips) ? stored.clips : [])
      setSettings(nextSettings)
      setHistoryLimitInput(String(nextSettings.maxClips))
    })

    const onChange = (changes, areaName) => {
      if (areaName !== 'local') return
      if (changes.clips) setClips(changes.clips.newValue || [])
      if (changes.settings) {
        const nextSettings = { ...DEFAULT_SETTINGS, ...(changes.settings.newValue || {}) }
        setSettings(nextSettings)
        setHistoryLimitInput(String(nextSettings.maxClips))
      }
    }

    chrome.storage.onChanged.addListener(onChange)
    return () => chrome.storage.onChanged.removeListener(onChange)
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const applyTheme = () => {
      const dark = settings.theme === 'dark' || (settings.theme === 'system' && media.matches)
      document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    }
    applyTheme()
    media.addEventListener('change', applyTheme)
    return () => media.removeEventListener('change', applyTheme)
  }, [settings.theme])

  const visibleClips = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return [...clips]
      .filter((clip) => !onlyPinned || clip.pinned)
      .filter((clip) => {
        if (!needle) return true
        return [clip.text, clip.title, clip.hostname, clip.url].some((value) =>
          String(value || '').toLowerCase().includes(needle),
        )
      })
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt - a.createdAt)
  }, [clips, onlyPinned, query])

  async function saveSettings(patch) {
    const next = { ...settings, ...patch }
    setSettings(next)
    await chrome.storage.local.set({ settings: next })
  }

  function commitHistoryLimit() {
    const parsed = Number.parseInt(historyLimitInput, 10)
    const next = Math.min(250, Math.max(1, Number.isFinite(parsed) ? parsed : settings.maxClips))
    setHistoryLimitInput(String(next))
    saveSettings({ maxClips: next })
  }

  async function updateClip(id, patch) {
    const next = clips.map((clip) => (clip.id === id ? { ...clip, ...patch } : clip))
    setClips(next)
    await chrome.storage.local.set({ clips: next })
  }

  async function deleteClip(id) {
    const next = clips.filter((clip) => clip.id !== id)
    setClips(next)
    await chrome.storage.local.set({ clips: next })
  }

  async function copyClip(clip, includeSource = false) {
    const source = clip.url
      ? `\n\nSource: ${clip.title || hostLabel(clip)} — ${clip.url}`
      : ''
    const ok = await writeClipboard(`${clip.text}${includeSource ? source : ''}`)
    if (!ok) return
    setCopiedId(`${clip.id}:${includeSource ? 'source' : 'text'}`)
    window.setTimeout(() => setCopiedId(null), 1200)
  }

  function openSource(url) {
    if (url) chrome.tabs.create({ url })
  }

  async function clearAll() {
    if (!clips.length) return
    if (!window.confirm('Clear all saved clips? This cannot be undone.')) return
    setClips([])
    await chrome.storage.local.set({ clips: [] })
  }

  const ThemeIcon =
    settings.theme === 'dark' ? RiMoonLine : settings.theme === 'light' ? RiSunLine : RiComputerLine

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <img className="brand-logo" src="/icons/sourceclip-48.png" alt="" aria-hidden="true" />
          <div>
            <h1>SourceClip</h1>
            <p>{clips.length} saved {clips.length === 1 ? 'clip' : 'clips'}</p>
          </div>
        </div>
        <IconButton label="Settings" active={showSettings} onClick={() => setShowSettings((v) => !v)}>
          <RiSettings3Line size={19} />
        </IconButton>
      </header>

      {showSettings ? (
        <section className="settings-panel" aria-label="Settings">
          <div className="settings-controls">
            <label className="setting-row">
              <span>
                <strong>Auto capture</strong>
                <small>Remember text when you copy on a webpage.</small>
              </span>
              <input
                type="checkbox"
                checked={settings.captureEnabled}
                onChange={(event) => saveSettings({ captureEnabled: event.target.checked })}
              />
            </label>

            <label className="setting-row">
              <span>
                <strong>History limit</strong>
                <small>Choose any number from 1 to 250. Old unpinned clips are removed first.</small>
              </span>
              <input
                className="number-input"
                type="number"
                min="1"
                max="250"
                step="1"
                inputMode="numeric"
                value={historyLimitInput}
                onChange={(event) => setHistoryLimitInput(event.target.value)}
                onBlur={commitHistoryLimit}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') event.currentTarget.blur()
                }}
                aria-label="History limit"
              />
            </label>

            <div className="setting-row theme-row">
              <span>
                <strong>Appearance</strong>
                <small>Match your system or choose a theme.</small>
              </span>
              <button
                className="theme-button"
                type="button"
                onClick={() => {
                  const next = settings.theme === 'system' ? 'light' : settings.theme === 'light' ? 'dark' : 'system'
                  saveSettings({ theme: next })
                }}
              >
                <ThemeIcon size={16} />
                {settings.theme}
              </button>
            </div>

            <button className="clear-button" type="button" onClick={clearAll} disabled={!clips.length}>
              <RiDeleteBin6Line size={17} />
              Clear history
            </button>
          </div>

          <div className="settings-support">
            <button
              className="coffee-button"
              type="button"
              onClick={() => openSource('https://buymeacoffee.com/7dipsy')}
            >
              <span aria-hidden="true">☕</span>
              Buy me a coffee!
            </button>
            <p className="created-by">
              Created by{' '}
              <button
                className="created-link"
                type="button"
                onClick={() => openSource('https://github.com/dipsy778/sourceclip')}
              >
                dipsy778
              </button>
            </p>
          </div>
        </section>
      ) : (
        <>
          <section className="toolbar" aria-label="Clip filters">
            <label className="search-box">
              <RiSearch2Line size={18} />
              <input
                autoFocus
                type="search"
                placeholder="Search clips, pages or sites…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <IconButton
              label={onlyPinned ? 'Show all clips' : 'Show pinned clips'}
              active={onlyPinned}
              onClick={() => setOnlyPinned((value) => !value)}
            >
              {onlyPinned ? <RiPushpinFill size={18} /> : <RiPushpinLine size={18} />}
            </IconButton>
          </section>

          <section className="clip-list" aria-live="polite">
            {visibleClips.length ? (
              visibleClips.map((clip) => (
                <article className="clip-card" key={clip.id}>
                  <div className="clip-meta">
                    <button
                      className="source-name"
                      type="button"
                      onClick={() => openSource(clip.url)}
                      disabled={!clip.url}
                      title={clip.url || undefined}
                    >
                      <span className="source-dot" />
                      {hostLabel(clip)}
                    </button>
                    <time>{timeAgo(clip.createdAt)}</time>
                  </div>

                  <button
                    className="clip-text"
                    type="button"
                    onClick={() => copyClip(clip)}
                    title="Copy text"
                  >
                    {clip.text}
                  </button>

                  <div className="page-title" title={clip.title}>{clip.title}</div>

                  <div className="clip-actions">
                    <button className="text-action" type="button" onClick={() => copyClip(clip)}>
                      <RiFileCopyLine size={16} />
                      {copiedId === `${clip.id}:text` ? 'Copied' : 'Copy'}
                    </button>
                    <button className="text-action" type="button" onClick={() => copyClip(clip, true)}>
                      <RiLinkM size={16} />
                      {copiedId === `${clip.id}:source` ? 'Copied' : 'Copy + source'}
                    </button>
                    <div className="action-spacer" />
                    {clip.url && (
                      <IconButton label="Open source" onClick={() => openSource(clip.url)}>
                        <RiExternalLinkLine size={17} />
                      </IconButton>
                    )}
                    <IconButton
                      label={clip.pinned ? 'Unpin clip' : 'Pin clip'}
                      active={clip.pinned}
                      onClick={() => updateClip(clip.id, { pinned: !clip.pinned })}
                    >
                      {clip.pinned ? <RiPushpinFill size={17} /> : <RiPushpinLine size={17} />}
                    </IconButton>
                    <IconButton label="Delete clip" danger onClick={() => deleteClip(clip.id)}>
                      <RiDeleteBin6Line size={17} />
                    </IconButton>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <h2>{clips.length ? 'No matching clips' : 'Copy something to begin'}</h2>
                <p>
                  {clips.length
                    ? 'Try a different search or show all clips.'
                    : 'SourceClip will remember the text, page and link automatically.'}
                </p>
                {!clips.length && <kbd>Ctrl + C</kbd>}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  )
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
