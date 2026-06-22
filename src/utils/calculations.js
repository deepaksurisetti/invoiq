export function calculateItemAmount(item) {
  const qty = parseFloat(item.quantity) || 0
  const rate = parseFloat(item.rate) || 0
  const discount = parseFloat(item.discount) || 0
  const subtotal = qty * rate
  const discountAmount = subtotal * (discount / 100)
  return subtotal - discountAmount
}

export function calculateTotals(data) {
  const { items, discount, tax, tax2, shipping, mode } = data

  const subtotal = items.reduce((sum, item) => sum + calculateItemAmount(item), 0)

  let discountAmount = 0
  if (mode === 'detailed') {
    if (discount.type === 'percentage') {
      discountAmount = subtotal * (parseFloat(discount.value) / 100)
    } else {
      discountAmount = parseFloat(discount.value) || 0
    }
  }

  const afterDiscount = subtotal - discountAmount

  const taxRate = parseFloat(tax.rate) || 0
  const taxAmount = afterDiscount * (taxRate / 100)

  let tax2Amount = 0
  if (mode === 'detailed' && tax2.enabled) {
    const tax2Rate = parseFloat(tax2.rate) || 0
    tax2Amount = afterDiscount * (tax2Rate / 100)
  }

  const shippingAmount = mode === 'detailed' ? (parseFloat(shipping) || 0) : 0

  const total = afterDiscount + taxAmount + tax2Amount + shippingAmount

  return {
    subtotal,
    discountAmount,
    afterDiscount,
    taxAmount,
    tax2Amount,
    shippingAmount,
    total,
  }
}
