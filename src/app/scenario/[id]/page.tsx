import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type PageProps = {
  params: Promise<{
    id: string
  }>
}

function money(value: unknown, currency = 'USD') {
  const n = typeof value === 'number' ? value : Number(value ?? 0)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n)
}

function percent(value: unknown) {
  const n = typeof value === 'number' ? value : Number(value ?? 0)
  return `${(n * 100).toFixed(2)}%`
}

export default async function ScenarioPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: scenario, error } = await supabase
    .from('saved_scenarios')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !scenario) {
    return (
      <main className='min-h-screen bg-black p-6 text-white md:p-10'>
        <div className='mx-auto max-w-4xl space-y-4'>
          <h1 className='text-4xl font-bold'>Scenario not found</h1>
          <p className='text-zinc-400'>This scenario may not exist or may not be public.</p>
          <Link href='/calculator' className='text-blue-400 underline'>Back to calculator</Link>
        </div>
      </main>
    )
  }

  const currency = scenario.local_currency ?? 'USD'
  const inflation =
    scenario.inflation_projection && typeof scenario.inflation_projection === 'object'
      ? scenario.inflation_projection as Record<string, unknown>
      : {}

  const btc =
    scenario.bitcoin_equivalent && typeof scenario.bitcoin_equivalent === 'object'
      ? scenario.bitcoin_equivalent as Record<string, unknown>
      : {}

  const shareText = `TaxTaker result: ${scenario.current_region ?? ''}, ${scenario.current_country ?? ''} — ${scenario.days_worked_for_taxes} days worked for taxes, Tax Freedom Day ${scenario.tax_freedom_day}, ${money(scenario.annual_tax_burden, currency)} extracted/year.`

  return (
    <main className='min-h-screen bg-black p-6 text-white md:p-10'>
      <div className='mx-auto max-w-5xl space-y-8'>
        <div className='space-y-3'>
          <Link href='/calculator' className='text-sm text-blue-400 underline'>
            Back to calculator
          </Link>

          <div className='inline-flex rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs text-zinc-400'>
            Public TaxTaker Scenario
          </div>

          <h1 className='text-4xl font-bold md:text-6xl'>
            {scenario.title}
          </h1>

          <p className='max-w-3xl text-zinc-400'>
            A clean public result page showing tax drag, inflation drag, and jurisdiction comparison without exposing raw model payloads.
          </p>
        </div>

        <section className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card label='Money Extracted / Year' value={money(scenario.annual_tax_burden, currency)} />
          <Card label='Effective Tax Rate' value={percent(scenario.effective_tax_rate)} />
          <Card label='Days Worked for Government' value={String(scenario.days_worked_for_taxes)} />
          <Card label='Tax Freedom Day' value={String(scenario.tax_freedom_day)} />
        </section>

        <section className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <Card label='Year Drain Score' value={String(scenario.wealth_leak_score)} />
          <Card label='Income' value={money(scenario.annual_gross_income, currency)} />
          <Card label='Time Horizon' value={`${scenario.time_horizon_years} years`} />
        </section>

        <section className='rounded-2xl border border-orange-500/30 bg-orange-500/5 p-6'>
          <div className='text-sm uppercase tracking-widest text-orange-400'>Tax + Inflation Drag</div>
          <h2 className='mt-2 text-3xl font-bold'>Taxes hit first. Inflation hits what survives.</h2>

          <div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-3'>
            <Card
              label='Hidden Inflation Loss'
              value={money(inflation.hidden_inflation_loss, currency)}
            />
            <Card
              label='Tax + Inflation Drag'
              value={money(inflation.combined_tax_and_inflation_drag, currency)}
            />
            <Card
              label='Inflation Setting'
              value={typeof inflation.rate_percent === 'number' ? `${inflation.rate_percent}%` : 'N/A'}
            />
          </div>
        </section>

        <section className='rounded-2xl border border-zinc-800 bg-zinc-950 p-6'>
          <div className='text-sm uppercase tracking-widest text-orange-400'>Bitcoin Mode</div>
          <h2 className='mt-2 text-3xl font-bold'>
            {typeof btc.btc_lost_over_horizon === 'number'
              ? `${btc.btc_lost_over_horizon.toFixed(4)} BTC`
              : 'BTC projection unavailable'}
          </h2>
          <p className='mt-3 text-zinc-400'>
            Estimated BTC-denominated tax drag over the selected time horizon using current model assumptions.
          </p>
        </section>

        <section className='rounded-2xl border border-zinc-800 bg-zinc-950 p-6'>
          <div className='mb-3 text-sm text-zinc-400'>Share Text</div>
          <pre className='whitespace-pre-wrap rounded-xl border border-zinc-800 bg-black p-4 text-sm text-zinc-300'>{shareText}</pre>
        </section>

        <div className='flex flex-wrap gap-3'>
          <Link href='/calculator' className='rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200'>
            Run Your Own Scenario
          </Link>
          <Link href='/methodology' className='rounded-xl border border-zinc-700 px-5 py-3 font-semibold hover:border-zinc-500'>
            View Methodology
          </Link>
        </div>
      </div>
    </main>
  )
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-2xl border border-zinc-800 bg-black p-5'>
      <div className='text-sm text-zinc-400'>{label}</div>
      <div className='mt-2 text-2xl font-bold'>{value}</div>
    </div>
  )
}