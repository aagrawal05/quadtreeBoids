const width = 1080,
	  height = 720;

const coh=1.0,
	  sep=1.0,
	  ali=1.0,
	  vis=100;

let boids,
	boidsQuadTree;

function initBoids(population, maxDepth, naive) {
	boids = [];
	if (!naive)
		boidsQuadTree = new QuadTree(width, height, maxDepth);
	for (let i = 0; i < population; i++) {
		let tmpBoid = new Boid();
		boids.push(tmpBoid);
		if (!naive)
			boidsQuadTree.insert(tmpBoid);
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
				if (boids[i].position.dist(boids[j].position) < vis) {
					visibleBoids[i].push(boids[j]);
					visibleBoids[j].push(boids[i]);
				}
			}
		}

		for (let i = 0; i < boids.length; i++) {
			boids[i].flock(visibleBoids[i]);
			boids[i].update();
		}

	} else {
		for (let boid of boids) {
			boid.flock(boidsQuadTree.query(boid, vis));
			boid.update();
		}
		
		// Regenerate quadtree
		boidsQuadTree.root = new QuadTreeNode(new Rect(0, 0, width, height));
		for (let boid of boids)
			boidsQuadTree.insert(boid);
	}
}
