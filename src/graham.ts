export function grahamHash(stringToHash: string, seed: number) {
  const characters = stringToHash.split("") as any[];

  let hashValue = 0;
  const length = characters.length;

  for (let i = 0; i < length; i++) {
    hashValue += characters[i].charCodeAt(0);
  }

  const magicResult = ((hashValue * 9301 + 49297) * seed) % 233280;
  return magicResult / 233280;
}
