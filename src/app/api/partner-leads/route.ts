import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function cleanText(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

function cleanUuid(value: unknown) {
  if (typeof value !== 'string') return null
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const email = cleanText(body.email)?.toLowerCase() ?? ''

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase.from('partner_leads').insert({
      email,
      source: cleanText(body.source),
      persona: cleanText(body.persona),
      current_jurisdiction: cleanText(body.current_jurisdiction),
      target_jurisdiction: cleanText(body.target_jurisdiction),
      scenario_id: cleanUuid(body.scenario_id),
      help_needed: cleanText(body.help_needed),
      timeline: cleanText(body.timeline),
      budget_range: cleanText(body.budget_range),
      notes: cleanText(body.notes),
      metadata: body.metadata && typeof body.metadata === 'object' ? body.metadata : {},
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}