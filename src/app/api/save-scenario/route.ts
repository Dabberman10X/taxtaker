import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

function makeSlug() {
  return 'tt-' + Math.random().toString(36).slice(2, 10)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      title,
      current_country,
      current_region,
      annual_gross_income,
      estimated_yearly_spending,
      time_horizon_years,
      local_currency,
      annual_tax_burden,
      effective_tax_rate,
      days_worked_for_taxes,
      tax_freedom_day,
      wealth_leak_score,
      wealth_leak_category,
      opportunity_cost,
      bitcoin_equivalent,
      best_location,
      location_ranking,
      assumptions_used,
      watchlist_locations,
    } = body

    const supabase = createAdminClient()
    const public_slug = makeSlug()

    const { data: scenario, error: scenarioError } = await supabase
      .from('saved_scenarios')
      .insert({
        user_id: null,
        title,
        current_country,
        current_region,
        annual_gross_income,
        estimated_yearly_spending,
        time_horizon_years,
        local_currency,
        annual_tax_burden,
        effective_tax_rate,
        days_worked_for_taxes,
        tax_freedom_day,
        wealth_leak_score,
        wealth_leak_category,
        opportunity_cost,
        bitcoin_equivalent,
        best_location,
        location_ranking,
        assumptions_used,
        public_slug,
        is_public: true,
      })
      .select()
      .single()

    if (scenarioError) {
      return NextResponse.json({ error: scenarioError.message }, { status: 500 })
    }

    if (watchlist_locations?.length) {
      const rows = watchlist_locations.map((row: any, index: number) => ({
        scenario_id: scenario.id,
        user_id: null,
        display_name: row.name,
        country_code: null,
        region_code: null,
        rank_order: index + 1,
        estimated_annual_tax: row.annualTax,
        annual_difference_vs_current: row.annualDifference,
        estimated_20_year_wealth_difference: row.wealthDifference,
        short_assumption_note: 'Generated from current TaxTaker scenario',
        metadata: {
          slug: row.slug,
          rate: row.rate,
        },
      }))

      const { error: watchlistError } = await supabase
        .from('watchlist_locations')
        .insert(rows)

      if (watchlistError) {
        return NextResponse.json({ error: watchlistError.message }, { status: 500 })
      }
    }

    return NextResponse.json({
      ok: true,
      scenario_id: scenario.id,
      public_slug: scenario.public_slug,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
