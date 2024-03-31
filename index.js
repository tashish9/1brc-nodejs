import fs from "fs";

const obj = {};
const t0 = performance.now();
let processRows = 0;

fs.createReadStream("../../measurements.txt")
  .on("data", (data) => {
    const rows = data.toString().split("\n");
    const n = rows.length;
    processRows += n;

    for (let i = 0; i < n; i++) {
      const [cityName, tempStr] = rows[i].split(";");
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
    console.log(`${processRows / 10000000}%`);
  })
  .on("error", (err) => {
    console.error(err);
  })
  .on("end", () => {
    // Calculate averages
    for (const city in obj) {
      obj[city].avg = obj[city].sum / obj[city].count;
    }

    console.log(`Total time consumed - ${performance.now() - t0} milliseconds`);
    process.exit();
  });
