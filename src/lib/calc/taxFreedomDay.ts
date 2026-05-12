export function calculateTaxFreedomDay(
  income: number,
  taxRate: number
) {
  const taxPaid = income * taxRate

  const daysWorkedForTaxes = Math.round((taxPaid / income) * 365)

  const startOfYear = new Date(new Date().getFullYear(), 0, 1)

  const taxFreedomDay = new Date(startOfYear)
  taxFreedomDay.setDate(startOfYear.getDate() + daysWorkedForTaxes)

  return {
    taxPaid,
    daysWorkedForTaxes,
    taxFreedomDay
  }
}
