const epochs_per_env = 10;
const frames_per_epoch = 540;

const initialPopulation = 100,
    finalPopulation = 1000,
    populationStep = 100;

const finalMaxChildren = 15;

const coh = 1.0,
    sep = 1.0,
    ali = 1.0,
    vision = 50;

let maxChildren = 1,
    population = initialPopulation;

let boids, boidsQuadTree;

let isNaive = true;

let frame = 0,
    epoch = 0,
    startTime,
    endTime;

let data = {};

/*
		data = {
				True: {
						`initialPopulation`: [
								[
										frame_0_time,
										frame_1_time,
										...,
										frame_per_epoch_time
								],
								...
								epoch_per_env times
						],
						`initialPopulation + populationStep`: ..,
						...
						`finalPopulation`: ..
				},
				False: {
						`initialPopulation`: {
								1: [
										[
												frame_0_time,
												frame_1_time,
												...,
												frame_per_epoch_time
										],
										...
										epoch_per_env times
								],
								`initialMaxChildren` + 1: ...,
								...
								`finalMaxChildren`: ..
						},
						`initialPopulation + populationStep`: ..,
						...
						`finalPopulation`: ..
				}
*/

function initBoids() {
    boids = [];
    if (!isNaive) boidsQuadTree = new QuadTree(width, height);

    for (let i = 0; i < population; i++) {
        let tmpBoid = new Boid();
        boids.push(tmpBoid);
        if (!isNaive) boidsQuadTree.insert(tmpBoid);
    }
}

function setup() {
    createCanvas(1080, 720); //TO-DO remove the bounds and allow zooming
    initBoids();
}

function draw() {
    startTime = performance.now();
    if (isNaive) {
        visibleBoids = [];
        for (let i = 0; i < boids.length; i++) visibleBoids.push([]);

        for (let i = 0; i < boids.length; i++)
            for (let j = i + 1; j < boids.length; j++)
                if (boids[i].position.dist(boids[j].position) < vision) {
                    visibleBoids[i].push(boids[j]);
                    visibleBoids[j].push(boids[i]);
                }

        for (let i = 0; i < boids.length; i++) {
            boids[i].flock(visibleBoids[i]);
            boids[i].update();
        }
    } else {
        for (let boid of boids) {
            boid.flock(boidsQuadTree.query(boid, vision));
            boid.update();
        }

        boidsQuadTree.root = new QuadTreeNode(new Rect(0, 0, width, height));

        for (let boid of boids) boidsQuadTree.insert(boid);
    }
    endTime = performance.now();
    frame++;

    // Record the frame time for the current epoch and population
    if (!data[isNaive]) data[isNaive] = {};
    if (!data[isNaive][population]) {
        if (isNaive) data[isNaive][population] = [];
        else data[isNaive][population] = {};
    }
    if (!isNaive && !data[isNaive][population][maxChildren])
        data[isNaive][population][maxChildren] = [];
    if (isNaive) data[isNaive][population].push(endTime - startTime);
    else data[isNaive][population][maxChildren].push(endTime - startTime);

    frame++;

    // If we have finished all epochs and population steps, update the parameters
    if (frame >= frames_per_epoch) {
        frame = 0;
        epoch++;

        if (isNaive)
            console.log(
                `Epoch ${epoch} of ${epochs_per_env} for population : ${population}`
            );
        else
            console.log(
                `Epoch ${epoch} / ${epochs_per_env} completed for population : ${population}, maxChildren : ${maxChildren}`
            );
        if (epoch >= epochs_per_env) {
            if (isNaive) saveJSON(data, `checkpoint_${population}.json`);
            else saveJSON(data, `checkpoint_${population}_${maxChildren}.json`);
            epoch = 0;
            population += populationStep;

            if (population > finalPopulation) {
                population = initialPopulation;
                if (isNaive) {
                    isNaive = false;
                } else {
                    maxChildren++;
                    if (maxChildren > finalMaxChildren) {
                        noLoop(); // Stop the draw loop when we've collected all data
                        console.log("Data collection complete.");
                        saveJSON(data, "data.json");
                    }
                }
            }
        }
        initBoids();
    }
}
