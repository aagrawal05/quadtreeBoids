let visibleBoids = [],
    boids = [];

function initBoids(population, maxDepth, naive) {
    boids = [];

    if (!naive) boidsQuadTree = new QuadTree(width, height, maxDepth);
    for (let i = 0; i < population; i++) {
        let tmpBoid = new Boid();
        boids.push(tmpBoid);
        if (!naive) boidsQuadTree.insert(tmpBoid);
    }
}

function updateBoids(naive) {
    if (naive) {
        visibleBoids = [];
        for (let i = 0; i < boids.length; i++) {
            visibleBoids.push([]);
        }

        for (let i = 0; i < boids.length; i++) {
            for (let j = i + 1; j < boids.length; j++) {
                if (
                    getDistance(boids[i].position, boids[j].position) < vision
                ) {
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
            boid.flock(boidsQuadTree.query(boid, vision));
            boid.update();
        }

        // Regenerate quadtree
        boidsQuadTree.root = new QuadTreeNode(new Rect(0, 0, width, height));
        for (let boid of boids) boidsQuadTree.insert(boid);
    }
}

function getDistance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}
