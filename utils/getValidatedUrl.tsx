export function getValidatedUrl(
  isReady: boolean,
  currentVideoUrl: string,
  urlState?: string | string[]
): string | undefined {
  const isValidatedUrl =
    isReady &&
    !currentVideoUrl &&
    urlState &&
    typeof urlState !== "string" &&
    urlState.every((subslug: string) => typeof subslug === "string");

  if (isValidatedUrl) {
    return `https://bilibili.com/${(urlState as string[]).join("/")}`;
  }
}
