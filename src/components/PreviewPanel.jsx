import { calculateTotals, calculateItemAmount } from '../utils/calculations.js'
import { formatAmount } from '../data/currencies.js'

export default function PreviewPanel({ data }) {
  const { type, number, date, dueDate, currency, from, to, items, tax, tax2, discount, shipping, notes, terms, paymentDetails, mode, accentColor, poNumber, paymentTerms } = data
  const totals = calculateTotals(data)
  const fmt = n => formatAmount(n, currency)
  const label = type === 'invoice' ? 'Invoice' : type === 'quote' ? 'Quote' : 'Estimate'

  return (
    <div id="preview-root" className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-sm font-sans" style={{ fontFamily: 'Inter, sans-serif', minHeight: 600 }}>

      {/* Header */}
      <div style={{ background: accentColor, padding: '20px 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {mode === 'detailed' && from.logo && (
            <img src={from.logo} alt="Logo" style={{ height: 48, width: 'auto', maxWidth: 100, objectFit: 'contain', background: 'rgba(255,255,255,0.15)', borderRadius: 6, padding: 4 }} />
          )}
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>{from.name || 'Your Company'}</div>
            {from.email && <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 3 }}>{from.email}</div>}
            {from.phone && <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 1 }}>{from.phone}</div>}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px' }}>{label.toUpperCase()}</div>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 }}>#{number || '001'}</div>
        </div>
      </div>

      <div style={{ padding: '20px 24px' }}>

        {/* Dates row */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 16, fontSize: 12, color: '#64748b' }}>
          <span><strong style={{ color: '#334155' }}>Date:</strong> {date || '—'}</span>
          {type === 'invoice' && dueDate && <span><strong style={{ color: '#334155' }}>Due:</strong> {dueDate}</span>}
          {mode === 'detailed' && poNumber && <span><strong style={{ color: '#334155' }}>PO #:</strong> {poNumber}</span>}
          {mode === 'detailed' && paymentTerms && <span><strong style={{ color: '#334155' }}>Terms:</strong> {paymentTerms}</span>}
        </div>

        {/* From / To */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px', borderLeft: `3px solid ${accentColor}` }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>From</div>
            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 13 }}>{from.name || '—'}</div>
            {from.address && <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>{from.address}</div>}
            {(from.city || from.state) && mode === 'detailed' && (
              <div style={{ color: '#64748b', fontSize: 11 }}>{[from.city, from.state, from.zip].filter(Boolean).join(', ')}</div>
            )}
            {from.country && mode === 'detailed' && <div style={{ color: '#64748b', fontSize: 11 }}>{from.country}</div>}
          </div>

          <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px', borderLeft: `3px solid ${accentColor}` }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>Bill To</div>
            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 13 }}>{to.name || '—'}</div>
            {to.email && <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>{to.email}</div>}
            {to.address && <div style={{ color: '#64748b', fontSize: 11, marginTop: 1 }}>{to.address}</div>}
            {(to.city || to.state) && mode === 'detailed' && (
              <div style={{ color: '#64748b', fontSize: 11 }}>{[to.city, to.state, to.zip].filter(Boolean).join(', ')}</div>
            )}
            {to.country && mode === 'detailed' && <div style={{ color: '#64748b', fontSize: 11 }}>{to.country}</div>}
          </div>
        </div>

        {/* Items table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16, fontSize: 12 }}>
          <thead>
            <tr style={{ background: accentColor }}>
              <th style={{ color: '#fff', textAlign: 'left', padding: '8px 10px', fontWeight: 600, borderRadius: '6px 0 0 0' }}>Description</th>
              <th style={{ color: '#fff', textAlign: 'center', padding: '8px 10px', fontWeight: 600, whiteSpace: 'nowrap' }}>Qty</th>
              <th style={{ color: '#fff', textAlign: 'right', padding: '8px 10px', fontWeight: 600, whiteSpace: 'nowrap' }}>Rate</th>
              {mode === 'detailed' && <th style={{ color: '#fff', textAlign: 'center', padding: '8px 10px', fontWeight: 600, whiteSpace: 'nowrap' }}>Disc%</th>}
              <th style={{ color: '#fff', textAlign: 'right', padding: '8px 10px', fontWeight: 600, whiteSpace: 'nowrap', borderRadius: '0 6px 0 0' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id} style={{ background: i % 2 === 1 ? '#f8fafc' : '#fff' }}>
                <td style={{ padding: '8px 10px', color: '#334155' }}>{item.description || <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                <td style={{ padding: '8px 10px', color: '#334155', textAlign: 'center' }}>{item.quantity || 0}</td>
                <td style={{ padding: '8px 10px', color: '#334155', textAlign: 'right' }}>{fmt(item.rate || 0)}</td>
                {mode === 'detailed' && <td style={{ padding: '8px 10px', color: '#334155', textAlign: 'center' }}>{item.discount || 0}%</td>}
                <td style={{ padding: '8px 10px', color: '#334155', textAlign: 'right', fontWeight: 500 }}>{fmt(calculateItemAmount(item))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
          <div style={{ width: 240 }}>
            <TotalRow label="Subtotal" value={fmt(totals.subtotal)} />
            {mode === 'detailed' && totals.discountAmount > 0 && (
              <TotalRow label={discount.type === 'percentage' ? `Discount (${discount.value}%)` : 'Discount'} value={`−${fmt(totals.discountAmount)}`} />
            )}
            {totals.taxAmount > 0 && <TotalRow label={`${tax.name} (${tax.rate}%)`} value={fmt(totals.taxAmount)} />}
            {mode === 'detailed' && tax2.enabled && totals.tax2Amount > 0 && (
              <TotalRow label={`${tax2.name} (${tax2.rate}%)`} value={fmt(totals.tax2Amount)} />
            )}
            {mode === 'detailed' && totals.shippingAmount > 0 && <TotalRow label="Shipping" value={fmt(totals.shippingAmount)} />}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', background: accentColor, borderRadius: 6, marginTop: 4 }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>TOTAL ({currency})</span>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{fmt(totals.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Notes</div>
            <div style={{ color: '#64748b', fontSize: 11, whiteSpace: 'pre-wrap' }}>{notes}</div>
          </div>
        )}

        {mode === 'detailed' && terms && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Terms & Conditions</div>
            <div style={{ color: '#64748b', fontSize: 11, whiteSpace: 'pre-wrap' }}>{terms}</div>
          </div>
        )}

        {mode === 'detailed' && paymentDetails && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Payment Details</div>
            <div style={{ color: '#64748b', fontSize: 11, whiteSpace: 'pre-wrap' }}>{paymentDetails}</div>
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 20, paddingTop: 10, textAlign: 'center', fontSize: 10, color: '#94a3b8' }}>
          Generated by InvoiQ
        </div>
      </div>
    </div>
  )
}

function TotalRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 12px', fontSize: 12, color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>
      <span>{label}</span>
      <span style={{ fontWeight: 500, color: '#334155' }}>{value}</span>
    </div>
  )
}
