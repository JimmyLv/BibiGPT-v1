import type { NextApiResponse } from 'next'

export async function writeWebStreamToNodeResponse(
  stream: ReadableStream<Uint8Array<ArrayBufferLike>>,
  res: NextApiResponse,
) {
  const reader = stream.getReader()

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }
      if (value) {
        res.write(Buffer.from(value))
      }
    }
  } finally {
    reader.releaseLock()
  }

  res.end()
}
