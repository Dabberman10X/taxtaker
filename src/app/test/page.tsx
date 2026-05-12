import { createClient } from '@/lib/supabase/server'

export default async function TestPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('jurisdictions').select('*')

  return (
    <main className='p-6 text-white bg-black min-h-screen'>
      <h1 className='text-2xl font-bold mb-4'>Supabase Test</h1>
      <pre className='text-sm whitespace-pre-wrap'>
        {JSON.stringify({ data, error }, null, 2)}
      </pre>
    </main>
  )
}
