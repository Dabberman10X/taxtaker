import PartnerLeadForm from '@/components/PartnerLeadForm'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export default async function JurisdictionDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const [{ data: jurisdiction }, { data: taxProfile }] = await Promise.all([
    supabase.from('jurisdictions').select('*').eq('slug', slug).single(),
    supabase.from('tax_rate_profiles').select('*').eq('jurisdiction_slug', slug).single(),
  ])

  if (!jurisdiction) {
    return (
      <main className='min-h-screen bg-black p-8 text-white'>
        <div className='mx-auto max-w-4xl space-y-4'>
          <h1 className='text-4xl font-bold'>Jurisdiction not found</h1>
          <Link href='/calculator' className='text-blue-400 underline'>
            Back to calculator
          </Link>
        </div>
      </main>
    )
  }

  const baseRate =
    taxProfile?.default_effective_rate !== null &&
    taxProfile?.default_effective_rate !== undefined
      ? Number(taxProfile.default_effective_rate) * 100
      : null

  const isZeroTax = baseRate === 0

  return (
    <main className='min-h-screen bg-black p-6 text-white md:p-10'>
      <div className='mx-auto max-w-5xl space-y-8'>
        <div className='space-y-3'>
          <Link href='/calculator' className='text-sm text-blue-400 underline'>
            Back to calculator
          </Link>

          <div className='inline-flex rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs text-zinc-400'>
            TaxTaker Jurisdiction
          </div>

          <h1 className='text-4xl font-bold tracking-tight md:text-6xl'>
            {jurisdiction.display_name}
          </h1>

          <p className='max-w-3xl text-lg text-zinc-400'>
            A TaxTaker jurisdiction profile showing the current modeled tax rate,
            why this location ranks, and where relocation or country-score services
            can plug in later.
          </p>
        </div>

        <section className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-6'>
            <div className='text-sm text-zinc-400'>Country Code</div>
            <div className='mt-2 text-3xl font-bold'>{jurisdiction.country_code}</div>
          </div>

          <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-6'>
            <div className='text-sm text-zinc-400'>Currency</div>
            <div className='mt-2 text-3xl font-bold'>{jurisdiction.currency_code}</div>
          </div>

          <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-6'>
            <div className='text-sm text-zinc-400'>Modeled Tax Rate</div>
            <div className='mt-2 text-3xl font-bold'>
              {baseRate !== null ? baseRate.toFixed(2) + '%' : 'N/A'}
            </div>
          </div>
        </section>

        <section className='rounded-2xl border border-zinc-800 bg-zinc-950 p-6'>
          <div className='text-sm text-zinc-400'>Why it ranks</div>
          <h2 className='mt-2 text-2xl font-bold'>
            {isZeroTax
              ? 'This jurisdiction sits inside the zero-tax comparison cluster.'
              : 'This jurisdiction may reduce tax drag versus higher-tax locations.'}
          </h2>
          <p className='mt-3 leading-7 text-zinc-300'>
            {taxProfile?.notes ?? jurisdiction.notes ?? 'No additional notes available yet.'}
          </p>
          <p className='mt-4 text-sm text-zinc-500'>
            TaxTaker uses simplified educational assumptions. This page is not tax,
            legal, immigration, investment, or relocation advice.
          </p>
        </section>

        <section className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-6'>
            <div className='text-sm text-zinc-400'>Relocation Help</div>
            <h3 className='mt-2 text-xl font-bold'>Future partner slot</h3>
            <p className='mt-2 text-sm text-zinc-400'>
              Later this can link to vetted relocation, residency, legal, tax, or setup partners.
            </p>
            <a href='#' className='mt-4 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200'>
              Coming Soon
            </a>
          </div>

          <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-6'>
            <div className='text-sm text-zinc-400'>AtlasScore</div>
            <h3 className='mt-2 text-xl font-bold'>Full country score</h3>
            <p className='mt-2 text-sm text-zinc-400'>
              Later this can hand off to broader scoring beyond tax: lifestyle, safety, banking, mobility, and fit.
            </p>
            <a href='#' className='mt-4 inline-flex rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold hover:border-zinc-500'>
              Coming Soon
            </a>
          </div>

          <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-6'>
            <div className='text-sm text-zinc-400'>Sovereign Path</div>
            <h3 className='mt-2 text-xl font-bold'>Execution workflow</h3>
            <p className='mt-2 text-sm text-zinc-400'>
              Later this can become the bridge into the larger Sovereign Mobility system.
            </p>
            <a href='#' className='mt-4 inline-flex rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold hover:border-zinc-500'>
              Coming Soon
            </a>
          </div>
        </section>

        <section className='rounded-2xl border border-green-500/30 bg-green-500/5 p-6'>
          <div className='text-sm uppercase tracking-widest text-green-400'>Partner Match</div>
          <h2 className='mt-2 text-3xl font-bold'>Need help exploring this jurisdiction?</h2>
          <p className='mt-3 max-w-3xl text-zinc-400'>
            Join the future partner list for relocation, residency, tax planning, business setup,
            banking, Bitcoin-friendly jurisdictions, or second-citizenship help.
          </p>

          <div className='mt-6'>
            <PartnerLeadForm
              source='jurisdiction_page'
              targetJurisdiction={jurisdiction.slug}
            />
          </div>
        </section>
      </div>
    </main>
  )
}