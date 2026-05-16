import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { calculateTaxFreedomDay } from '@/lib/calc/taxFreedomDay'
import { opportunityCost } from '@/lib/calc/opportunityCost'
import { rankLocations } from '@/lib/calc/rankLocations'
import CopyShareCard from '@/components/CopyShareCard'
import SaveScenarioButton from '@/components/SaveScenarioButton'

function formatDate(date: Date) {
  return date.toLocaleDateString('en-CA', {
    month: 'long',
    day: 'numeric',
  })
}

function formatCurrency(value: number, currency: string = 'CAD') {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

type SearchParams = Promise<{
  income?: string
  taxRate?: string
  spending?: string
  years?: string
  inflation?: string
  current?: string
  compare1?: string
  compare2?: string
  compare3?: string
  persona?: string
}>

type JurisdictionRow = {
  slug: string
  display_name: string
  currency_code: string
  country_code: string
  region_code: string | null
}

type TaxProfileRow = {
  jurisdiction_slug: string
  default_effective_rate: number
  low_income_rate: number | null
  mid_income_rate: number | null
  high_income_rate: number | null
  notes: string | null
}

function getPersonaConfig(persona: string) {
  switch (persona) {
    case 'entrepreneur':
      return {
        label: 'Entrepreneur',
        subtext: 'See how much growth capital your jurisdiction is removing from your business-building engine.',
        highlightLabel: 'Reinvestable Capital Lost',
        shareTag: '#Entrepreneur',
      }
    case 'investor':
      return {
        label: 'Investor',
        subtext: 'Measure how jurisdictional tax drag compounds against long-term portfolio growth.',
        highlightLabel: 'Compounding Wealth Drag',
        shareTag: '#Investor',
      }
    case 'bitcoiner':
      return {
        label: 'Bitcoiner',
        subtext: 'See how much scarce asset accumulation your jurisdiction is costing you over time.',
        highlightLabel: 'Bitcoin Accumulation Drag',
        shareTag: '#Bitcoin',
      }
    case 'family':
      return {
        label: 'Family',
        subtext: 'Compare how different jurisdictions affect long-term household stability and wealth preservation.',
        highlightLabel: 'Household Wealth Preserved',
        shareTag: '#FamilyFinance',
      }
    default:
      return {
        label: 'Employee',
        subtext: 'See how much of your working life is being drained by jurisdictional tax drag.',
        highlightLabel: 'Income Preservation Gap',
        shareTag: '#Income',
      }
  }
}

export default async function CalculatorPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams

  const income = Number(params.income ?? 54000)
  const spending = Number(params.spending ?? 48000)
  const years = Number(params.years ?? 20)
  const inflationRatePercent = Number(params.inflation ?? 7)
  const inflationRate = inflationRatePercent / 100
  const current = params.current ?? 'canada-ontario'
  const compare1 = params.compare1 ?? 'usa-florida'
  const compare2 = params.compare2 ?? 'uae-dubai'
  const compare3 = params.compare3 ?? 'el-salvador'
  const persona = params.persona ?? 'employee'

  const personaConfig = getPersonaConfig(persona)
  const BTC_PRICE = 85000

  const supabase = await createClient()

  const [{ data: jurisdictionRows }, { data: taxProfiles }] = await Promise.all([
    supabase
      .from('jurisdictions')
      .select('slug, display_name, currency_code, country_code, region_code')
      .order('display_name', { ascending: true }),
    supabase
      .from('tax_rate_profiles')
      .select('jurisdiction_slug, default_effective_rate, low_income_rate, mid_income_rate, high_income_rate, notes'),
  ])

  const jurisdictionOptions: JurisdictionRow[] = (jurisdictionRows ?? []) as JurisdictionRow[]
  const profileMap = new Map(
    ((taxProfiles ?? []) as TaxProfileRow[]).map((p) => [p.jurisdiction_slug, p])
  )

  const fallbackCurrent: JurisdictionRow = {
    slug: 'canada-ontario',
    display_name: 'Ontario, Canada',
    currency_code: 'CAD',
    country_code: 'CA',
    region_code: 'ON',
  }

  const currentJurisdiction =
    jurisdictionOptions.find((j) => j.slug === current) ??
    jurisdictionOptions.find((j) => j.slug === 'canada-ontario') ??
    fallbackCurrent

  const currentProfile = profileMap.get(currentJurisdiction.slug)

  function resolveJurisdictionRate(slug: string, grossIncome: number) {
    const profile = profileMap.get(slug)
    if (!profile) return 0.2

    if (profile.low_income_rate !== null && profile.low_income_rate !== undefined && grossIncome < 50000) {
      return Number(profile.low_income_rate)
    }

    if (
      profile.mid_income_rate !== null &&
      profile.mid_income_rate !== undefined &&
      grossIncome >= 50000 &&
      grossIncome < 150000
    ) {
      return Number(profile.mid_income_rate)
    }

    if (profile.high_income_rate !== null && profile.high_income_rate !== undefined && grossIncome >= 150000) {
      return Number(profile.high_income_rate)
    }

    return Number(profile.default_effective_rate)
  }

  const jurisdictionRate = resolveJurisdictionRate(currentJurisdiction.slug, income)
  const taxRatePercent = params.taxRate ? Number(params.taxRate) : jurisdictionRate * 100
  const taxRate = taxRatePercent / 100

  const { taxPaid, daysWorkedForTaxes, taxFreedomDay } =
    calculateTaxFreedomDay(income, taxRate)

  const wealthLeakPercent = (daysWorkedForTaxes / 365) * 100
  const leak = {
    score: Math.round(wealthLeakPercent),
    category:
      wealthLeakPercent >= 40
        ? 'Extreme'
        : wealthLeakPercent >= 30
          ? 'High'
          : wealthLeakPercent >= 20
            ? 'Moderate'
            : 'Low',
  }

  const annualBtcLost = taxPaid / BTC_PRICE
  const btcLost20y = annualBtcLost * years

  const conservative = {
    bitcoin: opportunityCost(taxPaid, 0.08, years),
    sp500: opportunityCost(taxPaid, 0.06, years),
    gold: opportunityCost(taxPaid, 0.03, years),
    realEstate: opportunityCost(taxPaid, 0.05, years),
    cash: opportunityCost(taxPaid, 0.02, years),
  }

  const base = {
    bitcoin: opportunityCost(taxPaid, 0.18, years),
    sp500: opportunityCost(taxPaid, 0.08, years),
    gold: opportunityCost(taxPaid, 0.04, years),
    realEstate: opportunityCost(taxPaid, 0.06, years),
    cash: opportunityCost(taxPaid, 0.025, years),
  }

  const aggressive = {
    bitcoin: opportunityCost(taxPaid, 0.35, years),
    sp500: opportunityCost(taxPaid, 0.1, years),
    gold: opportunityCost(taxPaid, 0.05, years),
    realEstate: opportunityCost(taxPaid, 0.07, years),
    cash: opportunityCost(taxPaid, 0.03, years),
  }

  const inflationMultiplier = Math.pow(1 + inflationRate, years)

  const realCashValue = base.cash / inflationMultiplier

  // Hard/productive assets are not modeled like idle cash.
  // MVP framing:
  // Cash gets directly debased.
  // S&P 500 has partial inflation pass-through through corporate pricing power.
  // Gold is treated as a monetary hedge.
  // Real estate is treated as a partial inflation hedge.
  // Bitcoin is treated as a fixed-supply monetary preservation asset.
  const realSp500Value = base.sp500
  const realGoldValue = base.gold
  const realRealEstateValue = base.realEstate
  const btcScenarioValue = base.bitcoin

  const hiddenInflationLoss = base.cash - realCashValue
  const totalTaxOverHorizon = taxPaid * years
  const combinedTaxAndInflationDrag = totalTaxOverHorizon + hiddenInflationLoss

  const rankedLocations = rankLocations(
    jurisdictionOptions.map((j) => ({
      name: j.display_name,
      slug: j.slug,
      taxRate: resolveJurisdictionRate(j.slug, income),
    }))
  )

  const bestLocation = rankedLocations[0] ?? {
    name: currentJurisdiction.display_name,
    slug: currentJurisdiction.slug,
    taxRate: jurisdictionRate,
  }

  const compareSlugs = [compare1, compare2, compare3].filter(Boolean)

  const watchlistRows = compareSlugs
    .map((slug) => jurisdictionOptions.find((j) => j.slug === slug))
    .filter(Boolean)
    .map((j) => {
      const jurisdiction = j as JurisdictionRow
      const compareRate = resolveJurisdictionRate(jurisdiction.slug, income)
      const compareTax = income * compareRate
      const annualDifference = taxPaid - compareTax
      const currentBase = opportunityCost(taxPaid, 0.08, years)
      const compareBase = opportunityCost(compareTax, 0.08, years)
      const wealthDifference = currentBase - compareBase

      return {
        slug: jurisdiction.slug,
        name: jurisdiction.display_name,
        rate: compareRate,
        annualTax: compareTax,
        annualDifference,
        wealthDifference,
      }
    })

  const bestWatchlist = [...watchlistRows].sort((a, b) => b.wealthDifference - a.wealthDifference)[0]

  const highlightValue = bestWatchlist
    ? formatCurrency(bestWatchlist.wealthDifference, currentJurisdiction.currency_code ?? 'CAD')
    : formatCurrency(base.sp500, currentJurisdiction.currency_code ?? 'CAD')

  const professionalShare =
    '[' + personaConfig.label + '] ' +
    'My Tax Freedom Day is ' +
    formatDate(taxFreedomDay) +
    '. Current location: ' +
    currentJurisdiction.display_name +
    '. Estimated annual tax burden: ' +
    formatCurrency(taxPaid, currentJurisdiction.currency_code ?? 'CAD') +
    '. ' +
    (bestWatchlist
      ? 'Compared with ' +
        bestWatchlist.name +
        ', I could preserve about ' +
        formatCurrency(bestWatchlist.wealthDifference, currentJurisdiction.currency_code ?? 'CAD') +
        ' over ' +
        years +
        ' years.'
      : 'My current modeled tax rate is ' + taxRatePercent.toFixed(2) + '%.') +
    ' #TaxTaker #TaxFreedomDay ' + personaConfig.shareTag

  const provocativeShare =
    '[' + personaConfig.label + '] ' +
    'I work ' +
    daysWorkedForTaxes +
    ' days a year before I earn for myself. ' +
    currentJurisdiction.display_name +
    ' is leaking ' +
    formatCurrency(taxPaid, currentJurisdiction.currency_code ?? 'CAD') +
    ' a year from my future. ' +
    (bestWatchlist
      ? bestWatchlist.name +
        ' could leave me roughly ' +
        formatCurrency(bestWatchlist.wealthDifference, currentJurisdiction.currency_code ?? 'CAD') +
        ' richer over ' +
        years +
        ' years.'
      : 'My leak score is ' + leak.score + '.') +
    ' #TaxTaker #WealthLeak ' + personaConfig.shareTag

  const savePayload = {
    title: personaConfig.label + ' scenario - ' + currentJurisdiction.display_name,
    current_country: currentJurisdiction.country_code,
    current_region: currentJurisdiction.region_code,
    annual_gross_income: income,
    estimated_yearly_spending: spending,
    time_horizon_years: years,
    local_currency: currentJurisdiction.currency_code ?? 'CAD',
    annual_tax_burden: taxPaid,
    effective_tax_rate: taxRate,
    days_worked_for_taxes: daysWorkedForTaxes,
    tax_freedom_day: taxFreedomDay.toISOString().split('T')[0],
    wealth_leak_score: leak.score,
    wealth_leak_category: leak.category,
    opportunity_cost: {
      conservative,
      base,
      aggressive,
    },
    bitcoin_equivalent: {
      conservative: conservative.bitcoin,
      base: base.bitcoin,
      aggressive: aggressive.bitcoin,
      annual_btc_lost: annualBtcLost,
      btc_lost_over_horizon: btcLost20y,
      btc_price_assumption: BTC_PRICE,
    },
    inflation_projection: {
      rate: inflationRate,
      rate_percent: inflationRatePercent,
      years,
      nominal_cash_value: base.cash,
      real_cash_value: realCashValue,
      hidden_inflation_loss: hiddenInflationLoss,
      total_tax_over_horizon: totalTaxOverHorizon,
      combined_tax_and_inflation_drag: combinedTaxAndInflationDrag,
      real_values: {
        cash: realCashValue,
        sp500: realSp500Value,
        gold: realGoldValue,
        realEstate: realRealEstateValue,
        bitcoin: btcScenarioValue,
      },
      note: 'Inflation layer directly debases idle fiat cash. Productive assets and hard monetary assets are shown as inflation-resistant categories rather than being discounted like cash.'
    },
    best_location: bestLocation,
    location_ranking: rankedLocations.slice(0, 8),
    assumptions_used: {
      persona,
      current: currentJurisdiction.slug,
      compare1,
      compare2,
      compare3,
      manual_tax_override: params.taxRate ?? null,
    },
    watchlist_locations: watchlistRows,
  }

  return (
    <main className='min-h-screen bg-black p-6 text-white md:p-10'>
      <div className='mx-auto max-w-7xl space-y-8'>
        <div className='space-y-2'>
          <div className='inline-flex rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs text-zinc-400'>
            Persona Mode: {personaConfig.label}
          </div>
          <h1 className='text-4xl font-bold tracking-tight md:text-5xl'>TaxTaker Calculator</h1>
          <p className='text-lg text-zinc-400'>{personaConfig.subtext}</p>
          <p className='text-sm text-zinc-500'>
            Current jurisdiction {currentJurisdiction.display_name} | Income {formatCurrency(income, currentJurisdiction.currency_code ?? 'CAD')} | Spending {formatCurrency(spending, currentJurisdiction.currency_code ?? 'CAD')} | Horizon {years} years
          </p>
          <p className='text-sm text-zinc-500'>
            Auto tax rate from database: {jurisdictionRate ? (jurisdictionRate * 100).toFixed(2) : 'N/A'}%
            {currentProfile?.notes ? ' | ' + currentProfile.notes : ''}
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          <SaveScenarioButton payload={savePayload} />
          <Link
            href='/scenarios'
            className='rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium hover:border-zinc-500'
          >
            View Saved Scenarios
          </Link>
        </div>

        <form className='grid grid-cols-2 gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 md:grid-cols-6'>
          <div className='space-y-2 md:col-span-2'>
            <label className='text-sm text-zinc-400'>Persona</label>
            <select
              name='persona'
              defaultValue={persona}
              className='w-full rounded-lg border border-zinc-800 bg-black px-3 py-2'
            >
              <option value='employee'>Employee</option>
              <option value='entrepreneur'>Entrepreneur</option>
              <option value='investor'>Investor</option>
              <option value='bitcoiner'>Bitcoiner</option>
              <option value='family'>Family</option>
            </select>
          </div>

          <div className='space-y-2 md:col-span-2'>
            <label className='text-sm text-zinc-400'>Current Jurisdiction</label>
            <select
              name='current'
              defaultValue={currentJurisdiction.slug}
              className='w-full rounded-lg border border-zinc-800 bg-black px-3 py-2'
            >
              {jurisdictionOptions.map((j) => (
                <option key={j.slug} value={j.slug}>
                  {j.display_name}
                </option>
              ))}
            </select>
          </div>

          <div className='space-y-2'>
            <label className='text-sm text-zinc-400'>Income</label>
            <input name='income' defaultValue={income} className='w-full rounded-lg border border-zinc-800 bg-black px-3 py-2' />
          </div>

          <div className='space-y-2'>
            <label className='text-sm text-zinc-400'>Tax Rate % Override</label>
            <input
              name='taxRate'
              defaultValue={params.taxRate ?? ''}
              placeholder={(jurisdictionRate * 100).toFixed(2)}
              className='w-full rounded-lg border border-zinc-800 bg-black px-3 py-2'
            />
          </div>

          <div className='space-y-2'>
            <label className='text-sm text-zinc-400'>Spending</label>
            <input name='spending' defaultValue={spending} className='w-full rounded-lg border border-zinc-800 bg-black px-3 py-2' />
          </div>

          <div className='space-y-2'>
            <label className='text-sm text-zinc-400'>Years</label>
            <input name='years' defaultValue={years} className='w-full rounded-lg border border-zinc-800 bg-black px-3 py-2' />
          </div>

          <div className='space-y-2'>
            <label className='text-sm text-zinc-400'>Inflation Layer</label>
            <select
              name='inflation'
              defaultValue={String(inflationRatePercent)}
              className='w-full rounded-lg border border-orange-500/30 bg-black px-3 py-2'
            >
              <option value='3'>3% — Fake CPI Mode</option>
              <option value='7'>7% — Realistic Standard</option>
              <option value='10'>10% — Fiat Meltdown Zone</option>
            </select>
          </div>
          <div className='space-y-2'>
            <label className='text-sm text-zinc-400'>Compare 1</label>
            <select name='compare1' defaultValue={compare1} className='w-full rounded-lg border border-zinc-800 bg-black px-3 py-2'>
              {jurisdictionOptions.map((j) => (
                <option key={j.slug + '-c1'} value={j.slug}>
                  {j.display_name}
                </option>
              ))}
            </select>
          </div>

          <div className='space-y-2'>
            <label className='text-sm text-zinc-400'>Compare 2</label>
            <select name='compare2' defaultValue={compare2} className='w-full rounded-lg border border-zinc-800 bg-black px-3 py-2'>
              {jurisdictionOptions.map((j) => (
                <option key={j.slug + '-c2'} value={j.slug}>
                  {j.display_name}
                </option>
              ))}
            </select>
          </div>

          <div className='space-y-2'>
            <label className='text-sm text-zinc-400'>Compare 3</label>
            <select name='compare3' defaultValue={compare3} className='w-full rounded-lg border border-zinc-800 bg-black px-3 py-2'>
              {jurisdictionOptions.map((j) => (
                <option key={j.slug + '-c3'} value={j.slug}>
                  {j.display_name}
                </option>
              ))}
            </select>
          </div>

          <div className='col-span-2 md:col-span-6'>
            <button className='rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:opacity-90'>
              Recalculate
            </button>
          </div>
        </form>

        <section className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-5'>
            <div className='text-sm text-zinc-400'>Annual Tax Burden</div>
            <div className='mt-2 text-3xl font-bold'>{formatCurrency(taxPaid, currentJurisdiction.currency_code ?? 'CAD')}</div>
          </div>
          <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-5'>
            <div className='text-sm text-zinc-400'>Effective Tax Rate</div>
            <div className='mt-2 text-3xl font-bold'>{taxRatePercent.toFixed(2)}%</div>
          </div>
          <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-5'>
            <div className='text-sm text-zinc-400'>Days Worked for Taxes</div>
            <div className='mt-2 text-3xl font-bold'>{daysWorkedForTaxes}</div>
          </div>
          <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-5'>
            <div className='text-sm text-zinc-400'>Tax Freedom Day</div>
            <div className='mt-2 text-3xl font-bold'>{formatDate(taxFreedomDay)}</div>
          </div>
        </section>

        <section className='grid grid-cols-1 gap-4 lg:grid-cols-4'>
          <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-6 lg:col-span-1'>
            <div className='text-sm text-zinc-400'>Wealth Leak Score</div>
            <div className='mt-4 text-6xl font-bold'>{leak.score}</div>
            <div className='mt-2 text-lg'>{leak.category}</div>
            {persona === 'bitcoiner' && (
              <div className='mt-4'>
                <div className='text-xs text-orange-400'>BTC LOST PER YEAR</div>
                <div className='text-lg font-bold'>{annualBtcLost.toFixed(4)} BTC</div>
                <div className='text-xs text-zinc-500'>20Y: {btcLost20y.toFixed(2)} BTC</div>
              </div>
            )}
          </div>

          <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-6 lg:col-span-1'>
            <div className='text-sm text-zinc-400'>{personaConfig.highlightLabel}</div>
            <div className='mt-4 text-4xl font-bold'>{highlightValue}</div>
            <div className='mt-2 text-sm text-zinc-400'>
              {bestWatchlist ? 'Best watchlist improvement over ' + years + ' years.' : 'Current base scenario emphasis.'}
            </div>
          </div>

          <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-6 lg:col-span-2'>
            <div className='mb-4 text-sm text-zinc-400'>Opportunity Cost ({years} years)</div>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              <div className='rounded-xl border border-zinc-800 bg-black p-4'>
                <div className='mb-3 font-semibold'>Conservative</div>
                <div className='space-y-2 text-sm'>
                  <div>Bitcoin: {formatCurrency(conservative.bitcoin, currentJurisdiction.currency_code ?? 'CAD')}</div>
                  <div>S&amp;P 500: {formatCurrency(conservative.sp500, currentJurisdiction.currency_code ?? 'CAD')}</div>
                  <div>Gold: {formatCurrency(conservative.gold, currentJurisdiction.currency_code ?? 'CAD')}</div>
                  <div>Real Estate: {formatCurrency(conservative.realEstate, currentJurisdiction.currency_code ?? 'CAD')}</div>
                  <div>Cash: {formatCurrency(conservative.cash, currentJurisdiction.currency_code ?? 'CAD')}</div>
                </div>
              </div>
              <div className='rounded-xl border border-zinc-800 bg-black p-4'>
                <div className='mb-3 font-semibold'>Base</div>
                <div className='space-y-2 text-sm'>
                  <div>Bitcoin: {formatCurrency(base.bitcoin, currentJurisdiction.currency_code ?? 'CAD')}</div>
                  <div>S&amp;P 500: {formatCurrency(base.sp500, currentJurisdiction.currency_code ?? 'CAD')}</div>
                  <div>Gold: {formatCurrency(base.gold, currentJurisdiction.currency_code ?? 'CAD')}</div>
                  <div>Real Estate: {formatCurrency(base.realEstate, currentJurisdiction.currency_code ?? 'CAD')}</div>
                  <div>Cash: {formatCurrency(base.cash, currentJurisdiction.currency_code ?? 'CAD')}</div>
                </div>
              </div>
              <div className='rounded-xl border border-zinc-800 bg-black p-4'>
                <div className='mb-3 font-semibold'>Aggressive</div>
                <div className='space-y-2 text-sm'>
                  <div>Bitcoin: {formatCurrency(aggressive.bitcoin, currentJurisdiction.currency_code ?? 'CAD')}</div>
                  <div>S&amp;P 500: {formatCurrency(aggressive.sp500, currentJurisdiction.currency_code ?? 'CAD')}</div>
                  <div>Gold: {formatCurrency(aggressive.gold, currentJurisdiction.currency_code ?? 'CAD')}</div>
                  <div>Real Estate: {formatCurrency(aggressive.realEstate, currentJurisdiction.currency_code ?? 'CAD')}</div>
                  <div>Cash: {formatCurrency(aggressive.cash, currentJurisdiction.currency_code ?? 'CAD')}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='rounded-2xl border border-orange-500/30 bg-orange-500/5 p-6'>
          <div className='text-sm uppercase tracking-widest text-orange-400'>Inflation Drag Layer</div>
          <h2 className='mt-2 text-3xl font-bold'>Taxes hit first. Inflation hits what survives.</h2>
          <p className='mt-3 max-w-3xl text-zinc-400'>
            At {inflationRatePercent.toFixed(0)}% inflation over {years} years, idle fiat cash loses purchasing power after taxes have already taken their cut. Hard and productive assets are shown separately because they do not behave like idle fiat cash. Bitcoin keeps its modeled value here because the app treats it as the fixed-supply preservation asset in this comparison.
          </p>

          <div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div className='rounded-xl border border-orange-500/20 bg-black/40 p-4'>
              <div className='text-sm text-zinc-400'>Hidden Inflation Loss</div>
              <div className='mt-2 text-3xl font-bold'>{formatCurrency(hiddenInflationLoss, currentJurisdiction.currency_code ?? 'CAD')}</div>
            </div>

            <div className='rounded-xl border border-orange-500/20 bg-black/40 p-4'>
              <div className='text-sm text-zinc-400'>Tax + Inflation Drag</div>
              <div className='mt-2 text-3xl font-bold'>{formatCurrency(combinedTaxAndInflationDrag, currentJurisdiction.currency_code ?? 'CAD')}</div>
            </div>

            <div className='rounded-xl border border-orange-500/20 bg-black/40 p-4'>
              <div className='text-sm text-zinc-400'>Inflation Setting</div>
              <div className='mt-2 text-3xl font-bold'>{inflationRatePercent.toFixed(0)}%</div>
            </div>
          </div>

          <div className='mt-6 overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <thead>
                <tr className='border-b border-orange-500/20 text-zinc-400'>
                  <th className='py-3 pr-4'>Scenario</th>
                  <th className='py-3 pr-4'>Nominal</th>
                  <th className='py-3 pr-4'>Inflation Response</th>
                </tr>
              </thead>
              <tbody>
                <tr className='border-b border-orange-500/10'>
                  <td className='py-3 pr-4 font-semibold'>Cash</td>
                  <td className='py-3 pr-4'>{formatCurrency(base.cash, currentJurisdiction.currency_code ?? 'CAD')}</td>
                  <td className='py-3 pr-4'>{formatCurrency(realCashValue, currentJurisdiction.currency_code ?? 'CAD')} purchasing power</td>
                </tr>
                <tr className='border-b border-orange-500/10'>
                  <td className='py-3 pr-4 font-semibold'>S&amp;P 500</td>
                  <td className='py-3 pr-4'>{formatCurrency(base.sp500, currentJurisdiction.currency_code ?? 'CAD')}</td>
                  <td className='py-3 pr-4'>Partial inflation pass-through</td>
                </tr>
                <tr className='border-b border-orange-500/10'>
                  <td className='py-3 pr-4 font-semibold'>Gold</td>
                  <td className='py-3 pr-4'>{formatCurrency(base.gold, currentJurisdiction.currency_code ?? 'CAD')}</td>
                  <td className='py-3 pr-4'>Historical monetary hedge</td>
                </tr>
                <tr>
                  <td className='py-3 pr-4 font-semibold'>Bitcoin Scenario</td>
                  <td className='py-3 pr-4'>{formatCurrency(btcScenarioValue, currentJurisdiction.currency_code ?? 'CAD')} — fixed-supply monetary asset</td>
                  <td className='py-3 pr-4'>{formatCurrency(btcScenarioValue, currentJurisdiction.currency_code ?? 'CAD')} — fixed-supply monetary asset</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section className='rounded-2xl border border-zinc-800 bg-zinc-950 p-6'>
          <div className='mb-4 text-sm text-zinc-400'>Watchlist Comparison</div>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <thead>
                <tr className='border-b border-zinc-800 text-zinc-400'>
                  <th className='py-3 pr-4'>Location</th>
                  <th className='py-3 pr-4'>Rate</th>
                  <th className='py-3 pr-4'>Annual Tax</th>
                  <th className='py-3 pr-4'>Annual Difference</th>
                  <th className='py-3 pr-4'>20Y Base Difference</th>
                </tr>
              </thead>
              <tbody>
                {watchlistRows.map((row) => (
                  <tr key={row.slug} className='border-b border-zinc-900'>
                    <td className='py-3 pr-4 font-semibold'>
                      <Link href={'/jurisdictions/' + row.slug} className='hover:text-blue-400'>
                        {row.name}
                      </Link>
                    </td>
                    <td className='py-3 pr-4'>{(row.rate * 100).toFixed(2)}%</td>
                    <td className='py-3 pr-4'>{formatCurrency(row.annualTax, currentJurisdiction.currency_code ?? 'CAD')}</td>
                    <td className={'py-3 pr-4 ' + (row.annualDifference >= 0 ? 'text-green-400' : 'text-red-400')}>
                      {row.annualDifference >= 0 ? '+' : '-'}
                      {formatCurrency(Math.abs(row.annualDifference), currentJurisdiction.currency_code ?? 'CAD')}
                    </td>
                    <td className={'py-3 pr-4 ' + (row.wealthDifference >= 0 ? 'text-green-400' : 'text-red-400')}>
                      {row.wealthDifference >= 0 ? '+' : '-'}
                      {formatCurrency(Math.abs(row.wealthDifference), currentJurisdiction.currency_code ?? 'CAD')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <CopyShareCard title='Professional Share' body={professionalShare} accent='text-blue-400' />
          <CopyShareCard title='Provocative Share' body={provocativeShare} accent='text-red-400' />
        </section>

        <section className='rounded-2xl border border-zinc-800 bg-zinc-950 p-6'>
          <div className='mb-4 text-sm text-zinc-400'>Location Ranking</div>
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
            {rankedLocations.slice(0, 8).map((location: { name: string; slug: string; taxRate: number }, index: number) => (
              <div key={location.slug} className='flex items-center justify-between rounded-xl border border-zinc-800 bg-black p-4'>
                <div>
                  <div className='text-xs text-zinc-500'>Rank {index + 1}</div>
                  <Link href={'/jurisdictions/' + location.slug} className='font-semibold hover:text-blue-400'>
                    {location.name}
                  </Link>
                </div>
                <div className='text-sm text-zinc-400'>{(location.taxRate * 100).toFixed(2)}%</div>
              </div>
            ))}
          </div>
        </section>

        <section className='rounded-2xl border border-zinc-800 bg-zinc-950 p-6'>
          <div className='text-sm text-zinc-400'>Best Location</div>
          <Link href={'/jurisdictions/' + bestLocation.slug} className='mt-2 block text-3xl font-bold hover:text-blue-400'>
            {bestLocation.name}
          </Link>
          <div className='mt-2 text-zinc-400'>Lowest current modeled tax rate in the comparison set.</div>
          <div className='mt-3 flex gap-3'>
            <Link
              href={'/jurisdictions/' + bestLocation.slug}
              className='rounded bg-blue-600 px-3 py-1 text-xs hover:bg-blue-500'
            >
              View Jurisdiction
            </Link>
            <a
              href={'/jurisdictions/' + bestLocation.slug}
              className='rounded bg-zinc-700 px-3 py-1 text-xs hover:bg-zinc-600'
            >
              Learn How to Move
            </a>
          </div>
        </section>
      </div>
    </main>
  )
}