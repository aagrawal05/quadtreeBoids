const isNaive = true,
	  maxDepth = 5,
	  maxChildren = 4,
	  population = 100;

let boids;
let alignSlider, cohesionSlider, separationSlider;

function initBoids(naive) {
	if (naive) {
		boids = [];
		for (let i = 0; i < population; i++) {
			boids.push(new Boid());
		}
	} else {
		boids = new QuadTree(maxDepth, maxChildren, new Rect(0, 0, width, height));
		for (let i = 0; i < population; i++) {
			boids.insert(new Boid());
		}
	}
}

function updateBoids(naive) {
	if (naive) {
		visibleBoids = [];
		for (let i = 0; i < boids.length; i++) {
			visibleBoids.push([]);
		}

		for (let i = 0; i < boids.length; i++) {
			for (let j = i+1; j < boids.length; j++) {
				if (boids[i].position.dist(boids[j].position) < Boid.visualRange) {
					visibleBoids[i].push(boids[j]);
					visibleBoids[j].push(boids[i]);
				}
			}
		}

		for (let i = 0; i < boids.length; i++) {
			boids[i].flock(visibleBoids[i]);
			boids[i].render(true);
		}
	} else {
		for (let i = 0; i < boids.nodes.length; i++) {
			let visibleBoids = boids.queryRadius(boids.nodes[i].position, Boid.visionRange);
			boids[i].flock(visibleBoids);
			boids[i].render(true);
		}
	}
}

function setup() {
	createCanvas(1080, 720);
	alignSlider = createSlider(0, 5, 1, 0.1);
	cohesionSlider = createSlider(0, 5, 1, 0.1);
	separationSlider = createSlider(0, 5, 1, 0.1);

	initBoids(isNaive);
}

function draw() {
	background(220);
	updateBoids(isNaive);
}
