// Javascript file to profile the performance of the p5.js application
// Author: Aditya Agrawal
const initialPopulation = 5000;
const populationInterval = 200;
const endPopulation = 15000;
const trials = 15;
const frames = 300;
const endMaxDepth = 15;

let data = {};
for (
    let population = initialPopulation;
    population <= endPopulation;
    population += populationInterval
) {
    console.log("STARTING POPULATION: " + population);
    data[population] = { naive: [], optimized: [] };
    // Run the simulation 50 times for each population
    for (let trial = 0; trial < trials; trial++) {
        console.log("TRIAL: " + trial);
        data[population].naive.push([]);
        // Start memory profiling
        initBoids(population, (naive = true));

        for (let i = 0; i < frames; i++) {
            start = performance.now();
            updateBoids((naive = true));
            end = performance.now();
            time = end - start;
            console.log("TIME: " + time + "ms");
            data[population].naive[trial].push(time);
        }

        // Profile with quadtrees optimization
        data[population].optimized.push([]);
        for (let maxDepth = 1; maxDepth <= endMaxDepth; maxDepth += 1) {
            data[population].optimized[trial].push([]);
            initBoids(population, (naive = false), (maxDepth = maxDepth));

            for (let i = 0; i < frames; i++) {
                start = performance.now();
                updateBoids((naive = false));
                end = performance.now();
                time = end - start;
                console.log("TIME: " + time + "ms");
                data[population].optimized[trial][maxDepth - 1].push(time);
            }
        }
    }
}

// Download the data
blob = new Blob([JSON.stringify(data)], { type: "text/plain;charset=utf-8" });
saveAs(blob, "data.json");
