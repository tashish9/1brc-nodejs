import { Worker } from "worker_threads";
import fs from "fs";

const filePath = "../../measurements.txt";
const fileSize = fs.statSync(filePath).size;
const numberOfWorkers = 8;
const chunkSize = Math.ceil(fileSize / numberOfWorkers);
// const chunkSize = (end - start) / (1024 * 1024); // in MBs

const cityData = {};
const workers = []; // Store worker instances
console.log(`spawning ${numberOfWorkers} workers`);
console.log(`Each worker processing ${chunkSize / (1024 * 1024)}MBs of data`);
const t0 = performance.now();

for (let i = 0; i < numberOfWorkers; i++) {
  const start = i * chunkSize;
  const end = Math.min((i + 1) * chunkSize, fileSize);

  const worker = new Worker("./worker.js", {
    workerData: { start, end, filePath },
  });

  workers.push(worker); // Store the worker instance

  worker.on("message", ({ obj, error }) => {
    if (error) {
      console.error(error);
      return;
    }

    for (const city in obj) {
      if (cityData[city]) {
        cityData[city].min = Math.min(cityData[city].min, obj[city].min);
        cityData[city].max = Math.max(cityData[city].max, obj[city].max);
        cityData[city].sum += obj[city].sum;
        cityData[city].count += obj[city].count;
      } else {
        cityData[city] = { ...obj[city] };
      }
    }
  });

  worker.on("error", (err) => {
    console.error(err);
  });
}

// Wait for all workers to finish processing
Promise.all(
  workers.map((worker) => {
    return new Promise((resolve, reject) => {
      worker.on("exit", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }),
)
  .then(() => {
    // Calculate averages
    // for (const city in cityData) {
    //   cityData[city].avg = cityData[city].sum / cityData[city].count;
    // }
    console.log(`Total time consumed - ${performance.now() - t0} milliseconds`);
    process.exit();
  })
  .catch((err) => {
    console.error(err);
  });
