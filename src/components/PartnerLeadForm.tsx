'use client'

import { useState } from 'react'

type PartnerLeadFormProps = {
  source: string
  persona?: string | null
  currentJurisdiction?: string | null
  targetJurisdiction?: string | null
  scenarioId?: string | null
}

export default function PartnerLeadForm({
  source,
  persona,
  currentJurisdiction,
  targetJurisdiction,
  scenarioId,
}: PartnerLeadFormProps) {
  const [email, setEmail] = useState('')
  const [helpNeeded, setHelpNeeded] = useState('not_sure')
  const [timeline, setTimeline] = useState('just_researching')
  const [budgetRange, setBudgetRange] = useState('unknown')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function submitLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setStatus('saving')
      setMessage('')

      const response = await fetch('/api/partner-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source,
          persona,
          current_jurisdiction: currentJurisdiction,
          target_jurisdiction: targetJurisdiction,
          scenario_id: scenarioId,
          help_needed: helpNeeded,
          timeline,
          budget_range: budgetRange,
          notes,
          metadata: {
            page: typeof window !== 'undefined' ? window.location.pathname : null,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Could not save partner lead')
      }

      setStatus('saved')
      setMessage('Saved. We will use this to match future partner options.')
      setEmail('')
      setNotes('')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Something went wrong')
    }
  }

  return (
    <form onSubmit={submitLead} className='space-y-4'>
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
        <input
          type='email'
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder='Email'
          className='rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-zinc-500'
        />

        <select
          value={helpNeeded}
          onChange={(event) => setHelpNeeded(event.target.value)}
          className='rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none focus:border-zinc-500'
        >
          <option value='not_sure'>Not sure yet</option>
          <option value='residency'>Residency / visa help</option>
          <option value='second_citizenship'>Second citizenship</option>
          <option value='tax_planning'>Tax planning</option>
          <option value='business_setup'>Business setup</option>
          <option value='banking'>Banking / offshore setup</option>
          <option value='real_estate'>Real estate relocation</option>
          <option value='bitcoin_friendly'>Bitcoin-friendly relocation</option>
        </select>

        <select
          value={timeline}
          onChange={(event) => setTimeline(event.target.value)}
          className='rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none focus:border-zinc-500'
        >
          <option value='just_researching'>Just researching</option>
          <option value='0_6_months'>0–6 months</option>
          <option value='6_12_months'>6–12 months</option>
          <option value='1_2_years'>1–2 years</option>
          <option value='ready_now'>Ready now</option>
        </select>

        <select
          value={budgetRange}
          onChange={(event) => setBudgetRange(event.target.value)}
          className='rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none focus:border-zinc-500'
        >
          <option value='unknown'>Budget unknown</option>
          <option value='under_5k'>Under $5K</option>
          <option value='5k_25k'>$5K–$25K</option>
          <option value='25k_100k'>$25K–$100K</option>
          <option value='100k_plus'>$100K+</option>
        </select>
      </div>

      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder='Optional: what country are you curious about, or what help would matter most?'
        className='min-h-24 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-zinc-500'
      />

      <button
        type='submit'
        disabled={status === 'saving'}
        className='rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200 disabled:opacity-60'
      >
        {status === 'saving' ? 'Saving...' : 'Get Matched Later'}
      </button>

      {message ? (
        <div className={status === 'error' ? 'text-sm text-red-400' : 'text-sm text-green-400'}>
          {message}
        </div>
      ) : null}
    </form>
  )
}