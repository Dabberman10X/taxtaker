import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

function formatCurrency(value: number | null, currency: string = 'CAD') {
  if (value === null || value === undefined) return 'N/A'
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string | null) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleDateString('en-CA', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function SharePage({ params }: PageProps) {
  const { slug } = await params
  const supabase = createAdminClient()

  const { data: scenario, error } = await supabase
    .from('saved_scenarios')
    .select('*')
    .eq('public_slug', slug)
    .eq('is_public', true)
    .single()

  if (error || !scenario) {
    return (
      <main className='min-h-screen bg-black p-8 text-white'>
        <div className='mx-auto max-w-4xl space-y-4'>
          <h1 className='text-4xl font-bold'>Share page not found</h1>
          <Link href='/calculator' className='text-blue-400 underline'>
            Back to calculator
          </Link>
        </div>
      </main>
    )
  }

  const { data: watchlistRows } = await supabase
    .from('watchlist_locations')
    .select('*')
    .eq('scenario_id', scenario.id)
    .order('rank_order', { ascending: true })

  const currency = scenario.local_currency ?? 'CAD'
  const assumptions =
    scenario.assumptions_used && typeof scenario.assumptions_used === 'object'
      ? scenario.assumptions_used as Record<string, unknown>
      : {}

  const persona =
    typeof assumptions.persona === 'string'
      ? assumptions.persona
      : 'employee'

  const bestLocationName =
    scenario.best_location &&
    typeof scenario.best_location === 'object' &&
    'name' in scenario.best_location
      ? String((scenario.best_location as any).name)
      : 'N/A'

  const bitcoinProjection =
    scenario.bitcoin_equivalent &&
    typeof scenario.bitcoin_equivalent === 'object'
      ? scenario.bitcoin_equivalent as Record<string, unknown>
      : {}

  const annualBtcLost =
    typeof bitcoinProjection.annual_btc_lost === 'number'
      ? bitcoinProjection.annual_btc_lost
      : null

  const btcLostOverHorizon =
    typeof bitcoinProjection.btc_lost_over_horizon === 'number'
      ? bitcoinProjection.btc_lost_over_horizon
      : null

  const btcPriceAssumption =
    typeof bitcoinProjection.btc_price_assumption === 'number'
      ? bitcoinProjection.btc_price_assumption
      : null

  const topWatchlist = (watchlistRows ?? [])[0]
  const top20yDifference =
    topWatchlist && topWatchlist.estimated_20_year_wealth_difference !== null
      ? topWatchlist.estimated_20_year_wealth_difference
      : null

  return (
    <main className='min-h-screen bg-black p-6 text-white md:p-10'>
      <div className='mx-auto max-w-6xl space-y-8'>
        <div className='space-y-4'>
          <div className='inline-flex rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs text-zinc-400'>
            Public TaxTaker Share
          </div>

          <div className='space-y-2'>
            <h1 className='text-4xl font-bold tracking-tight md:text-6xl'>{scenario.title}</h1>
            <p className='max-w-3xl text-lg text-zinc-400'>
              Tax drag snapshot for {scenario.current_country}
              {scenario.current_region ? ' / ' + scenario.current_region : ''}.
              This share page shows how much wealth is being lost, when tax freedom begins, and which lower-tax jurisdiction currently ranks best.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-6'>
              <div className='text-sm text-zinc-400'>Annual Tax Burden</div>
              <div className='mt-2 text-4xl font-bold'>
                {formatCurrency(scenario.annual_tax_burden, currency)}
              </div>
            </div>

            <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-6'>
              <div className='text-sm text-zinc-400'>Tax Freedom Day</div>
              <div className='mt-2 text-4xl font-bold'>{formatDate(scenario.tax_freedom_day)}</div>
            </div>

            <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-6'>
              <div className='text-sm text-zinc-400'>Best Location</div>
              <div className='mt-2 text-4xl font-bold'>{bestLocationName}</div>
            </div>
          </div>
        </div>

        {persona === 'bitcoiner' && annualBtcLost !== null && btcLostOverHorizon !== null ? (
          <section className='rounded-2xl border border-orange-500/30 bg-orange-500/5 p-6'>
            <div className='text-sm uppercase tracking-widest text-orange-400'>Bitcoin Loss View</div>
            <div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-3'>
              <div className='rounded-xl border border-orange-500/20 bg-black/40 p-4'>
                <div className='text-sm text-zinc-400'>BTC Lost Per Year</div>
                <div className='mt-2 text-3xl font-bold'>{annualBtcLost.toFixed(4)} BTC</div>
              </div>
              <div className='rounded-xl border border-orange-500/20 bg-black/40 p-4'>
                <div className='text-sm text-zinc-400'>BTC Lost Over Horizon</div>
                <div className='mt-2 text-3xl font-bold'>{btcLostOverHorizon.toFixed(2)} BTC</div>
              </div>
              <div className='rounded-xl border border-orange-500/20 bg-black/40 p-4'>
                <div className='text-sm text-zinc-400'>BTC Price Assumption</div>
                <div className='mt-2 text-3xl font-bold'>
                  {btcPriceAssumption !== null ? formatCurrency(btcPriceAssumption, 'USD') : 'N/A'}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-5'>
            <div className='text-sm text-zinc-400'>Income</div>
            <div className='mt-2 text-3xl font-bold'>
              {formatCurrency(scenario.annual_gross_income, currency)}
            </div>
          </div>
          <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-5'>
            <div className='text-sm text-zinc-400'>Effective Tax Rate</div>
            <div className='mt-2 text-3xl font-bold'>
              {scenario.effective_tax_rate !== null && scenario.effective_tax_rate !== undefined
                ? (Number(scenario.effective_tax_rate) * 100).toFixed(2) + '%'
                : 'N/A'}
            </div>
          </div>
          <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-5'>
            <div className='text-sm text-zinc-400'>Days Worked for Taxes</div>
            <div className='mt-2 text-3xl font-bold'>{scenario.days_worked_for_taxes ?? 'N/A'}</div>
          </div>
          <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-5'>
            <div className='text-sm text-zinc-400'>Wealth Leak Score</div>
            <div className='mt-2 text-3xl font-bold'>{scenario.wealth_leak_score ?? 'N/A'}</div>
          </div>
        </section>

        <section className='rounded-2xl border border-zinc-800 bg-zinc-950 p-6'>
          <div className='mb-2 text-sm text-zinc-400'>Move Benefit Snapshot</div>
          <div className='text-2xl font-bold'>
            {topWatchlist
              ? 'Switching to ' + topWatchlist.display_name + ' could preserve ' + formatCurrency(top20yDifference, currency) + ' over the modeled horizon.'
              : 'No relocation comparison available yet.'}
          </div>
          <p className='mt-3 text-zinc-400'>
            This is the core reason TaxTaker exists: to show the hidden long-term cost of staying in a higher-tax jurisdiction.
          </p>
        </section>

        <section className='rounded-2xl border border-zinc-800 bg-zinc-950 p-6'>
          <div className='mb-4 text-sm text-zinc-400'>Watchlist Comparison</div>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <thead>
                <tr className='border-b border-zinc-800 text-zinc-400'>
                  <th className='py-3 pr-4'>Location</th>
                  <th className='py-3 pr-4'>Annual Tax</th>
                  <th className='py-3 pr-4'>Annual Difference</th>
                  <th className='py-3 pr-4'>20Y Difference</th>
                </tr>
              </thead>
              <tbody>
                {(watchlistRows ?? []).map((row) => (
                  <tr key={row.id} className='border-b border-zinc-900'>
                    <td className='py-3 pr-4 font-semibold'>{row.display_name}</td>
                    <td className='py-3 pr-4'>{formatCurrency(row.estimated_annual_tax, currency)}</td>
                    <td className='py-3 pr-4'>{formatCurrency(row.annual_difference_vs_current, currency)}</td>
                    <td className='py-3 pr-4'>{formatCurrency(row.estimated_20_year_wealth_difference, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className='flex flex-wrap gap-3'>
          <Link
            href='/calculator'
            className='rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium hover:border-zinc-500'
          >
            Open TaxTaker
</Link>

<Link
  href='#'
  className='rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-zinc-200'
>
  Unlock Full Sovereign Report
</Link>
        </div>
      </div>
    </main>
  )
}