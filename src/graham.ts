export function grahamHash(stringToHash: string, seed: number) {
  const hashValue: number = (stringToHash.split("") as any[]).reduce(
    (previous, current): number => {
      return previous + current.charCodeAt(0);
    },
    0
  );

  const magicResult = ((hashValue * 9301 + 49297) * seed) % 233280;
  return magicResult / 233280;
}
