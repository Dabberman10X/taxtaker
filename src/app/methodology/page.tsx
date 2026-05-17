import Link from 'next/link'

export default function MethodologyPage() {
  return (
    <main className='min-h-screen bg-black p-6 text-white md:p-10'>
      <div className='mx-auto max-w-5xl space-y-8'>
        <Link href='/' className='text-sm text-blue-400 underline'>
          Back to TaxTaker
        </Link>

        <div>
          <h1 className='text-4xl font-bold md:text-6xl'>TaxTaker Methodology</h1>
          <p className='mt-4 max-w-3xl text-zinc-400'>
            TaxTaker is an educational model that estimates tax drag, Tax Freedom Day,
            opportunity cost, inflation drag, and jurisdiction comparison using simplified assumptions.
          </p>
        </div>

        <section className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-6'>
            <h2 className='text-2xl font-bold'>Tax Drag</h2>
            <p className='mt-3 text-zinc-400'>
              Annual tax burden is calculated as income multiplied by the effective modeled tax rate.
              Users can use the database rate or override the rate manually.
            </p>
          </div>

          <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-6'>
            <h2 className='text-2xl font-bold'>Tax Freedom Day</h2>
            <p className='mt-3 text-zinc-400'>
              Tax Freedom Day converts annual tax burden into days worked for taxes:
              effective tax rate multiplied by 365 days.
            </p>
          </div>

          <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-6'>
            <h2 className='text-2xl font-bold'>Wealth Leak Score</h2>
            <p className='mt-3 text-zinc-400'>
              Wealth Leak Score is the percentage of the year the user works for taxes,
              rounded into a simple score.
            </p>
          </div>

          <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-6'>
            <h2 className='text-2xl font-bold'>Opportunity Cost</h2>
            <p className='mt-3 text-zinc-400'>
              Opportunity cost estimates what annual tax drag could have become over time
              under different asset return assumptions.
            </p>
          </div>

          <div className='rounded-2xl border border-orange-500/30 bg-orange-500/5 p-6'>
            <h2 className='text-2xl font-bold'>Inflation Drag</h2>
            <p className='mt-3 text-zinc-400'>
              Inflation drag estimates how much purchasing power may be lost from fiat left
              after taxes and spending. Cash is treated as directly exposed to debasement.
            </p>
          </div>

          <div className='rounded-2xl border border-orange-500/30 bg-orange-500/5 p-6'>
            <h2 className='text-2xl font-bold'>Asset Treatment</h2>
            <p className='mt-3 text-zinc-400'>
              Cash is modeled as inflation-exposed. S&P 500, real estate, gold, and Bitcoin
              are shown separately because productive and hard monetary assets do not behave
              like idle fiat cash.
            </p>
          </div>
        </section>

        <section className='rounded-2xl border border-zinc-800 bg-zinc-950 p-6'>
          <h2 className='text-2xl font-bold'>Important Disclaimer</h2>
          <p className='mt-3 text-zinc-400'>
            TaxTaker is not tax, legal, investment, immigration, financial planning,
            residency, or relocation advice. Outputs are simplified estimates for education
            and comparison only. Always verify with qualified professionals.
          </p>
        </section>
      </div>
    </main>
  )
}