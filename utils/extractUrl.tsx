export function extractUrl(videoUrl: string) {
  const matchResult = videoUrl.match(/\/video\/([^\/\?]+)/);
  if (!matchResult) {
    return;
  }
  return matchResult[1];
}
