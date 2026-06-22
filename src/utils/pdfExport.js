import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatAmount, getCurrency } from '../data/currencies.js'
import { calculateTotals, calculateItemAmount } from './calculations.js'

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [5, 150, 105]
}

export function exportPDF(data) {
  const { type, number, date, dueDate, currency, from, to, items, tax, tax2, discount, shipping, notes, terms, paymentDetails, mode, accentColor } = data
  const totals = calculateTotals(data)
  const fmt = (n) => formatAmount(n, currency)
  const cur = getCurrency(currency)
  const accent = hexToRgb(accentColor || '#059669')
  const label = type === 'invoice' ? 'Invoice' : type === 'quote' ? 'Quote' : 'Estimate'

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 15
  const contentW = pageW - margin * 2

  // ── Header band ──────────────────────────────────────────────────
  doc.setFillColor(...accent)
  doc.rect(0, 0, pageW, 38, 'F')

  // Logo (if present)
  let logoEndX = margin
  if (from.logo) {
    try {
      doc.addImage(from.logo, 'PNG', margin, 6, 26, 26)
      logoEndX = margin + 30
    } catch (_) {}
  }

  // Company name in header
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(from.name || 'Your Company', logoEndX, 16)

  if (from.email) {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(from.email, logoEndX, 22)
  }
  if (from.phone) {
    doc.setFontSize(8)
    doc.text(from.phone, logoEndX, 27)
  }

  // Document type + number (right side of header)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text(label.toUpperCase(), pageW - margin, 16, { align: 'right' })
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`#${number || '001'}`, pageW - margin, 23, { align: 'right' })

  // ── Date row ─────────────────────────────────────────────────────
  let y = 46
  doc.setTextColor(80, 80, 80)
  doc.setFontSize(9)
  doc.text(`Date: ${date || '—'}`, margin, y)
  if (type === 'invoice' && dueDate) {
    doc.text(`Due Date: ${dueDate}`, margin + 60, y)
  }
  if (mode === 'detailed' && data.poNumber) {
    doc.text(`PO #: ${data.poNumber}`, margin + 120, y)
  }
  if (mode === 'detailed' && data.paymentTerms) {
    doc.text(`Terms: ${data.paymentTerms}`, pageW - margin, y, { align: 'right' })
  }

  // ── From / Bill To ───────────────────────────────────────────────
  y += 10
  const colW = contentW / 2 - 5

  // From box
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(margin, y, colW, 32, 2, 2, 'F')
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...accent)
  doc.text('FROM', margin + 4, y + 6)
  doc.setTextColor(30, 30, 30)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(from.name || '—', margin + 4, y + 12)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  const fromLines = [from.address, from.city && `${from.city}${from.state ? ', ' + from.state : ''} ${from.zip || ''}`.trim(), from.country].filter(Boolean)
  fromLines.forEach((line, i) => doc.text(String(line), margin + 4, y + 18 + i * 5))

  // To box
  const toX = margin + colW + 10
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(toX, y, colW, 32, 2, 2, 'F')
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...accent)
  doc.text('BILL TO', toX + 4, y + 6)
  doc.setTextColor(30, 30, 30)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(to.name || '—', toX + 4, y + 12)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  const toLines = [to.address, to.city && `${to.city}${to.state ? ', ' + to.state : ''} ${to.zip || ''}`.trim(), to.country].filter(Boolean)
  toLines.forEach((line, i) => doc.text(String(line), toX + 4, y + 18 + i * 5))

  // ── Items table ──────────────────────────────────────────────────
  y += 38

  const tableColumns = mode === 'detailed'
    ? [
        { header: 'Description', dataKey: 'desc' },
        { header: 'Qty', dataKey: 'qty' },
        { header: 'Rate', dataKey: 'rate' },
        { header: 'Disc %', dataKey: 'disc' },
        { header: 'Amount', dataKey: 'amount' },
      ]
    : [
        { header: 'Description', dataKey: 'desc' },
        { header: 'Qty', dataKey: 'qty' },
        { header: 'Rate', dataKey: 'rate' },
        { header: 'Amount', dataKey: 'amount' },
      ]

  const tableRows = items.map(item => ({
    desc: item.description || '',
    qty: String(item.quantity || 0),
    rate: fmt(item.rate || 0),
    disc: mode === 'detailed' ? `${item.discount || 0}%` : undefined,
    amount: fmt(calculateItemAmount(item)),
  }))

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    columns: tableColumns,
    body: tableRows,
    headStyles: {
      fillColor: accent,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      desc: { cellWidth: 'auto' },
      qty: { halign: 'center', cellWidth: 18 },
      rate: { halign: 'right', cellWidth: 30 },
      disc: { halign: 'center', cellWidth: 18 },
      amount: { halign: 'right', cellWidth: 32 },
    },
    styles: { overflow: 'linebreak', cellPadding: 3 },
  })

  // ── Totals box ───────────────────────────────────────────────────
  let ty = doc.lastAutoTable.finalY + 6
  const boxW = 80
  const boxX = pageW - margin - boxW

  const totalRows = []
  totalRows.push(['Subtotal', fmt(totals.subtotal)])
  if (mode === 'detailed' && totals.discountAmount > 0) {
    const dl = discount.type === 'percentage' ? `Discount (${discount.value}%)` : 'Discount'
    totalRows.push([dl, `-${fmt(totals.discountAmount)}`])
  }
  if (totals.taxAmount > 0) totalRows.push([`${tax.name} (${tax.rate}%)`, fmt(totals.taxAmount)])
  if (mode === 'detailed' && tax2.enabled && totals.tax2Amount > 0) {
    totalRows.push([`${tax2.name} (${tax2.rate}%)`, fmt(totals.tax2Amount)])
  }
  if (mode === 'detailed' && totals.shippingAmount > 0) {
    totalRows.push(['Shipping', fmt(totals.shippingAmount)])
  }

  autoTable(doc, {
    startY: ty,
    margin: { left: boxX, right: margin },
    tableWidth: boxW,
    body: totalRows,
    bodyStyles: { fontSize: 8, textColor: [50, 50, 50], cellPadding: 2 },
    columnStyles: { 0: { cellWidth: 44 }, 1: { halign: 'right', cellWidth: 36 } },
    styles: { overflow: 'linebreak' },
    theme: 'plain',
  })

  // Total row highlighted
  const totalY = doc.lastAutoTable.finalY + 1
  doc.setFillColor(...accent)
  doc.rect(boxX, totalY, boxW, 9, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(`TOTAL (${currency})`, boxX + 3, totalY + 6)
  doc.text(fmt(totals.total), pageW - margin - 2, totalY + 6, { align: 'right' })

  // ── Notes / Terms / Payment ───────────────────────────────────────
  let ny = totalY + 16
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 80)
  doc.setFontSize(8)

  if (notes) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...accent)
    doc.text('Notes', margin, ny)
    ny += 5
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    const noteLines = doc.splitTextToSize(notes, contentW)
    doc.text(noteLines, margin, ny)
    ny += noteLines.length * 4 + 4
  }

  if (mode === 'detailed' && terms) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...accent)
    doc.text('Terms & Conditions', margin, ny)
    ny += 5
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    const tLines = doc.splitTextToSize(terms, contentW)
    doc.text(tLines, margin, ny)
    ny += tLines.length * 4 + 4
  }

  if (mode === 'detailed' && paymentDetails) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...accent)
    doc.text('Payment Details', margin, ny)
    ny += 5
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    const pLines = doc.splitTextToSize(paymentDetails, contentW)
    doc.text(pLines, margin, ny)
  }

  // ── Footer ────────────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight()
  doc.setFontSize(7)
  doc.setTextColor(160, 160, 160)
  doc.setFont('helvetica', 'normal')
  doc.text('Generated by InvoiQ', pageW / 2, pageH - 6, { align: 'center' })

  doc.save(`${label}-${number || '001'}.pdf`)
}
