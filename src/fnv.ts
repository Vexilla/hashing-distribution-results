const FNV32_OFFSET_BASIS = 2166136261;
const FNV32_PRIME = 16777619;
const GB_FNV32_OFFSET_BASIS = 0x811c9dc5;
const GB_FNV64_OFFSET_BASIS = 0xcbf29ce484222325;
// const FNV64_PRIME = 16777619;
const utf8EncodeText = new TextEncoder();

export function fnv1a(stringToHash: string, seed: number) {
  const byteArray = utf8EncodeText.encode(stringToHash);

  let total = FNV32_OFFSET_BASIS;
  const length = byteArray.length;

  for (let i = 0; i < length; i++) {
    const byte = byteArray[i];
    total = total ^ byte;
    total = total * FNV32_PRIME;
  }

  const result = ((total * seed) % 100) / 100;
  return Math.abs(result);
}

// from GrowthBook
export function hashFnv32a(str: string): number {
  let hval = GB_FNV32_OFFSET_BASIS;
  const l = str.length;

  for (let i = 0; i < l; i++) {
    hval ^= str.charCodeAt(i);
    hval +=
      (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }
  return hval >>> 0;
}

export function hashGB(seed: string, value: string): number {
  return (hashFnv32a(hashFnv32a(seed + value) + "") % 10000) / 10000;
}

// from GrowthBook
export function hashFnv64a(str: string): number {
  let hval = GB_FNV64_OFFSET_BASIS;
  const l = str.length;

  for (let i = 0; i < l; i++) {
    hval ^= str.charCodeAt(i);
    hval +=
      (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }

  return hval >>> 0;
}

export function hashGB64(seed: string, value: string): number {
  return (hashFnv64a(hashFnv64a(seed + value) + "") % 10000) / 10000;
}
