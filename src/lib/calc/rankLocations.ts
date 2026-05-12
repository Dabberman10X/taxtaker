type RankedLocation = {
  name: string
  taxRate: number
}

export function rankLocations(locations: RankedLocation[]) {
  return [...locations].sort((a, b) => a.taxRate - b.taxRate)
}
