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
            Privacy Policy
          </h1>

          <div className='whitespace-pre-wrap rounded-2xl border border-zinc-800 bg-zinc-950 p-6 leading-8 text-zinc-300'>
TaxTaker collects email addresses only when users voluntarily submit them through an opt-in form.

We may store:
- email address
- source page
- selected persona
- selected jurisdiction
- basic metadata related to the opt-in

TaxTaker does not sell personal information.

This MVP uses Supabase to store submitted lead information. Additional analytics or email tools may be added later for product improvement and communication.

Users can request removal from the early access list at any time.
          </div>
        </div>
      </div>
    </main>
  )
}