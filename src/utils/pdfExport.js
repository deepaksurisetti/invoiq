import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { getCurrency } from '../data/currencies.js'
import { calculateTotals, calculateItemAmount } from './calculations.js'

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [5, 150, 105]
}

/**
 * jsPDF uses WinAnsi (Windows-1252) encoding for built-in fonts.
 * Characters above U+00FF (e.g. ₹ U+20B9, ₩ U+20A9, ₺ U+20BA, ₴ U+20B4, ₮ U+20AE)
 * render as blank boxes. Fall back to the ISO currency code in those cases.
 * € (U+20AC) maps to 0x80 in Win-1252 and IS supported by jsPDF.
 */
function pdfFmt(amount, currencyCode) {
  const num = parseFloat(amount) || 0
  const currency = getCurrency(currencyCode)
  const rawSymbol = currency?.symbol || currencyCode

  // Decide prefix: use symbol only if every character is within Win-1252 range
  const isWin1252Safe = [...rawSymbol].every(ch => {
    const code = ch.charCodeAt(0)
    return code <= 255 || ch === '€'
  })
  const prefix = isWin1252Safe ? rawSymbol : `${currencyCode} `

  const [intPart, decPart] = num.toFixed(2).split('.')
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${prefix}${formatted}.${decPart}`
}

export function exportPDF(data) {
  const { type, number, date, dueDate, currency, from, to, items,
          tax, tax2, discount, shipping, notes, terms, paymentDetails,
          mode, accentColor } = data
  const totals = calculateTotals(data)
  const fmt = (n) => pdfFmt(n, currency)
  const accent = hexToRgb(accentColor || '#059669')
  const label = type === 'invoice' ? 'Invoice' : type === 'quote' ? 'Quote' : 'Estimate'

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 15
  const contentW = pageW - margin * 2

  // ── Header band ──────────────────────────────────────────────────
  doc.setFillColor(...accent)
  doc.rect(0, 0, pageW, 38, 'F')

  let logoEndX = margin
  if (from.logo) {
    try {
      doc.addImage(from.logo, 'PNG', margin, 6, 26, 26)
      logoEndX = margin + 30
    } catch (_) {}
  }

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(from.name || 'Your Company', logoEndX, 16)

  if (from.email) {
    doc.setFontSize(8); doc.setFont('helvetica', 'normal')
    doc.text(from.email, logoEndX, 22)
  }
  if (from.phone) {
    doc.setFontSize(8)
    doc.text(from.phone, logoEndX, 27)
  }

  doc.setFontSize(22); doc.setFont('helvetica', 'bold')
  doc.text(label.toUpperCase(), pageW - margin, 16, { align: 'right' })
  doc.setFontSize(9); doc.setFont('helvetica', 'normal')
  doc.text(`#${number || '001'}`, pageW - margin, 23, { align: 'right' })

  // ── Dates row ─────────────────────────────────────────────────────
  let y = 46
  doc.setTextColor(80, 80, 80)
  doc.setFontSize(9)
  doc.text(`Date: ${date || '\u2014'}`, margin, y)
  if (type === 'invoice' && dueDate) doc.text(`Due Date: ${dueDate}`, margin + 60, y)
  if (mode === 'detailed' && data.poNumber) doc.text(`PO #: ${data.poNumber}`, margin + 120, y)
  if (mode === 'detailed' && data.paymentTerms) doc.text(`Terms: ${data.paymentTerms}`, pageW - margin, y, { align: 'right' })

  // ── From / Bill To ────────────────────────────────────────────────
  y += 10
  const colW = contentW / 2 - 5

  const drawParty = (label2, party, x) => {
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(x, y, colW, 32, 2, 2, 'F')
    doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(...accent)
    doc.text(label2, x + 4, y + 6)
    doc.setTextColor(30, 30, 30); doc.setFontSize(9); doc.setFont('helvetica', 'bold')
    doc.text(party.name || '\u2014', x + 4, y + 12)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8)
    const lines = [
      party.address,
      mode === 'detailed' && party.city && `${party.city}${party.state ? ', ' + party.state : ''} ${party.zip || ''}`.trim(),
      mode === 'detailed' && party.country,
    ].filter(Boolean)
    lines.forEach((line, i) => doc.text(String(line), x + 4, y + 18 + i * 5))
  }

  drawParty('FROM', from, margin)
  drawParty('BILL TO', to, margin + colW + 10)

  // ── Items table ───────────────────────────────────────────────────
  y += 38

  const tableColumns = mode === 'detailed'
    ? [
        { header: 'Description', dataKey: 'desc' },
        { header: 'Qty',         dataKey: 'qty'  },
        { header: 'Rate',        dataKey: 'rate' },
        { header: 'Disc %',      dataKey: 'disc' },
        { header: 'Amount',      dataKey: 'amount' },
      ]
    : [
        { header: 'Description', dataKey: 'desc' },
        { header: 'Qty',         dataKey: 'qty'  },
        { header: 'Rate',        dataKey: 'rate' },
        { header: 'Amount',      dataKey: 'amount' },
      ]

  const tableRows = items.map(item => ({
    desc:   item.description || '',
    qty:    String(item.quantity || 0),
    rate:   fmt(item.rate || 0),
    disc:   `${item.discount || 0}%`,
    amount: fmt(calculateItemAmount(item)),
  }))

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    columns: tableColumns,
    body: tableRows,
    headStyles: { fillColor: accent, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      desc:   { cellWidth: 'auto' },
      qty:    { halign: 'center', cellWidth: 18 },
      rate:   { halign: 'right',  cellWidth: 32 },
      disc:   { halign: 'center', cellWidth: 18 },
      amount: { halign: 'right',  cellWidth: 32 },
    },
    styles: { overflow: 'linebreak', cellPadding: 3 },
  })

  // ── Totals box ────────────────────────────────────────────────────
  let ty = doc.lastAutoTable.finalY + 6
  const boxW = 82
  const boxX = pageW - margin - boxW

  const totalRows = []
  totalRows.push(['Subtotal', fmt(totals.subtotal)])
  if (mode === 'detailed' && totals.discountAmount > 0) {
    const dl = discount.type === 'percentage' ? `Discount (${discount.value}%)` : 'Discount'
    totalRows.push([dl, `-${fmt(totals.discountAmount)}`])
  }
  if (totals.taxAmount > 0)  totalRows.push([`${tax.name} (${tax.rate}%)`, fmt(totals.taxAmount)])
  if (mode === 'detailed' && tax2.enabled && totals.tax2Amount > 0)
    totalRows.push([`${tax2.name} (${tax2.rate}%)`, fmt(totals.tax2Amount)])
  if (mode === 'detailed' && totals.shippingAmount > 0)
    totalRows.push(['Shipping', fmt(totals.shippingAmount)])

  autoTable(doc, {
    startY: ty,
    margin: { left: boxX, right: margin },
    tableWidth: boxW,
    body: totalRows,
    bodyStyles: { fontSize: 8, textColor: [50, 50, 50], cellPadding: 2 },
    columnStyles: { 0: { cellWidth: 46 }, 1: { halign: 'right', cellWidth: 36 } },
    styles: { overflow: 'linebreak' },
    theme: 'plain',
  })

  const totalY = doc.lastAutoTable.finalY + 1
  doc.setFillColor(...accent)
  doc.rect(boxX, totalY, boxW, 9, 'F')
  doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.setFont('helvetica', 'bold')
  doc.text(`TOTAL (${currency})`, boxX + 3, totalY + 6)
  doc.text(fmt(totals.total), pageW - margin - 2, totalY + 6, { align: 'right' })

  // ── Notes / Terms / Payment ───────────────────────────────────────
  let ny = totalY + 16

  const printSection = (heading, body) => {
    if (!body) return
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...accent)
    doc.text(heading, margin, ny); ny += 5
    doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 80, 80)
    const lines = doc.splitTextToSize(body, contentW)
    doc.text(lines, margin, ny); ny += lines.length * 4 + 4
  }

  printSection('Notes', notes)
  if (mode === 'detailed') {
    printSection('Terms & Conditions', terms)
    printSection('Payment Details', paymentDetails)
  }

  // ── Footer ────────────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight()
  doc.setFontSize(7); doc.setTextColor(160, 160, 160); doc.setFont('helvetica', 'normal')
  doc.text('Generated by InvoiQ', pageW / 2, pageH - 6, { align: 'center' })

  doc.save(`${label}-${number || '001'}.pdf`)
}
