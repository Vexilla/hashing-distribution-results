export function djb2(stringToHash: string, seed: number) {
  const characters = stringToHash.split("") as any[];
  let hashValue = 5381;
  const length = characters.length;

  for (let i = 0; i < length; i++) {
    hashValue = (hashValue << 5) + hashValue + characters[i].charCodeAt(0);
  }

  return Math.abs((Math.floor(hashValue * seed) % 100) / 100);
}
