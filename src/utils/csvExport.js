import { formatAmount, getCurrency } from '../data/currencies.js'
import { calculateTotals, calculateItemAmount } from './calculations.js'

function esc(val) {
  const str = String(val ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function row(...cols) {
  return cols.map(esc).join(',')
}

export function exportCSV(data) {
  const { type, number, date, dueDate, currency, from, to, items, tax, tax2, discount, shipping, notes, terms, paymentDetails, mode } = data
  const cur = getCurrency(currency)
  const totals = calculateTotals(data)
  const fmt = (n) => formatAmount(n, currency)

  const label = type === 'invoice' ? 'Invoice' : type === 'quote' ? 'Quote' : 'Estimate'

  const lines = []

  // Header section
  lines.push(row('Document Type', label))
  lines.push(row('Number', number))
  lines.push(row('Date', date))
  if (type === 'invoice') lines.push(row('Due Date', dueDate))
  lines.push(row('Currency', `${currency} (${cur?.symbol})`))
  lines.push(row(''))

  // From / To
  lines.push(row('FROM', 'TO'))
  lines.push(row(from.name, to.name))
  lines.push(row(from.email, to.email))
  lines.push(row(from.phone, to.phone))
  lines.push(row(from.address, to.address))
  if (mode === 'detailed') {
    lines.push(row(`${from.city}${from.city && from.state ? ', ' : ''}${from.state} ${from.zip}`.trim(), `${to.city}${to.city && to.state ? ', ' : ''}${to.state} ${to.zip}`.trim()))
    lines.push(row(from.country, to.country))
  }
  lines.push(row(''))

  // Items header
  if (mode === 'detailed') {
    lines.push(row('Description', 'Qty', 'Rate', 'Discount %', 'Amount'))
  } else {
    lines.push(row('Description', 'Qty', 'Rate', 'Amount'))
  }

  items.forEach(item => {
    const amount = calculateItemAmount(item)
    if (mode === 'detailed') {
      lines.push(row(item.description, item.quantity, fmt(item.rate), `${item.discount || 0}%`, fmt(amount)))
    } else {
      lines.push(row(item.description, item.quantity, fmt(item.rate), fmt(amount)))
    }
  })

  lines.push(row(''))

  // Totals
  lines.push(row('Subtotal', fmt(totals.subtotal)))
  if (mode === 'detailed' && totals.discountAmount > 0) {
    const discLabel = discount.type === 'percentage' ? `Discount (${discount.value}%)` : 'Discount'
    lines.push(row(discLabel, `-${fmt(totals.discountAmount)}`))
  }
  if (totals.taxAmount > 0) {
    lines.push(row(`${tax.name} (${tax.rate}%)`, fmt(totals.taxAmount)))
  }
  if (mode === 'detailed' && tax2.enabled && totals.tax2Amount > 0) {
    lines.push(row(`${tax2.name} (${tax2.rate}%)`, fmt(totals.tax2Amount)))
  }
  if (mode === 'detailed' && totals.shippingAmount > 0) {
    lines.push(row('Shipping', fmt(totals.shippingAmount)))
  }
  lines.push(row(`TOTAL (${currency})`, fmt(totals.total)))

  // Notes / Terms / Payment
  if (notes) { lines.push(row('')); lines.push(row('Notes', notes)) }
  if (mode === 'detailed') {
    if (terms) { lines.push(row('')); lines.push(row('Terms & Conditions', terms)) }
    if (paymentDetails) { lines.push(row('')); lines.push(row('Payment Details', paymentDetails)) }
  }

  const csvContent = lines.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${label}-${number || '001'}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
