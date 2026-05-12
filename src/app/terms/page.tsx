import Link from 'next/link'

export default function Page() {
  return (
    <main className='min-h-screen bg-black p-6 text-white md:p-10'>
      <div className='mx-auto max-w-4xl space-y-8'>
        <Link href='/' className='text-sm text-blue-400 underline'>
          Back to TaxTaker
        </Link>

        <div className='space-y-4'>
          <h1 className='text-4xl font-bold tracking-tight md:text-5xl'>
            Terms of Service
          </h1>

          <div className='whitespace-pre-wrap rounded-2xl border border-zinc-800 bg-zinc-950 p-6 leading-8 text-zinc-300'>
By using TaxTaker, you agree that the app is provided for educational and informational purposes only.

TaxTaker provides simplified estimates related to:
- tax drag
- Tax Freedom Day
- opportunity cost
- jurisdiction comparison
- Bitcoin-denominated tax drag estimates

The app does not provide tax, legal, investment, immigration, financial planning, residency, or relocation advice.

You are responsible for verifying all information with qualified professionals before making decisions.
          </div>
        </div>
      </div>
    </main>
  )
}