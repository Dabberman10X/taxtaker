import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const source = typeof body.source === 'string' ? body.source : 'unknown'
    const persona = typeof body.persona === 'string' ? body.persona : null
    const current_jurisdiction =
      typeof body.current_jurisdiction === 'string' ? body.current_jurisdiction : null
    const interest = typeof body.interest === 'string' ? body.interest : null
    const metadata =
      body.metadata && typeof body.metadata === 'object' ? body.metadata : {}

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase.from('leads').insert({
      email,
      source,
      persona,
      current_jurisdiction,
      interest,
      metadata,
    })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({
          ok: true,
          duplicate: true,
          message: 'Email already saved',
        })
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}