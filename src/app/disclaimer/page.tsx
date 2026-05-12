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
            Disclaimer
          </h1>

          <div className='whitespace-pre-wrap rounded-2xl border border-zinc-800 bg-zinc-950 p-6 leading-8 text-zinc-300'>
TaxTaker is an educational calculator.

All outputs are estimates based on simplified assumptions and model inputs. Actual tax obligations, residency rules, immigration rules, investment outcomes, and relocation consequences may vary significantly.

TaxTaker does not provide:
- tax advice
- legal advice
- immigration advice
- investment advice
- financial planning advice
- relocation advice

Jurisdiction comparisons are simplified and should not be used as the sole basis for any financial, tax, residency, or relocation decision.

Always consult qualified tax, legal, immigration, and financial professionals before acting.
          </div>
        </div>
      </div>
    </main>
  )
}