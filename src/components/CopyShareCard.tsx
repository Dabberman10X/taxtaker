'use client'

type CopyShareCardProps = {
  title: string
  body: string
  accent: string
}

export default function CopyShareCard({
  title,
  body,
  accent,
}: CopyShareCardProps) {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(body)
    } catch (error) {
      console.error('Copy failed', error)
    }
  }

  return (
    <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-6'>
      <div className={'mb-3 text-xs font-semibold uppercase tracking-widest ' + accent}>
        {title}
      </div>
      <p className='whitespace-pre-wrap text-sm leading-6 text-zinc-200'>{body}</p>
      <button
        type='button'
        className='mt-4 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium hover:border-zinc-500'
        onClick={handleCopy}
      >
        Copy
      </button>
    </div>
  )
}
