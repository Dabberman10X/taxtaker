'use client'

import { useState } from 'react'

const statuses = [
  'new',
  'reviewed',
  'contacted',
  'qualified',
  'referred',
  'closed',
  'dead',
]

function formatStatus(status: string) {
  return status.replaceAll('_', ' ')
}

export default function PartnerLeadStatusButtons({
  leadId,
  initialStatus,
  adminKey,
}: {
  leadId: string
  initialStatus: string | null
  adminKey: string
}) {
  const [currentStatus, setCurrentStatus] = useState(initialStatus || 'new')
  const [savingStatus, setSavingStatus] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function updateStatus(nextStatus: string) {
    try {
      setSavingStatus(nextStatus)
      setError('')

      const response = await fetch('/api/partner-leads/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: leadId,
          status: nextStatus,
          admin_key: adminKey,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Could not update status')
      }

      setCurrentStatus(nextStatus)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status update failed')
    } finally {
      setSavingStatus(null)
    }
  }

  return (
    <div className='space-y-2'>
      <div className='flex flex-wrap gap-2'>
        {statuses.map((status) => {
          const active = status === currentStatus

          return (
            <button
              key={status}
              type='button'
              onClick={() => updateStatus(status)}
              disabled={savingStatus !== null}
              className={
                active
                  ? 'rounded-xl border border-green-500/40 bg-green-500/15 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-green-300'
                  : 'rounded-xl border border-zinc-800 bg-black px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-400 hover:border-zinc-600 hover:text-white disabled:opacity-60'
              }
            >
              {savingStatus === status ? 'saving...' : formatStatus(status)}
            </button>
          )
        })}
      </div>

      {error ? <div className='text-xs text-red-400'>{error}</div> : null}
    </div>
  )
}