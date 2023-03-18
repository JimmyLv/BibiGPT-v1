export function getVideoIdFromUrl(
  isReady: boolean,
  currentVideoUrl: string,
  urlState?: string | string[],
  searchParams?: URLSearchParams,
): string | undefined {
  // todo: replace urlState to usePathname() https://beta.nextjs.org/docs/api-reference/use-pathname
  const isValidatedUrl =
    isReady &&
    !currentVideoUrl &&
    urlState &&
    typeof urlState !== 'string' &&
    urlState.every((subslug: string) => typeof subslug === 'string')

  if (isValidatedUrl) {
    if (urlState[0] === 'watch') {
      return 'https://youtube.com/watch?v=' + searchParams?.get('v')
    }
    return `https://bilibili.com/${(urlState as string[]).join('/')}`
  }
}
