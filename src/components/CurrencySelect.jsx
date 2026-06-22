import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { CURRENCIES } from '../data/currencies.js'

export default function CurrencySelect({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 288 })
  const btnRef = useRef(null)
  const dropRef = useRef(null)

  const selected = CURRENCIES.find(c => c.code === value) || CURRENCIES.find(c => c.code === 'USD')

  const filtered = CURRENCIES.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.symbol.includes(search)
  )

  function handleOpen() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setDropPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 288),
      })
    }
    setOpen(o => !o)
    setSearch('')
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        dropRef.current && !dropRef.current.contains(e.target)
      ) {
        setOpen(false)
        setSearch('')
      }
    }
    // Close on scroll so dropdown doesn't drift from button
    function handleScroll() { setOpen(false); setSearch('') }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('scroll', handleScroll, true)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('scroll', handleScroll, true)
    }
  }, [])

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm hover:border-slate-400 dark:hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-slate-500 dark:text-slate-400 text-xs shrink-0">{selected?.symbol}</span>
          <span className="font-medium text-slate-800 dark:text-slate-100">{selected?.code}</span>
          <span className="text-slate-400 dark:text-slate-500 truncate text-xs hidden sm:block">{selected?.name}</span>
        </span>
        <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        // Rendered at document root level via fixed position — escapes any overflow:hidden ancestor
        <div
          ref={dropRef}
          style={{
            position: 'fixed',
            top: dropPos.top,
            left: dropPos.left,
            width: dropPos.width,
            zIndex: 9999,
          }}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-2xl overflow-hidden"
        >
          <div className="p-2 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <Search size={13} className="text-slate-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search currency..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto scrollbar-thin">
            {filtered.length === 0 && (
              <div className="px-4 py-3 text-sm text-slate-400 text-center">No results</div>
            )}
            {filtered.map(c => (
              <button
                key={c.code}
                type="button"
                onClick={() => { onChange(c.code); setOpen(false); setSearch('') }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                  ${c.code === value
                    ? 'bg-emerald-50 dark:bg-emerald-900/30'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
              >
                <span className="font-mono text-slate-500 dark:text-slate-400 text-xs w-6 shrink-0">{c.symbol}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm w-10 shrink-0">{c.code}</span>
                <span className="text-slate-500 dark:text-slate-400 text-xs truncate">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
