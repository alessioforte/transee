export const SCROLLBAR_SIZE = 12;
export const SCROLLBAR_PADDING = 2;
const MIN_THUMB_SIZE = 24;

export function scrollbarGeometry(
  viewport: number,
  content: number,
  position: number,
  hasOtherScrollbar = false
) {
  const max = Math.max(0, content - viewport);
  const track = Math.max(
    0,
    viewport - SCROLLBAR_PADDING * 2 - (hasOtherScrollbar ? SCROLLBAR_SIZE : 0)
  );
  if (viewport <= 0 || max <= 1 || track <= 0) return null;
  const size = Math.min(
    track,
    Math.max(MIN_THUMB_SIZE, (track * viewport) / content)
  );
  const travel = track - size;
  const value = Math.max(0, Math.min(max, position));
  return { max, size, travel, value, offset: (travel * value) / max };
}

export function scrollbarPosition(offset: number, travel: number, max: number) {
  return travel > 0 ? Math.max(0, Math.min(max, (offset / travel) * max)) : 0;
}
