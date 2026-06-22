import { FileText, Download, Table, RotateCcw, Eye, Edit3 } from 'lucide-react'

const DOC_TYPES = [
  { value: 'invoice', label: 'Invoice' },
  { value: 'quote', label: 'Quote' },
  { value: 'estimate', label: 'Estimate' },
]

export default function Header({ data, onTypeChange, onModeChange, onExportPDF, onExportCSV, onReset, mobileView, setMobileView }) {
  const { type, mode } = data

  return (
    <header className="bg-slate-900 shadow-lg sticky top-0 z-40">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">

        {/* Brand */}
        <div className="flex items-center gap-2 mr-2">
          <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
            <FileText size={15} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">InvoiQ</span>
        </div>

        {/* Doc type tabs */}
        <div className="flex items-center bg-slate-800 rounded-lg p-0.5 gap-0.5">
          {DOC_TYPES.map(dt => (
            <button
              key={dt.value}
              onClick={() => onTypeChange(dt.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${type === dt.value ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              {dt.label}
            </button>
          ))}
        </div>

        {/* Mode toggle */}
        <div className="flex items-center bg-slate-800 rounded-lg p-0.5 gap-0.5">
          {['simple', 'detailed'].map(m => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all capitalize ${mode === m ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Mobile view toggle */}
        <div className="flex md:hidden items-center bg-slate-800 rounded-lg p-0.5 gap-0.5">
          <button
            onClick={() => setMobileView('form')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${mobileView === 'form' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}
          >
            <Edit3 size={12} /> Form
          </button>
          <button
            onClick={() => setMobileView('preview')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${mobileView === 'preview' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}
          >
            <Eye size={12} /> Preview
          </button>
        </div>

        {/* Actions */}
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          title="Reset form"
        >
          <RotateCcw size={13} /> Reset
        </button>

        <button
          onClick={onExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold transition-all"
        >
          <Table size={13} /> CSV
        </button>

        <button
          onClick={onExportPDF}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
        >
          <Download size={13} /> PDF
        </button>
      </div>
    </header>
  )
}
