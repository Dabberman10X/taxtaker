import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type PageProps = {
  searchParams: Promise<{
    key?: string
  }>
}

function label(value: unknown) {
  if (value === null || value === undefined || value === '') return '—'
  return String(value).replaceAll('_', ' ')
}

export default async function PartnerLeadsAdminPage({ searchParams }: PageProps) {
  const params = await searchParams
  const adminKey = process.env.ADMIN_DASHBOARD_KEY

  if (!adminKey) {
    return (
      <main className='min-h-screen bg-black p-6 text-white md:p-10'>
        <h1 className='text-4xl font-bold'>Admin not configured</h1>
        <p className='mt-3 text-zinc-400'>ADMIN_DASHBOARD_KEY is missing.</p>
      </main>
    )
  }

  if (params.key !== adminKey) {
    return (
      <main className='min-h-screen bg-black p-6 text-white md:p-10'>
        <div className='mx-auto max-w-3xl space-y-4'>
          <h1 className='text-4xl font-bold'>Private Dashboard</h1>
          <p className='text-zinc-400'>Add the admin key to view partner leads.</p>
          <Link href='/' className='text-blue-400 underline'>Back to TaxTaker</Link>
        </div>
      </main>
    )
  }

  const supabase = createAdminClient()

  const { data: leads, error } = await supabase
    .from('partner_leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <main className='min-h-screen bg-black p-6 text-white md:p-10'>
      <div className='mx-auto max-w-7xl space-y-8'>
        <div>
          <Link href='/' className='text-sm text-blue-400 underline'>Back to TaxTaker</Link>
          <h1 className='mt-4 text-4xl font-bold md:text-6xl'>Partner Leads</h1>
          <p className='mt-3 text-zinc-400'>
            Private lead review dashboard. Latest 100 partner-interest submissions.
          </p>
        </div>

        {error ? (
          <div className='rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-red-300'>
            {error.message}
          </div>
        ) : null}

        <div className='grid grid-cols-1 gap-4'>
          {(leads ?? []).map((lead) => (
            <section key={lead.id} className='rounded-2xl border border-zinc-800 bg-zinc-950 p-6'>
              <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
                <div>
                  <div className='text-xs uppercase tracking-widest text-zinc-500'>
                    {label(lead.source)} · {new Date(lead.created_at).toLocaleString()}
                  </div>
                  <h2 className='mt-2 text-2xl font-bold'>{lead.email}</h2>
                  <p className='mt-1 text-zinc-400'>
                    {label(lead.current_jurisdiction)} → {label(lead.target_jurisdiction)}
                  </p>
                </div>

                <div className='rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-300'>
                  {label(lead.status)}
                </div>
              </div>

              <div className='mt-6 grid grid-cols-1 gap-3 md:grid-cols-4'>
                <Info label='Persona' value={label(lead.persona)} />
                <Info label='Help Needed' value={label(lead.help_needed)} />
                <Info label='Timeline' value={label(lead.timeline)} />
                <Info label='Budget' value={label(lead.budget_range)} />
              </div>

              {lead.notes ? (
                <div className='mt-4 rounded-xl border border-zinc-800 bg-black p-4'>
                  <div className='text-xs uppercase tracking-widest text-zinc-500'>Notes</div>
                  <p className='mt-2 text-zinc-300'>{lead.notes}</p>
                </div>
              ) : null}
            </section>
          ))}

          {(leads ?? []).length === 0 ? (
            <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-400'>
              No leads yet.
            </div>
          ) : null}
        </div>
      </div>
    </main>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-xl border border-zinc-800 bg-black p-4'>
      <div className='text-xs uppercase tracking-widest text-zinc-500'>{label}</div>
      <div className='mt-2 font-semibold'>{value}</div>
    </div>
  )
}