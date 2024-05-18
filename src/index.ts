import fs from "fs";
import path from "path";
import { createHash, getHashes } from "crypto";
import { hashString } from "./hasher.ts";
import { HashDistributionResult, RawHashDistributionResult } from "./types.ts";
import { grahamHash } from "./graham.ts";
import { fnv1a, hashGB, hashGB64 } from "./fnv.ts";
import { djb2 } from "./djb2.ts";

interface RawRow {
  algorithm: string;
  value: number;
  time: number;
}

function parseCSVIntoData<T>(csv: string): T[] {
  const rows = csv.split("\n");

  const headerRowColumns = rows.shift()?.split(",") || [];
  // console.log({ headerRowColumns });

  const mappedRows = rows
    .map((row) => {
      const columns = row.split(",");

      const mappedRow: Record<string, string | number> = {};

      columns.forEach((column, columnIndex) => {
        let value: number | string = column;
        if (columnIndex !== 0) {
          value = Number(column);
        }
        mappedRow[headerRowColumns[columnIndex]] = value;
      });

      return mappedRow;
    })
    .filter((row) => Boolean(row.algorithm));
  // .filter((row) => {
  //   return row.algorithm !== "fnv-1a";
  // })
  // .slice(0, 10000);

  return mappedRows as unknown as T[];
}

// function parseRawData(rows: { algorithm: string; value: number }[]) {
//   const cells: BoxPlotDatum[] = [];

//   rows.forEach((row) => {
//     cells.push({
//       group: row.algorithm.trim(),
//       // mu: row[bucket] as number,
//       // mu: 20,
//       sd: 1,
//       // n: 5,
//       value: row.value,
//     });
//   });

//   return cells;
// }

function createCustomHashFunction(
  algorithm: string,
  hashFunction: (stringToHash: string | number, seed: number) => number,
  seed: number = 0.11
) {
  return {
    algorithm,
    hash: function (content: string) {
      return hashFunction(content, seed);
    },
  };
}

// 4096 based instead of 100
function createNodeHashFunction(algorithm: string) {
  return {
    algorithm,
    hash: function (content: string) {
      const hashResult = createHash(algorithm).update(content).digest("hex");
      const digestedBigInt = BigInt(`0x${hashResult}`);
      const moduloedInt = digestedBigInt % 4096n;
      const parsedInt = Number(moduloedInt);
      const result = parsedInt / 4096;
      return result;
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

let hashFunctions = getHashes().map(createNodeHashFunction);
const hybridHashFunctions = getHashes().map(createHybridHashFunction);

const customHashFunction = createCustomHashFunction("custom", hashString);
const fnv1aHashFunction = createCustomHashFunction("fnv1a", fnv1a);
const djb2HashFunction = createCustomHashFunction("djb2", djb2);
const grahamHashFunction = createCustomHashFunction("graham", grahamHash);
const gb32HashFunction = createCustomHashFunction("gb32", (value, seed) =>
  hashGB(`${seed}`, `${value}`)
);
const gb64HashFunction = createCustomHashFunction("gb64", (value, seed) =>
  hashGB64(`${seed}`, `${value}`)
);

// hashFunctions.push(
//   customHashFunction,
//   grahamHashFunction,
//   fnv1aHashFunction,
//   djb2HashFunction,
//   gb32HashFunction,
//   gb64HashFunction
// );

hashFunctions = [
  customHashFunction,
  grahamHashFunction,
  fnv1aHashFunction,
  djb2HashFunction,
  gb32HashFunction,
  gb64HashFunction,
  ...hashFunctions,
];

function runHashers(
  hashers: typeof hashFunctions,
  stringCount: number,
  nanoid: any,
  useIndex: boolean = false
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

    const rawResults: RawHashDistributionResult[] = [];

    let totalTime = 0;

    for (let i = 0; i < stringCount; i++) {
      const stringToHash = useIndex ? `${i}` : nanoid();
      const start = performance.now();
      const value = hash(stringToHash);
      const end = performance.now();

      const iterationTime = end - start;
      totalTime += iterationTime;

      const rawResult: RawHashDistributionResult = {
        algorithm,
        value: value * 100,
        time: iterationTime,
      };

      rawResults.push(rawResult);

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

    result.time = totalTime / stringCount;
    // console.log(`${algorithm}: ${result.time}`);

    return { bucketed: result, raw: rawResults };
  });

  hashResults.sort((a, b) => a.bucketed.time - b.bucketed.time);

  return hashResults;
}

function createCSV(
  filename: string,
  results: HashDistributionResult[] | RawHashDistributionResult[][]
) {
  const resultsDir = path.resolve(process.cwd(), "results");
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
  }

  let keys = Object.keys(results[0]).join(",");

  let resultLines: string = "";

  if (Array.isArray(results[0])) {
    keys = "algorithm,value,time";

    results.forEach((resultArray) => {
      resultArray.forEach((result) => {
        resultLines += `${Object.values(result).join(",")}\n`;
      });
    });

    const output = `${keys}
${resultLines}
`;

    // fs.writeFileSync(path.resolve(resultsDir, filename), output);

    const boxPlotData = parseCSVIntoData<RawRow>(output);

    fs.writeFileSync(
      path.resolve(resultsDir, filename.replace(".csv", ".json")),
      JSON.stringify(boxPlotData)
    );
  } else {
    resultLines = results
      .map((result) => {
        return Object.values(result).join(",");
      })
      .join("\n");

    const output = `${keys}
${resultLines}
`;

    fs.writeFileSync(path.resolve(resultsDir, filename), output);
  }
}

async function main() {
  const { nanoid } = await import("nanoid");

  [10, 100, 500, 1000, 10000].forEach((stringCount) => {
    // console.log(`Running Hashers: ${stringCount}`);
    const results = runHashers(hashFunctions, stringCount, nanoid);
    createCSV(
      `results-${stringCount}.csv`,
      results.map((result) => result.bucketed)
    );
    createCSV(
      `raw-results-${stringCount}.csv`,
      results.map((result) => result.raw)
    );

    // console.log(`Running Hashers using incremented integers: ${stringCount}`);
    const intResults = runHashers(hashFunctions, stringCount, nanoid, true);
    createCSV(
      `results-int-${stringCount}.csv`,
      intResults.map((result) => result.bucketed)
    );
    createCSV(
      `raw-results-int-${stringCount}.csv`,
      intResults.map((result) => result.raw)
    );

    // console.log(`Running Hybrid Hashers: ${stringCount}`);
    const hybridResults = runHashers(hybridHashFunctions, stringCount, nanoid);
    createCSV(
      `results-hybrid-${stringCount}.csv`,
      hybridResults.map((result) => result.bucketed)
    );
    createCSV(
      `raw-results-hybrid-${stringCount}.csv`,
      hybridResults.map((result) => result.raw)
    );
  });
}

main();
