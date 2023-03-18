export function extractUrl(videoUrl: string) {
  const matchResult = videoUrl.match(/\/video\/([^\/\?]+)/)
  if (!matchResult) {
    return
  }
  return matchResult[1]
}

export function extractPage(currentVideoUrl: string, searchParams: URLSearchParams) {
  const queryString = currentVideoUrl.split('?')[1]
  const urlParams = new URLSearchParams(queryString)
  return searchParams.get('p') || urlParams.get('p')
}
