import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'

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

export default async function ScenariosPage() {
  const supabase = createAdminClient()

  const { data: scenarios, error } = await supabase
    .from('saved_scenarios')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(25)

  return (
    <main className='min-h-screen bg-black p-6 text-white md:p-10'>
      <div className='mx-auto max-w-7xl space-y-8'>
        <div className='space-y-3'>
          <Link href='/calculator' className='text-sm text-blue-400 underline'>
            Back to calculator
          </Link>
          <h1 className='text-4xl font-bold tracking-tight md:text-5xl'>Saved Scenarios</h1>
          <p className='text-zinc-400'>
            Prototype admin-style view of scenarios saved from TaxTaker.
          </p>
        </div>

        {error ? (
          <div className='rounded-2xl border border-red-900 bg-zinc-950 p-6 text-red-400'>
            {error.message}
          </div>
        ) : null}

        <div className='grid grid-cols-1 gap-4'>
          {(scenarios ?? []).map((scenario) => (
            <div key={scenario.id} className='rounded-2xl border border-zinc-800 bg-zinc-950 p-6'>
              <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
                <div className='space-y-2'>
                  <div className='text-xs uppercase tracking-widest text-zinc-500'>
                    {scenario.current_country}
                    {scenario.current_region ? ' / ' + scenario.current_region : ''}
                  </div>
                  <h2 className='text-2xl font-bold'>{scenario.title}</h2>
                  <p className='text-sm text-zinc-400'>
                    Saved {formatDate(scenario.created_at)}
                  </p>
                </div>

                <div className='rounded-xl border border-zinc-800 bg-black px-4 py-3 text-right'>
                  <div className='text-xs text-zinc-500'>Wealth Leak Score</div>
                  <div className='text-2xl font-bold'>{scenario.wealth_leak_score ?? 'N/A'}</div>
                </div>
              </div>

              <div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-4'>
                <div className='rounded-xl border border-zinc-800 bg-black p-4'>
                  <div className='text-sm text-zinc-400'>Income</div>
                  <div className='mt-2 text-xl font-bold'>
                    {formatCurrency(scenario.annual_gross_income, scenario.local_currency ?? 'CAD')}
                  </div>
                </div>

                <div className='rounded-xl border border-zinc-800 bg-black p-4'>
                  <div className='text-sm text-zinc-400'>Annual Tax Burden</div>
                  <div className='mt-2 text-xl font-bold'>
                    {formatCurrency(scenario.annual_tax_burden, scenario.local_currency ?? 'CAD')}
                  </div>
                </div>

                <div className='rounded-xl border border-zinc-800 bg-black p-4'>
                  <div className='text-sm text-zinc-400'>Effective Tax Rate</div>
                  <div className='mt-2 text-xl font-bold'>
                    {scenario.effective_tax_rate !== null && scenario.effective_tax_rate !== undefined
                      ? (Number(scenario.effective_tax_rate) * 100).toFixed(2) + '%'
                      : 'N/A'}
                  </div>
                </div>

                <div className='rounded-xl border border-zinc-800 bg-black p-4'>
                  <div className='text-sm text-zinc-400'>Tax Freedom Day</div>
                  <div className='mt-2 text-xl font-bold'>
                    {scenario.tax_freedom_day
                      ? new Date(scenario.tax_freedom_day).toLocaleDateString('en-CA', {
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'N/A'}
                  </div>
                </div>
              </div>

              <div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-3'>
                <div className='rounded-xl border border-zinc-800 bg-black p-4'>
                  <div className='text-sm text-zinc-400'>Time Horizon</div>
                  <div className='mt-2 text-xl font-bold'>{scenario.time_horizon_years} years</div>
                </div>

                <div className='rounded-xl border border-zinc-800 bg-black p-4'>
                  <div className='text-sm text-zinc-400'>Days Worked for Taxes</div>
                  <div className='mt-2 text-xl font-bold'>{scenario.days_worked_for_taxes ?? 'N/A'}</div>
                </div>

                <div className='rounded-xl border border-zinc-800 bg-black p-4'>
                  <div className='text-sm text-zinc-400'>Leak Category</div>
                  <div className='mt-2 text-xl font-bold'>{scenario.wealth_leak_category ?? 'N/A'}</div>
                </div>
              </div>

              <div className='mt-6'>
                <details className='rounded-xl border border-zinc-800 bg-black p-4'>
                  <summary className='cursor-pointer font-semibold text-zinc-200'>
                    View raw saved payload
                  </summary>
                  <pre className='mt-4 overflow-x-auto whitespace-pre-wrap text-xs text-zinc-400'>
                    {JSON.stringify(
                      {
                        opportunity_cost: scenario.opportunity_cost,
                        bitcoin_opportunity_projection: scenario.bitcoin_equivalent,
                        best_location: scenario.best_location,
                        location_ranking: scenario.location_ranking,
                        assumptions_used: scenario.assumptions_used,
                      },
                      null,
                      2
                    )}
                  </pre>
                </details>
              </div>
            </div>
          ))}

          {!error && (!scenarios || scenarios.length === 0) ? (
            <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-zinc-400'>
              No saved scenarios yet. Go save one from the calculator.
            </div>
          ) : null}
        </div>
      </div>
    </main>
  )
}
