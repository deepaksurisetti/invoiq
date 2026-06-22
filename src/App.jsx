import { useState } from 'react'
import Header from './components/Header.jsx'
import FormPanel from './components/FormPanel.jsx'
import PreviewPanel from './components/PreviewPanel.jsx'
import { exportPDF } from './utils/pdfExport.js'
import { exportCSV } from './utils/csvExport.js'

const DEFAULT_STATE = {
  type: 'invoice',
  mode: 'simple',
  number: 'INV-001',
  date: new Date().toISOString().slice(0, 10),
  dueDate: '',
  poNumber: '',
  paymentTerms: 'Net 30',
  currency: 'USD',
  from: {
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    logo: null,
  },
  to: {
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  },
  items: [{ id: 1, description: '', quantity: 1, rate: 0, discount: 0 }],
  discount: { type: 'percentage', value: 0 },
  tax: { name: 'Tax', rate: 0 },
  tax2: { name: 'VAT', rate: 0, enabled: false },
  shipping: 0,
  notes: '',
  terms: '',
  paymentDetails: '',
  accentColor: '#059669',
}

let itemIdCounter = 2

export default function App() {
  const [data, setData] = useState(DEFAULT_STATE)
  const [mobileView, setMobileView] = useState('form')

  function updateField(path, value) {
    const parts = path.split('.')
    setData(prev => {
      const next = { ...prev }
      if (parts.length === 1) {
        next[parts[0]] = value
      } else if (parts.length === 2) {
        next[parts[0]] = { ...prev[parts[0]], [parts[1]]: value }
      } else if (parts.length === 3) {
        next[parts[0]] = {
          ...prev[parts[0]],
          [parts[1]]: { ...prev[parts[0]][parts[1]], [parts[2]]: value },
        }
      }
      return next
    })
  }

  function addItem() {
    setData(prev => ({
      ...prev,
      items: [...prev.items, { id: itemIdCounter++, description: '', quantity: 1, rate: 0, discount: 0 }],
    }))
  }

  function removeItem(idx) {
    setData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }))
  }

  function updateItem(idx, field, value) {
    setData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === idx ? { ...item, [field]: value } : item),
    }))
  }

  function handleTypeChange(newType) {
    const prefix = newType === 'invoice' ? 'INV' : newType === 'quote' ? 'QUO' : 'EST'
    setData(prev => ({
      ...prev,
      type: newType,
      number: `${prefix}-001`,
    }))
  }

  function handleModeChange(newMode) {
    setData(prev => ({ ...prev, mode: newMode }))
  }

  function handleReset() {
    if (window.confirm('Reset all fields? This cannot be undone.')) {
      itemIdCounter = 2
      setData({ ...DEFAULT_STATE, date: new Date().toISOString().slice(0, 10) })
    }
  }

  function handleExportPDF() {
    exportPDF(data)
  }

  function handleExportCSV() {
    exportCSV(data)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        data={data}
        onTypeChange={handleTypeChange}
        onModeChange={handleModeChange}
        onExportPDF={handleExportPDF}
        onExportCSV={handleExportCSV}
        onReset={handleReset}
        mobileView={mobileView}
        setMobileView={setMobileView}
      />

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Form panel */}
          <div className={`${mobileView === 'preview' ? 'hidden' : 'block'} md:block w-full md:w-[45%] shrink-0`}>
            <div className="sticky top-[64px] max-h-[calc(100vh-80px)] overflow-y-auto scrollbar-thin pr-1 pb-6">
              <FormPanel
                data={data}
                updateField={updateField}
                addItem={addItem}
                removeItem={removeItem}
                updateItem={updateItem}
              />
            </div>
          </div>

          {/* Preview panel */}
          <div className={`${mobileView === 'form' ? 'hidden' : 'block'} md:block flex-1 min-w-0`}>
            <div className="sticky top-[64px] max-h-[calc(100vh-80px)] overflow-y-auto scrollbar-thin pb-6">
              <div className="mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-slate-400 font-medium">Live preview</span>
              </div>
              <PreviewPanel data={data} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
