import { Plus, Trash2 } from 'lucide-react'
import { calculateItemAmount } from '../utils/calculations.js'
import { formatAmount } from '../data/currencies.js'

export default function ItemsTable({ items, currency, mode, onAdd, onRemove, onUpdate }) {
  return (
    <div className="space-y-2">
      {/* Column headers */}
      <div className={`grid gap-2 px-1 ${mode === 'detailed' ? 'grid-cols-[1fr_70px_90px_70px_80px_32px]' : 'grid-cols-[1fr_70px_90px_80px_32px]'}`}>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</span>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">Qty</span>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Rate</span>
        {mode === 'detailed' && <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">Disc%</span>}
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Amount</span>
        <span></span>
      </div>

      {/* Item rows */}
      {items.map((item, idx) => (
        <div key={item.id} className={`grid gap-2 items-center ${mode === 'detailed' ? 'grid-cols-[1fr_70px_90px_70px_80px_32px]' : 'grid-cols-[1fr_70px_90px_80px_32px]'}`}>
          <input
            type="text"
            value={item.description}
            onChange={e => onUpdate(idx, 'description', e.target.value)}
            placeholder={`Item ${idx + 1}`}
            className="px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
          />
          <input
            type="number"
            value={item.quantity}
            onChange={e => onUpdate(idx, 'quantity', e.target.value)}
            min="0"
            step="any"
            className="px-2 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
          />
          <input
            type="number"
            value={item.rate}
            onChange={e => onUpdate(idx, 'rate', e.target.value)}
            min="0"
            step="any"
            placeholder="0.00"
            className="px-2 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
          />
          {mode === 'detailed' && (
            <input
              type="number"
              value={item.discount}
              onChange={e => onUpdate(idx, 'discount', e.target.value)}
              min="0"
              max="100"
              step="any"
              placeholder="0"
              className="px-2 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
            />
          )}
          <div className="px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 text-right font-medium">
            {formatAmount(calculateItemAmount(item), currency)}
          </div>
          <button
            type="button"
            onClick={() => onRemove(idx)}
            disabled={items.length === 1}
            className="flex items-center justify-center w-8 h-8 text-slate-300 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-md hover:bg-red-50"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-2 mt-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors group"
      >
        <span className="w-7 h-7 flex items-center justify-center rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
          <Plus size={14} />
        </span>
        Add line item
      </button>
    </div>
  )
}
