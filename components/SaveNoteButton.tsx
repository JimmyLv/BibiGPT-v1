import Image from 'next/image'
import React from 'react'

export function SaveNoteButton({
  text,
  loading,
  onSave,
}: {
  text: string
  onSave: () => Promise<void>
  loading: boolean
}) {
  return (
    <button
      className="flex w-44 cursor-pointer items-center justify-center rounded-lg bg-green-400 px-2 py-1 text-center font-medium text-white hover:bg-green-400/80"
      onClick={onSave}
    >
      {loading ? <Image src="/loading.svg" alt="Loading..." width={28} height={28} /> : text}
    </button>
  )
}
