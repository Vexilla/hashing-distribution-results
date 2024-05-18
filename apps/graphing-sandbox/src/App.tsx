// eslint-disable-next-line @typescript-eslint/no-unused-vars
import _React, { LegacyRef, useRef } from "react";
import { ResponsiveBoxPlot, type BoxPlotDatum } from "@nivo/boxplot";
import "./App.css";

// import results1 from "./assets/results/results-1.csv?raw";
// import results10 from "./assets/results/results-10.csv?raw";
import results100 from "./assets/results/results-100.csv?raw";
// import results500 from "./assets/results/results-500.csv?raw";
import results1000 from "./assets/results/results-1000.csv?raw";
// import results10000 from "./assets/results/results-10000.csv?raw";

import rawResults1 from "./assets/results/raw-results-1.csv?raw";
import rawResults10 from "./assets/results/raw-results-10.csv?raw";
import rawResults100 from "./assets/results/raw-results-100.csv?raw";
import rawResults500 from "./assets/results/raw-results-500.csv?raw";
import rawResults1000 from "./assets/results/raw-results-1000.csv?raw";
import rawResults10000 from "./assets/results/raw-results-10000.csv?raw";

import rawIntResults1 from "./assets/results/raw-results-int-1.csv?raw";
import rawIntResults10 from "./assets/results/raw-results-int-10.csv?raw";
import rawIntResults100 from "./assets/results/raw-results-int-100.csv?raw";
import rawIntResults500 from "./assets/results/raw-results-int-500.csv?raw";
import rawIntResults1000 from "./assets/results/raw-results-int-1000.csv?raw";
import rawIntResults10000 from "./assets/results/raw-results-int-10000.csv?raw";

interface Row {
  algorithm: string;
  twenty: number;
  fourty: number;
  sixty: number;
  eighty: number;
  hundred: number;
  time: number;
}

interface RawRow {
  algorithm: string;
  value: number;
  time: number;
}

function parseCSVIntoData<T>(csv: string): T[] {
  const rows = csv.split("\n");

  const headerRowColumns = rows.shift()?.split(",") || [];
  console.log({ headerRowColumns });

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
    // .filter((row) => {
    //   return row.algorithm !== "fnv-1a";
    // })
    .slice(0, 10000);

  return mappedRows as unknown as T[];
}

function parseData(rows: Row[]): BoxPlotDatum[] {
  const cells: BoxPlotDatum[] = [];

  rows.forEach((row) => {
    const total =
      row.twenty + row.fourty + row.sixty + row.eighty + row.hundred;

    (
      ["twenty", "fourty", "sixty", "eighty", "hundred"] as (keyof Row)[]
    ).forEach((bucket) => {
      cells.push({
        group: row.algorithm,
        // mu: row[bucket] as number,
        // mu: 20,
        sd: 1,
        n: 5,
        value: ((row[bucket] as number) / total) * 100,
      });
    });
  });

  console.log({ cells });

  return cells;
}

function parseRawData(rows: { algorithm: string; value: number }[]) {
  const cells: BoxPlotDatum[] = [];

  rows.forEach((row) => {
    cells.push({
      group: row.algorithm,
      // mu: row[bucket] as number,
      // mu: 20,
      sd: 1,
      // n: 5,
      value: row.value,
    });
  });

  console.log({ cells });

  return cells;
}

function parseCSV(csv: string) {
  const parsedData = parseCSVIntoData<Row>(csv);
  // return parseDataIntoBoxPlotData(parsedData);
  return parseData(parsedData);
}

function parseRawCSV(csv: string) {
  const parsedData = parseCSVIntoData<RawRow>(csv);
  return parseRawData(parsedData);
}

function App() {
  // const parsed1Data = parseCSV(results1);
  // const parsed10Data = parseCSV(results10);
  const parsed100Data = parseCSV(results100);
  const rawParsed1000Data = parseRawCSV(rawResults1000);
  const rawIntParsed1000Data = parseRawCSV(rawIntResults1000);
  // const parsed500Data = parseCSV(results500);
  const parsed1000Data = parseCSV(results1000);
  // const rawParsed1000Data = parseRawCSV(rawResults1000);
  // const parsed10000Data = parseCSV(results10000);

  console.log({ parsed1000Data });

  return (
    <>
      <div style={{ height: 1000, width: 1000 }}>
        <ResponsiveBoxPlot
          data={rawIntParsed1000Data.reverse()}
          layout="horizontal"
          quantiles={[0, 0.25, 0.5, 0.75, 1]}
          margin={{
            top: 100,
            right: 100,
            bottom: 100,
            left: 100,
          }}
          padding={0.12}
          enableGridX={true}
          axisTop={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "",
            legendOffset: 36,
            truncateTickAt: 0,
          }}
          axisRight={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "",
            legendOffset: 0,
            truncateTickAt: 0,
          }}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "group",
            legendPosition: "middle",
            legendOffset: 32,
            truncateTickAt: 0,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "value",
            legendPosition: "middle",
            legendOffset: -40,
            truncateTickAt: 0,
          }}
          colors={["#257DDD"]}
          borderRadius={2}
          borderWidth={2}
          borderColor={{
            from: "color",
            modifiers: [["darker", 0.3]],
          }}
          medianWidth={4}
          medianColor={"#FFFFFF"}
          whiskerEndSize={0.6}
          whiskerColor={"#c92a2a"}
          whiskerWidth={8}
          motionConfig="stiff"
          legends={[
            {
              anchor: "right",
              direction: "column",
              justify: false,
              translateX: 100,
              translateY: 0,
              itemWidth: 60,
              itemHeight: 20,
              itemsSpacing: 3,
              itemTextColor: "#999",
              itemDirection: "left-to-right",
              symbolSize: 20,
              symbolShape: "square",
              effects: [
                {
                  on: "hover",
                  style: {
                    itemTextColor: "#000",
                  },
                },
              ],
            },
          ]}
        />
      </div>
      <div style={{ height: 1000, width: 1000 }}>
        <ResponsiveBoxPlot
          data={rawParsed1000Data.reverse()}
          layout="horizontal"
          quantiles={[0, 0.25, 0.5, 0.75, 1]}
          margin={{
            top: 100,
            right: 100,
            bottom: 100,
            left: 100,
          }}
          padding={0.12}
          enableGridX={true}
          axisTop={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "",
            legendOffset: 36,
            truncateTickAt: 0,
          }}
          axisRight={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "",
            legendOffset: 0,
            truncateTickAt: 0,
          }}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "group",
            legendPosition: "middle",
            legendOffset: 32,
            truncateTickAt: 0,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "value",
            legendPosition: "middle",
            legendOffset: -40,
            truncateTickAt: 0,
          }}
          colors={["#257DDD"]}
          borderRadius={2}
          borderWidth={2}
          borderColor={{
            from: "color",
            modifiers: [["darker", 0.3]],
          }}
          medianWidth={4}
          medianColor={"#FFFFFF"}
          whiskerEndSize={0.6}
          whiskerColor={"#c92a2a"}
          whiskerWidth={8}
          motionConfig="stiff"
          legends={[
            {
              anchor: "right",
              direction: "column",
              justify: false,
              translateX: 100,
              translateY: 0,
              itemWidth: 60,
              itemHeight: 20,
              itemsSpacing: 3,
              itemTextColor: "#999",
              itemDirection: "left-to-right",
              symbolSize: 20,
              symbolShape: "square",
              effects: [
                {
                  on: "hover",
                  style: {
                    itemTextColor: "#000",
                  },
                },
              ],
            },
          ]}
        />
      </div>
    </>
  );
}

export default App;
