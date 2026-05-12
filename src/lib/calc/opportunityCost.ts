export function opportunityCost(
  yearlyTax: number,
  returnRate: number,
  years: number
) {
  let value = 0

  for (let i = 0; i < years; i++) {
    value = (value + yearlyTax) * (1 + returnRate)
  }

  return Math.round(value)
}
