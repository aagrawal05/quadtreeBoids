const epochs_per_env = 1;
const seconds_per_epoch = 1;

const initialPopulation = 100,
		finalPopulation = 1000,
		populationStep = 100;

const initialVision = 10,
		finalVision = 200,
		visionStep = 38;

const finalMaxDepth = 5;
const finalMaxChildren = 5;

const coh = 1.0,
    sep = 1.0,
    ali = 1.0;

let population = initialPopulation,
		vision = initialVision,
		maxChildren = 1,
		maxDepth = -1;

let boids, boidsQuadTree;

let isNaive = true;

let epoch = 0,
	frames = 0,
	epochStartTime,
    startTime,
    endTime;

let data = {};

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
	// frameRate(1000000000);
    // createCanvas(1080, 720); //TO-DO remove the bounds and allow zooming
    initBoids();
	epochStartTime = millis();
	// animate();
	// noLoop();
}

function draw() { // animate() {
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
    // If we have finished all epochs and population steps, update the parameters
    if (millis() - epochStartTime > seconds_per_epoch * 1000) {
		epochStartTime = millis();
		frames = 0;
        epoch++;

        if (isNaive)
            console.log(
                `Epoch ${epoch} of ${epochs_per_env} for population : ${population} & vision : ${vision} \n Frames captured : ${frames}`
            );
        else
            console.log(
					`Epoch ${epoch} / ${epochs_per_env} completed for population : ${population} & vision : ${vision} & maxChildren : ${maxChildren} & maxDepth : ${maxDepth}`
			);
        if (epoch >= epochs_per_env) {
            if (isNaive) saveJSON(data, `checkpoint_${population}_${vision}.json`);
            else saveJSON(data, `checkpoint_${population}_${vision}_${maxChildren}_${maxDepth}.json`);
            epoch = 0;
            population += populationStep;
            if (population > finalPopulation) {
                population = initialPopulation;
				vision += visionStep;
				if (vision > finalVision) {
					if (!isNaive) {
						maxChildren++;
						if (maxChildren > finalMaxChildren) {
							maxDepth++;
							if (maxDepth > finalMaxDepth) {
								console.log("Done!");
								saveJSON(data, `data_${isNaive ? "naive" : "quadtree"}.json`);
							}
						}
					} else {
						console.log("Done!");
						saveJSON(data, `data_${isNaive ? "naive" : "quadtree"}.json`);
					}
				}
			}
        }
        initBoids();
    } else {
			// Record the frame time for the current epoch and population
			/*
				1. Naive
				data = {
						`${initialPopulation}`: {
								`${initialVision}`: {
										`0`: [frameTime]
										`1`: [frameTime]
										...
										`epochs_per_env`: [frameTime]
								}

								`${initialVision + visionStep}`: { ... }
								...
								`${finalVision}`: {...}
						},
						`${initialPopulation + populationStep}`: {
								`${initialVision}`: {...},
								`${initialVision + visionStep}`: {...},
								...
								`${finalVision}`: {...}
						},
						...
						`${finalPopulation}`: {
								`${initialVision}`: {...},
								`${initialVision + visionStep}`: {...},
								...
								`${finalVision}`: {...}
						}`
				}
			*/
			if (isNaive) {
				if (!data[`${population}`]) data[`${population}`] = {};
				if (!data[`${population}`][`${vision}`]) data[`${population}`][`${vision}`] = {};
				if (!data[`${population}`][`${vision}`][`${epoch}`]) data[`${population}`][`${vision}`][`${epoch}`] = [];
				data[`${population}`][`${vision}`][`${epoch}`].push(endTime - startTime);
			}
			/*
				2. QuadTree
				data = {
						`${initialPopulation}`: {
								`${initialVision}`: {
										`${initialMaxDepth}`: {
												`${initialMaxChildren}`: {
														`${epoch1}`: {...},
														`${epoch2}`: {...},
														...
														`${finalEpoch}`: {...}
												}
												`${initialMaxChildren + 1}`: {...}
												...
												`${finalMaxChildren}`: {...}
										},
										`${initialMaxDepth + 1}`: {
												`${initialMaxChildren}`: {...},
												`${initialMaxChildren + 1}`: {...},
												...
												`${finalMaxChildren}`: 
										},
										...
										`${finalMaxDepth}`: {
												`${initialMaxChildren}`: {...},
												`${initialMaxChildren + 1}`: {...},
												...
												`${finalMaxChildren}`: {...}
										}
								},
								`${initialVision + visionStep}`: {
										...
								},
								...
								`${finalVision}`: {
										...
								}
						},
						`${initialPopulation + populationStep}`: {
								...
						},
						...
						`${finalPopulation}`: {
								...
						}
				}
			*/
			else {
				if (!data[`${population}`]) data[`${population}`] = {};
				if (!data[`${population}`][`${vision}`]) data[`${population}`][`${vision}`] = {};
				if (!data[`${population}`][`${vision}`][`${maxDepth}`]) data[`${population}`][`${vision}`][`${maxDepth}`] = {};
				if (!data[`${population}`][`${vision}`][`${maxDepth}`][`${maxChildren}`]) data[`${population}`][`${vision}`][`${maxDepth}`][`${maxChildren}`] = {};
				if (!data[`${population}`][`${vision}`][`${maxDepth}`][`${maxChildren}`][`${epoch}`]) data[`${population}`][`${vision}`][`${maxDepth}`][`${maxChildren}`][`${epoch}`] = [];
				data[`${population}`][`${vision}`][`${maxDepth}`][`${maxChildren}`][`${epoch}`].push(endTime - startTime);
			}
			frames++;
	}
	// requestAnimationFrame(animate);
}