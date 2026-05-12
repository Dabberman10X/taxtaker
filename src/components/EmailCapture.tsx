'use client'

import { useState } from 'react'

type EmailCaptureProps = {
  source: string
  persona?: string
  currentJurisdiction?: string
  interest?: string
  buttonLabel?: string
}

export default function EmailCapture({
  source,
  persona,
  currentJurisdiction,
  interest,
  buttonLabel = 'Join Early Access',
}: EmailCaptureProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setStatus('saving')
      setMessage('')

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source,
          persona: persona ?? null,
          current_jurisdiction: currentJurisdiction ?? null,
          interest: interest ?? null,
          metadata: {
            page: typeof window !== 'undefined' ? window.location.pathname : '/',
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Could not save email')
      }

      setStatus('saved')
      setMessage('You are on the early access list.')
      setEmail('')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Something went wrong')
    }
  }

  return (
    <form onSubmit={handleSubmit} className='flex w-full flex-col gap-3 sm:flex-row'>
      <input
        type='email'
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder='Enter your email'
        className='min-h-12 flex-1 rounded-xl border border-zinc-800 bg-black px-4 text-white outline-none placeholder:text-zinc-500 focus:border-zinc-500'
      />
      <button
        type='submit'
        disabled={status === 'saving'}
        className='min-h-12 rounded-xl bg-white px-5 font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-60'
      >
        {status === 'saving' ? 'Saving...' : buttonLabel}
      </button>
      {message ? (
        <div className={status === 'error' ? 'text-sm text-red-400' : 'text-sm text-green-400'}>
          {message}
        </div>
      ) : null}
    </form>
  )
}