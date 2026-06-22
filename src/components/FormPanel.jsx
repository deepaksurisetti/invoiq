import { useRef } from 'react'
import { Building2, User, Package, Calculator, FileText, CreditCard, Image, X, Palette } from 'lucide-react'
import CurrencySelect from './CurrencySelect.jsx'
import ItemsTable from './ItemsTable.jsx'

const ACCENT_PRESETS = ['#059669','#2563eb','#7c3aed','#db2777','#ea580c','#0891b2','#65a30d','#1e293b']

// SectionCard: no overflow-hidden — lets CurrencySelect dropdown escape the card boundary
function SectionCard({ icon: Icon, title, accent, children }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
      <div
        className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100 dark:border-slate-700 rounded-t-xl"
        style={{ borderLeftColor: accent, borderLeftWidth: 3 }}
      >
        <Icon size={15} style={{ color: accent }} />
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

const inputCls = 'px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-sm w-full'
const labelCls = 'text-xs font-medium text-slate-500 dark:text-slate-400'

function InputField({ label, type = 'text', value, onChange, placeholder, required, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className={labelCls}>{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>}
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={`${inputCls} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputCls}
        />
      )}
    </div>
  )
}

function AccentPicker({ accentColor, updateField }) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {ACCENT_PRESETS.map(color => (
        <button
          key={color}
          type="button"
          onClick={() => updateField('accentColor', color)}
          className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 shrink-0"
          style={{ backgroundColor: color, borderColor: accentColor === color ? '#1e293b' : 'transparent' }}
          title={color}
        />
      ))}
      <label className="flex items-center gap-1.5 ml-1 cursor-pointer">
        <input
          type="color"
          value={accentColor}
          onChange={e => updateField('accentColor', e.target.value)}
          className="w-7 h-7 rounded border-0 cursor-pointer"
        />
        <span className={`text-xs ${labelCls}`}>Custom</span>
      </label>
    </div>
  )
}

export default function FormPanel({ data, updateField, addItem, removeItem, updateItem }) {
  const { type, mode, number, date, dueDate, currency, from, to, items,
          tax, tax2, discount, shipping, notes, terms, paymentDetails, accentColor } = data
  const logoRef = useRef(null)

  function handleLogoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => updateField('from.logo', ev.target.result)
    reader.readAsDataURL(file)
  }

  const selectCls = `${inputCls} appearance-none`

  return (
    <div className="space-y-4">

      {/* Document Details */}
      <SectionCard icon={FileText} title="Document Details" accent={accentColor}>
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label={type === 'invoice' ? 'Invoice #' : type === 'quote' ? 'Quote #' : 'Estimate #'}
            value={number}
            onChange={v => updateField('number', v)}
            placeholder="INV-001"
          />
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Currency</label>
            <CurrencySelect value={currency} onChange={v => updateField('currency', v)} />
          </div>
          <InputField label="Date" type="date" value={date} onChange={v => updateField('date', v)} />
          {type === 'invoice' && (
            <InputField label="Due Date" type="date" value={dueDate} onChange={v => updateField('dueDate', v)} />
          )}
          {mode === 'detailed' && (
            <>
              <InputField label="PO Number" value={data.poNumber} onChange={v => updateField('poNumber', v)} placeholder="PO-12345" />
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Payment Terms</label>
                <select
                  value={data.paymentTerms}
                  onChange={e => updateField('paymentTerms', e.target.value)}
                  className={selectCls}
                >
                  {['Due on receipt','Net 7','Net 15','Net 30','Net 45','Net 60','Net 90'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </SectionCard>

      {/* Accent Color — visible in both modes */}
      <SectionCard icon={Palette} title="Accent Color" accent={accentColor}>
        <AccentPicker accentColor={accentColor} updateField={updateField} />
      </SectionCard>

      {/* From */}
      <SectionCard icon={Building2} title="From (Your Business)" accent={accentColor}>
        {mode === 'detailed' && (
          <div className="mb-3">
            <label className={`${labelCls} block mb-1.5`}>Logo</label>
            {from.logo ? (
              <div className="flex items-center gap-3">
                <img src={from.logo} alt="Logo" className="h-12 w-auto max-w-[120px] object-contain rounded border border-slate-200 dark:border-slate-600 p-1 bg-white dark:bg-slate-700" />
                <button type="button" onClick={() => updateField('from.logo', null)} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600">
                  <X size={12} /> Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => logoRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-xs text-slate-400 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
              >
                <Image size={13} /> Upload logo (PNG, JPG)
              </button>
            )}
            <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Name / Company" value={from.name} onChange={v => updateField('from.name', v)} placeholder="Acme Corp" className="col-span-2" />
          <InputField label="Email" type="email" value={from.email} onChange={v => updateField('from.email', v)} placeholder="hello@acme.com" />
          <InputField label="Phone" value={from.phone} onChange={v => updateField('from.phone', v)} placeholder="+91 98765 43210" />
          <InputField label="Address" value={from.address} onChange={v => updateField('from.address', v)} placeholder="123 Main St" className="col-span-2" />
          {mode === 'detailed' && (
            <>
              <InputField label="City" value={from.city} onChange={v => updateField('from.city', v)} placeholder="Chennai" />
              <InputField label="State" value={from.state} onChange={v => updateField('from.state', v)} placeholder="Tamil Nadu" />
              <InputField label="ZIP / Postal" value={from.zip} onChange={v => updateField('from.zip', v)} placeholder="600001" />
              <InputField label="Country" value={from.country} onChange={v => updateField('from.country', v)} placeholder="India" />
            </>
          )}
        </div>
      </SectionCard>

      {/* Bill To */}
      <SectionCard icon={User} title="Bill To" accent={accentColor}>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Name / Company" value={to.name} onChange={v => updateField('to.name', v)} placeholder="Client Co" className="col-span-2" />
          <InputField label="Email" type="email" value={to.email} onChange={v => updateField('to.email', v)} placeholder="client@example.com" />
          <InputField label="Phone" value={to.phone} onChange={v => updateField('to.phone', v)} placeholder="+1 555-0100" />
          <InputField label="Address" value={to.address} onChange={v => updateField('to.address', v)} placeholder="456 Oak Ave" className="col-span-2" />
          {mode === 'detailed' && (
            <>
              <InputField label="City" value={to.city} onChange={v => updateField('to.city', v)} placeholder="Mumbai" />
              <InputField label="State" value={to.state} onChange={v => updateField('to.state', v)} placeholder="Maharashtra" />
              <InputField label="ZIP / Postal" value={to.zip} onChange={v => updateField('to.zip', v)} placeholder="400001" />
              <InputField label="Country" value={to.country} onChange={v => updateField('to.country', v)} placeholder="India" />
            </>
          )}
        </div>
      </SectionCard>

      {/* Line Items */}
      <SectionCard icon={Package} title="Line Items" accent={accentColor}>
        <ItemsTable
          items={items}
          currency={currency}
          mode={mode}
          onAdd={addItem}
          onRemove={removeItem}
          onUpdate={updateItem}
        />
      </SectionCard>

      {/* Tax & Totals */}
      <SectionCard icon={Calculator} title="Taxes & Totals" accent={accentColor}>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Tax Name" value={tax.name} onChange={v => updateField('tax.name', v)} placeholder="GST / VAT / Tax" />
          <InputField label="Rate (%)" type="number" value={tax.rate} onChange={v => updateField('tax.rate', v)} placeholder="18" />

          {mode === 'detailed' && (
            <>
              <div className="col-span-2 flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="tax2toggle"
                  checked={tax2.enabled}
                  onChange={e => updateField('tax2.enabled', e.target.checked)}
                  className="accent-emerald-600 w-4 h-4"
                />
                <label htmlFor="tax2toggle" className={`${labelCls} cursor-pointer`}>Enable second tax</label>
              </div>
              {tax2.enabled && (
                <>
                  <InputField label="Tax 2 Name" value={tax2.name} onChange={v => updateField('tax2.name', v)} placeholder="VAT" />
                  <InputField label="Tax 2 Rate (%)" type="number" value={tax2.rate} onChange={v => updateField('tax2.rate', v)} placeholder="0" />
                </>
              )}
              <div className="col-span-2 border-t border-slate-100 dark:border-slate-700 pt-3 mt-1">
                <label className={`${labelCls} block mb-2`}>Discount</label>
                <div className="flex gap-2 items-center">
                  <select
                    value={discount.type}
                    onChange={e => updateField('discount.type', e.target.value)}
                    className="px-2 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat amount</option>
                  </select>
                  <input
                    type="number"
                    value={discount.value}
                    onChange={e => updateField('discount.value', e.target.value)}
                    min="0" step="any" placeholder="0"
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
              <InputField label="Shipping" type="number" value={shipping} onChange={v => updateField('shipping', v)} placeholder="0.00" />
            </>
          )}
        </div>
      </SectionCard>

      {/* Notes */}
      <SectionCard icon={FileText} title="Notes" accent={accentColor}>
        <InputField type="textarea" value={notes} onChange={v => updateField('notes', v)} placeholder="Thank you for your business!" />
      </SectionCard>

      {/* Detailed-only sections */}
      {mode === 'detailed' && (
        <>
          <SectionCard icon={FileText} title="Terms & Conditions" accent={accentColor}>
            <InputField type="textarea" value={terms} onChange={v => updateField('terms', v)} placeholder="Payment due within 30 days. Late payments subject to 1.5% monthly interest..." />
          </SectionCard>
          <SectionCard icon={CreditCard} title="Payment / Bank Details" accent={accentColor}>
            <InputField type="textarea" value={paymentDetails} onChange={v => updateField('paymentDetails', v)} placeholder={`Bank: HDFC Bank\nAccount: 1234567890\nIFSC: HDFC0001234\nUPI: business@upi`} />
          </SectionCard>
        </>
      )}
    </div>
  )
}
