import Link from 'next/link'
import EmailCapture from '@/components/EmailCapture'

export default function HomePage() {
  return (
    <main className='min-h-screen bg-black text-white'>
      <section className='mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-16 md:px-10'>
        <div className='grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center'>
          <div className='space-y-8'>
            <div className='inline-flex w-fit rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-400'>
              TaxTaker MVP
            </div>

            <div className='space-y-5'>
              <h1 className='text-5xl font-bold tracking-tight md:text-7xl'>
                See how much your location is costing your future wealth.
              </h1>
              <p className='max-w-2xl text-lg leading-8 text-zinc-400'>
                TaxTaker estimates your tax drag, Tax Freedom Day, long-term opportunity cost,
                and how your current jurisdiction compares against lower-tax alternatives.
              </p>
            </div>

            <div className='flex flex-col gap-3 sm:flex-row'>
              <Link
                href='/calculator'
                className='rounded-xl bg-white px-5 py-3 text-center font-semibold text-black hover:bg-zinc-200'
              >
                Start Calculator
              </Link>
              <Link
                href='/calculator?persona=bitcoiner'
                className='rounded-xl border border-zinc-700 px-5 py-3 text-center font-semibold hover:border-zinc-500'
              >
                Try Bitcoiner Mode
              </Link>
            </div>

            <div className='max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 p-5'>
              <div className='mb-3 text-sm font-semibold text-zinc-300'>
                Join early access
              </div>
              <EmailCapture
                source='homepage'
                interest='early_access'
                buttonLabel='Join TaxTaker'
              />
              <p className='mt-3 text-xs text-zinc-500'>
                Opt-in only. TaxTaker is an educational calculator, not tax, legal,
                investment, immigration, or relocation advice.
              </p>
            </div>
          </div>

          <div className='space-y-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl'>
            <div className='rounded-2xl border border-zinc-800 bg-black p-5'>
              <div className='text-sm text-zinc-400'>Example Tax Freedom Day</div>
              <div className='mt-2 text-4xl font-bold'>April 30</div>
              <p className='mt-2 text-sm text-zinc-500'>
                The day you stop working for taxes and start working for yourself.
              </p>
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='rounded-2xl border border-zinc-800 bg-black p-5'>
                <div className='text-sm text-zinc-400'>Annual Tax Drag</div>
                <div className='mt-2 text-3xl font-bold'>$17,820</div>
              </div>
              <div className='rounded-2xl border border-zinc-800 bg-black p-5'>
                <div className='text-sm text-zinc-400'>Days Worked for Taxes</div>
                <div className='mt-2 text-3xl font-bold'>120</div>
              </div>
            </div>

            <div className='rounded-2xl border border-orange-500/30 bg-orange-500/5 p-5'>
              <div className='text-sm uppercase tracking-widest text-orange-400'>
                Bitcoiner Mode
              </div>
              <div className='mt-2 text-3xl font-bold'>4.19 BTC</div>
              <p className='mt-2 text-sm text-zinc-400'>
                Estimated BTC lost over a 20-year horizon using the current model assumptions.
              </p>
            </div>

            <div className='rounded-2xl border border-zinc-800 bg-black p-5'>
              <div className='text-sm text-zinc-400'>Current MVP includes</div>
              <div className='mt-4 grid grid-cols-1 gap-3 text-sm text-zinc-300'>
                <div>✓ Persona-based results</div>
                <div>✓ Saved scenarios</div>
                <div>✓ Public share pages</div>
                <div>✓ Jurisdiction comparison</div>
                <div>✓ Early access capture</div>
              </div>
            </div>
          </div>
        </div>

        <section className='mt-20 grid grid-cols-1 gap-4 md:grid-cols-4'>
          <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-5'>
            <div className='text-lg font-bold'>Tax Drag</div>
            <p className='mt-2 text-sm text-zinc-400'>
              Estimate how much income is absorbed by taxes each year.
            </p>
          </div>
          <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-5'>
            <div className='text-lg font-bold'>Freedom Day</div>
            <p className='mt-2 text-sm text-zinc-400'>
              Translate taxes into days of your year.
            </p>
          </div>
          <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-5'>
            <div className='text-lg font-bold'>Opportunity Cost</div>
            <p className='mt-2 text-sm text-zinc-400'>
              Model what tax drag could mean over longer time horizons.
            </p>
          </div>
          <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-5'>
            <div className='text-lg font-bold'>Jurisdiction Compare</div>
            <p className='mt-2 text-sm text-zinc-400'>
              Compare your current location against lower-tax alternatives.
            </p>
          </div>
        </section>

        <footer className='mt-16 flex flex-wrap gap-4 border-t border-zinc-900 pt-8 text-sm text-zinc-500'>
          <Link href='/calculator' className='hover:text-zinc-300'>Calculator</Link>
          <Link href='/scenarios' className='hover:text-zinc-300'>Saved Scenarios</Link>
          <Link href='/privacy' className='hover:text-zinc-300'>Privacy</Link>
          <Link href='/terms' className='hover:text-zinc-300'>Terms</Link>
          <Link href='/disclaimer' className='hover:text-zinc-300'>Disclaimer</Link>
        </footer>
      </section>
    </main>
  )
}