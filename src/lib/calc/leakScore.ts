export function calculateLeakScore(taxRate: number) {
  const score = Math.round(taxRate * 100)

  let category = 'Low'

  if (score > 25) category = 'Moderate'
  if (score > 40) category = 'High'
  if (score > 55) category = 'Extreme'

  return {
    score,
    category
  }
}
