import fs from "fs";

const obj = {};

const processingData = {
  chunksCount: 0,
  averageChunkReadTime: 0,
  averageRowsPerChunk: 0,
};

let processedRows = 0;

fs.createReadStream("../../measurements.txt")
  .on("ready", () => {
    console.log("Ready");
  })
  .on("data", (data) => {
    const t0 = performance.now();

    const rows = data.toString().split("\n");
    processingData.averageRowsPerChunk =
      (processingData.averageRowsPerChunk * processingData.chunksCount +
        rows.length) /
      (processingData.chunksCount + 1);

    rows.forEach((row) => {
      const [cityName, tempStr] = row.split(";");
      const currTemp = parseFloat(tempStr);

      if (obj[cityName]) {
        obj[cityName].min = Math.min(obj[cityName].min, currTemp);
        obj[cityName].max = Math.max(obj[cityName].max, currTemp);
        obj[cityName].avg =
          (obj[cityName].avg + currTemp) / (obj[cityName].count + 1);
        obj[cityName].count++;
      } else {
        obj[cityName] = {
          min: currTemp,
          max: currTemp,
          avg: currTemp,
          count: 1,
        };
      }
    });

    const t1 = performance.now();

    processingData.averageChunkReadTime =
      (processingData.averageChunkReadTime * processingData.chunksCount +
        t1 -
        t0) /
      (processingData.chunksCount + 1);
    processingData.chunksCount++;
    processedRows += rows.length;
    // console.log(
    //   `Processed - ${processedRows} , Remaining - ${1000000000 - processedRows}`,
    // );
  })
  .on("error", (err) => {
    console.error(err);
  })
  .on("end", () => {
    console.log("File Read Completely , Going to Exit");
    console.log(processingData);
    process.exit();
  });
