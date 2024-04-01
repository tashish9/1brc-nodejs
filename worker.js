// worker.js
import { parentPort, workerData } from "worker_threads";
import fs from "fs";

const { start, end, filePath } = workerData;

const obj = {};

fs.createReadStream(filePath, { start, end })
  .on("data", (data) => {
    const rows = data.toString().split("\n");

    for (const row of rows) {
      const [cityName, tempStr] = row.split(";");
      const currTemp = parseFloat(tempStr);

      if (obj[cityName]) {
        obj[cityName].min = Math.min(obj[cityName].min, currTemp);
        obj[cityName].max = Math.max(obj[cityName].max, currTemp);
        obj[cityName].sum += currTemp;
        obj[cityName].count++;
      } else {
        obj[cityName] = {
          min: currTemp,
          max: currTemp,
          sum: currTemp,
          count: 1,
        };
      }
    }
  })
  .on("error", (err) => {
    console.error(err);
    parentPort.postMessage({ error: err });
  })
  .on("end", () => {
    parentPort.postMessage({ obj });
  });
