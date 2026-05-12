export type LocationInput = {
  name: string
  slug: string
  taxRate: number
}

export type RankedLocation = {
  name: string
  slug: string
  taxRate: number
  rank: number
}

export function rankLocations(locations: LocationInput[]): RankedLocation[] {
  return [...locations]
    .sort((a, b) => a.taxRate - b.taxRate)
    .map((location, index) => ({
      name: location.name,
      slug: location.slug,
      taxRate: location.taxRate,
      rank: index + 1,
    }))
}