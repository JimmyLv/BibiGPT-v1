import { VideoConfig } from "~/lib/types";

export function getCacheId({
  showTimestamp,
  videoId,
  detailLevel,
}: VideoConfig) {
  return showTimestamp
    ? `timestamp-${videoId}-${detailLevel}`
    : `${videoId}-${detailLevel}`;
}
