const minimumSwipeDistance = 48;

export function getMonthDeltaForSwipe(deltaX: number, deltaY: number): -1 | 0 | 1 {
  if (Math.abs(deltaX) < minimumSwipeDistance || Math.abs(deltaX) <= Math.abs(deltaY)) return 0;

  return deltaX < 0 ? 1 : -1;
}
