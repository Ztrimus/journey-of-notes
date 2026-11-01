export function bansuriHoles(
  target: number,
  tonic: number,
): { closed: number; half: boolean } | null {
  const degree = (((Math.round(target) - tonic) % 12) + 12) % 12;
  const closed: Record<number, number> = {
    0: 3,
    2: 2,
    4: 1,
    5: 0,
    6: 0,
    7: 6,
    9: 5,
    11: 4,
  };
  return degree in closed
    ? { closed: closed[degree], half: degree === 5 }
    : null;
}
