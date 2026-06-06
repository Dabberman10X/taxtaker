import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const allowedStatuses = new Set([
  'new',
  'reviewed',
  'contacted',
  'qualified',
  'referred',
  'closed',
  'dead',
])

function isUuid(value: unknown) {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!process.env.ADMIN_DASHBOARD_KEY || body.admin_key !== process.env.ADMIN_DASHBOARD_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isUuid(body.id)) {
      return NextResponse.json({ error: 'Valid lead id required' }, { status: 400 })
    }

    if (typeof body.status !== 'string' || !allowedStatuses.has(body.status)) {
      return NextResponse.json({ error: 'Valid status required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('partner_leads')
      .update({ status: body.status })
      .eq('id', body.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}