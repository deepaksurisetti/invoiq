import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { CURRENCIES } from '../data/currencies.js'

export default function CurrencySelect({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  const selected = CURRENCIES.find(c => c.code === value) || CURRENCIES.find(c => c.code === 'USD')

  const filtered = CURRENCIES.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.symbol.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-slate-500 text-xs shrink-0">{selected?.symbol}</span>
          <span className="font-medium text-slate-800">{selected?.code}</span>
          <span className="text-slate-400 truncate text-xs hidden sm:block">{selected?.name}</span>
        </span>
        <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 w-72 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 rounded-lg">
              <Search size={13} className="text-slate-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search currency..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder:text-slate-400"
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
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors ${c.code === value ? 'bg-emerald-50' : ''}`}
              >
                <span className="font-mono text-slate-500 text-xs w-6 shrink-0">{c.symbol}</span>
                <span className="font-semibold text-slate-800 text-sm w-10 shrink-0">{c.code}</span>
                <span className="text-slate-500 text-xs truncate">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
