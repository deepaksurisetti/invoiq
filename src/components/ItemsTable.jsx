import { Plus, Trash2 } from 'lucide-react'
import { calculateItemAmount } from '../utils/calculations.js'
import { formatAmount } from '../data/currencies.js'

export default function ItemsTable({ items, currency, mode, onAdd, onRemove, onUpdate }) {
  const cols = mode === 'detailed'
    ? 'grid-cols-[1fr_70px_90px_70px_80px_32px]'
    : 'grid-cols-[1fr_70px_90px_80px_32px]'

  const inputCls = 'px-2 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors'

  return (
    <div className="space-y-2">
      {/* Column headers */}
      <div className={`grid gap-2 px-1 ${cols}`}>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</span>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">Qty</span>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Rate</span>
        {mode === 'detailed' && <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">Disc%</span>}
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Amount</span>
        <span />
      </div>

      {items.map((item, idx) => (
        <div key={item.id} className={`grid gap-2 items-center ${cols}`}>
          <input
            type="text"
            value={item.description}
            onChange={e => onUpdate(idx, 'description', e.target.value)}
            placeholder={`Item ${idx + 1}`}
            className={inputCls}
          />
          <input
            type="number"
            value={item.quantity}
            onChange={e => onUpdate(idx, 'quantity', e.target.value)}
            min="0" step="any"
            className={`${inputCls} text-center`}
          />
          <input
            type="number"
            value={item.rate}
            onChange={e => onUpdate(idx, 'rate', e.target.value)}
            min="0" step="any" placeholder="0.00"
            className={`${inputCls} text-right`}
          />
          {mode === 'detailed' && (
            <input
              type="number"
              value={item.discount}
              onChange={e => onUpdate(idx, 'discount', e.target.value)}
              min="0" max="100" step="any" placeholder="0"
              className={`${inputCls} text-center`}
            />
          )}
          <div className="px-2 py-2 bg-slate-50 dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-sm text-slate-700 dark:text-slate-200 text-right font-medium">
            {formatAmount(calculateItemAmount(item), currency)}
          </div>
          <button
            type="button"
            onClick={() => onRemove(idx)}
            disabled={items.length === 1}
            className="flex items-center justify-center w-8 h-8 text-slate-300 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-2 mt-1 text-sm text-emerald-600 hover:text-emerald-500 font-medium transition-colors group"
      >
        <span className="w-7 h-7 flex items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
          <Plus size={14} />
        </span>
        Add line item
      </button>
    </div>
  )
}
