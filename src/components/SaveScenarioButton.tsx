'use client'

import { useState } from 'react'

type SaveScenarioButtonProps = {
  payload: Record<string, unknown>
}

export default function SaveScenarioButton({
  payload,
}: SaveScenarioButtonProps) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [publicUrl, setPublicUrl] = useState('')

  async function handleSave() {
    try {
      setStatus('saving')
      setMessage('')
      setPublicUrl('')

      const response = await fetch('/api/save-scenario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save scenario')
      }

      const url = window.location.origin + '/share/' + data.public_slug

      setStatus('saved')
      setMessage('Scenario saved')
      setPublicUrl(url)
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Save failed')
    }
  }

  async function handleCopyLink() {
    if (!publicUrl) return
    try {
      await navigator.clipboard.writeText(publicUrl)
      setMessage('Public link copied')
    } catch (error) {
      setMessage('Copy failed')
    }
  }

  return (
    <div className='flex flex-wrap items-center gap-3'>
      <button
        type='button'
        onClick={handleSave}
        disabled={status === 'saving'}
        className='rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium hover:border-zinc-500 disabled:opacity-50'
      >
        {status === 'saving' ? 'Saving...' : 'Save Scenario'}
      </button>

      {publicUrl ? (
        <>
          <button
            type='button'
            onClick={handleCopyLink}
            className='rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium hover:border-zinc-500'
          >
            Copy Public Link
          </button>
          <a
            href={publicUrl}
            target='_blank'
            rel='noreferrer'
            className='rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium hover:border-zinc-500'
          >
            Open Public Page
          </a>
        </>
      ) : null}

      {message ? <span className='text-sm text-zinc-400'>{message}</span> : null}
    </div>
  )
}
