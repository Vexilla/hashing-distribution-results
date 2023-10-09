import fs from "fs";
import path from "path";
import { createHash, getHashes } from "crypto";
import { hashString } from "./hasher.ts";
import { HashDistributionResult } from "./types.ts";
import { grahamHash } from "./graham.ts";

function createCustomHashFunction(seed: number) {
  return function (content: string) {
    return hashString(content, seed);
  };
}

function createGrahamHashFunction(seed: number) {
  return function (content: string) {
    return grahamHash(content, seed);
  };
}

function createHashFunction(algorithm: string) {
  return {
    algorithm,
    hash: function (content: string) {
      const hashResult = createHash(algorithm).update(content).digest("hex");
      return (parseInt(hashResult, 16) % 100) / 100;
    },
  };
}

function createHybridHashFunction(algorithm: string) {
  return {
    algorithm,
    hash: function (content: string) {
      const hashResult = createHash(algorithm).update(content).digest("hex");
      return hashString(hashResult, 0.11);
    },
  };
}

const hashFunctions = getHashes().map(createHashFunction);
const hybridHashFunctions = getHashes().map(createHybridHashFunction);
const customHashFunction = {
  algorithm: "custom",
  hash: createCustomHashFunction(0.11),
};
const grahamHashFunction = {
  algorithm: "graham",
  hash: createGrahamHashFunction(0.11),
};

hashFunctions.push(customHashFunction, grahamHashFunction);
hybridHashFunctions.push(customHashFunction, grahamHashFunction);

function runHashers(
  hashers: typeof hashFunctions,
  stringCount: number,
  nanoid: any
) {
  const hashResults = hashers.map(({ algorithm, hash }) => {
    const result: HashDistributionResult = {
      algorithm,

      twenty: 0,
      fourty: 0,
      sixty: 0,
      eighty: 0,
      hundred: 0,
      time: 0,
    };

    const start = performance.now();

    for (let i = 0; i < stringCount; i++) {
      const stringToHash = nanoid();
      const value = hash(stringToHash);

      if (value < 0.2) {
        result.twenty++;
      } else if (value < 0.4) {
        result.fourty++;
      } else if (value < 0.6) {
        result.sixty++;
      } else if (value < 0.8) {
        result.eighty++;
      } else {
        result.hundred++;
      }
    }

    const end = performance.now();

    result.time = end - start;

    return result;
  });

  hashResults.sort((a, b) => a.time - b.time);

  return hashResults;
}

function createCSV(filename: string, results: HashDistributionResult[]) {
  const keys = Object.keys(results[0]).join(",");
  const resultLines = results
    .map((result) => Object.values(result).join(","))
    .join("\n");

  const output = `${keys}
${resultLines}
`;

  fs.writeFileSync(path.resolve(process.cwd(), "results", filename), output);
}

async function main() {
  const { nanoid } = await import("nanoid");

  [10, 100, 500, 1000, 10000].forEach((stringCount) => {
    console.log(`Running Hashers: ${stringCount}`);
    const results = runHashers(hashFunctions, stringCount, nanoid);
    createCSV(`results-${stringCount}.csv`, results);

    console.log(`Running Hybrid Hashers: ${stringCount}`);
    const hybridResults = runHashers(hybridHashFunctions, stringCount, nanoid);
    createCSV(`results-hybrid-${stringCount}.csv`, hybridResults);
  });
}

main();
