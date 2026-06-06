import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const fields = [
  'id',
  'email',
  'source',
  'persona',
  'current_jurisdiction',
  'target_jurisdiction',
  'help_needed',
  'timeline',
  'budget_range',
  'status',
  'notes',
  'created_at',
  'updated_at',
]

function csvCell(value: unknown) {
  if (value === null || value === undefined) return ''

  const text =
    typeof value === 'object'
      ? JSON.stringify(value)
      : String(value)

  const escaped = text.replaceAll('"', '""')

  if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
    return `"${escaped}"`
  }

  return escaped
}

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')
  const adminKey = process.env.ADMIN_DASHBOARD_KEY

  if (!adminKey || key !== adminKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data: leads, error } = await supabase
    .from('partner_leads')
    .select(fields.join(','))
    .order('created_at', { ascending: false })
    .limit(1000)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const typedLeads = (leads ?? []) as unknown as Record<string, unknown>[]

  const rows = [
    fields.join(','),
    ...typedLeads.map((lead) =>
      fields.map((field) => csvCell(lead[field])).join(',')
    ),
  ]

  const today = new Date().toISOString().slice(0, 10)

  return new NextResponse(rows.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="taxtaker-partner-leads-${today}.csv"`,
    },
  })
}