export function hashString(stringToHash: string, seed: number) {
  const characters = stringToHash.split("") as any[];

  let hashValue = 0;
  const length = characters.length;

  for (let i = 0; i < length; i++) {
    hashValue += characters[i].charCodeAt(0);
  }

  return (Math.floor(hashValue * seed * 42) % 100) / 100;
}
