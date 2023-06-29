
let boids,
	boidsQuadTree,
	alignSlider,
	cohesionSlider,
	separationSlider,
	maxDepthSlider,
	fps;

let isNaive = false,
	showQuadtreeGrid = true,
	showQuadtreeQuery = false;

function initBoids(naive) {
	boids = [];
	if (!naive)
		boidsQuadTree = new QuadTree(width, height);
	for (let i = 0; i < populationSlider.value(); i++) {
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
				if (boids[i].position.dist(boids[j].position) < visionSlider.value()) {
					visibleBoids[i].push(boids[j]);
					visibleBoids[j].push(boids[i]);
				}
			}
		}

		for (let i = 0; i < boids.length; i++) {
			boids[i].flock(visibleBoids[i]);
			boids[i].update();
			boids[i].render(true);
		}

	} else {
		for (let boid of boids) {
			boid.flock(boidsQuadTree.query(boid, visionSlider.value(), showQuadtreeQuery));
			boid.update();
			boid.render(true);
		}
		
		if (showQuadtreeGrid)
			boidsQuadTree.render();
		
		// Regenerate quadtree
		boidsQuadTree.root = new QuadTreeNode(new Rect(0, 0, width, height));
		for (let boid of boids)
			boidsQuadTree.insert(boid);
	}
}

function setup() {
	createCanvas(1080, 720); //TO-DO remove the bounds and allow zooming

	div = createDiv();

	alignLabel = createP('Alignment');
	alignSlider = createSlider(0, 5, 1, 0.1);
	alignValue = createSpan(alignSlider.value());
	alignSlider.input(() => { alignValue.html(alignSlider.value()); });

	cohesionLabel = createP('Cohesion');
	cohesionSlider = createSlider(0, 5, 1, 0.1);
	cohesionValue = createSpan(cohesionSlider.value());
	cohesionSlider.input(() => cohesionValue.html(cohesionSlider.value()));

	separationLabel = createP('Separation');
	separationSlider = createSlider(0, 5, 1, 0.1);
	separationValue = createSpan(separationSlider.value());
	separationSlider.input(() => separationValue.html(separationSlider.value()));

	visionLabel = createP('Vision');
	visionSlider = createSlider(0, 200, 50, 1);
	visionValue = createSpan(visionSlider.value());
	visionSlider.input(() => visionValue.html(visionSlider.value()));

	maxDepthLabel = createP('Max Depth');
	maxDepthSlider = createSlider(0, 10, 5, 1);
	maxDepthValue = createSpan(maxDepthSlider.value());
	maxDepthSlider.input(() => maxDepthValue.html(maxDepthSlider.value()));

	quadtreeCheckbox = createCheckbox('Use Quadtree', true);
	quadtreeCheckbox.changed(() => {
		isNaive = !quadtreeCheckbox.checked();
		quadtreeGridCheckbox.style('visibility', isNaive ? 'hidden' : 'visible');
		quadtreeQueryCheckbox.style('visibility', isNaive ? 'hidden' : 'visible');
	});
		
	quadtreeGridCheckbox = createCheckbox('Show Quadtree Grid', true);
	quadtreeGridCheckbox.changed(() => {
		showQuadtreeGrid = quadtreeGridCheckbox.checked();
	});

	quadtreeQueryCheckbox = createCheckbox('Show Quadtree Queries', false);
	quadtreeQueryCheckbox.changed(() => {
		showQuadtreeQuery = quadtreeQueryCheckbox.checked();
	});

	populationLabel = createP('Population');
	populationSlider = createSlider(0, 5000, 100, 1);
	populationValue = createSpan(populationSlider.value());
	populationSlider.input(() => populationValue.html(populationSlider.value()));

	resetButton = createButton('Reset');
	resetButton.mousePressed(() => {
		initBoids(isNaive);
	});

	pausePlayButton = createButton('Pause');
	pausePlayButton.mousePressed(() => {
		if (pausePlayButton.html() == 'Pause') {
			noLoop();
			pausePlayButton.html('Play');
		} else {
			loop();
			pausePlayButton.html('Pause');
		}
	});

	// TODO: Profiler
	// fps = frameRate();
	// fpsLabel = createP('FPS');
	// fpsValue = createSpan(fps);
	// fps.onchange = () => fpsValue.html(fps);

	div.child(alignLabel);
	div.child(alignSlider);
	div.child(alignValue);

	div.child(cohesionLabel);
	div.child(cohesionSlider);
	div.child(cohesionValue);

	div.child(separationLabel);
	div.child(separationSlider);
	div.child(separationValue);

	div.child(visionLabel);
	div.child(visionSlider);
	div.child(visionValue);

	div.child(createElement('br'));
	div.child(createElement('br'));

	div.child(quadtreeCheckbox);
	div.child(quadtreeGridCheckbox);
	div.child(quadtreeQueryCheckbox);

	div.child(populationLabel);
	div.child(populationSlider);
	div.child(populationValue);

	div.child(maxDepthLabel);
	div.child(maxDepthSlider);
	div.child(maxDepthValue);

	div.child(createElement('br'));
	div.child(createElement('br'));

	div.child(resetButton);
	div.child(pausePlayButton);

	div.position(width+30, 0);

	// Paragraph explaining the boids algorithm below the canvas
	let boidsExplanation = createP('The <b>Boids algorithm</b> is a behavioral simulation used to model the flocking behavior of birds. It was developed by Craig Reynolds in 1986. Boids are autonomous agents that follow three simple rules: separation, alignment, and cohesion. Separation ensures that Boids maintain a minimum distance from their neighbors, avoiding collisions. Alignment encourages Boids to align their velocities with nearby Boids, resulting in coordinated movement. Cohesion drives Boids towards the center of mass of their neighbors, promoting group cohesion. By applying these rules iteratively to each Boid, complex flocking behaviors emerge, such as flocking, schooling, or swarming. The Boids algorithm has been widely used in computer graphics, animation, and artificial life simulations.');
	boidsExplanation.position(15, height);
	boidsExplanation.style('width', width+'px');

	initBoids(isNaive);
}

function draw() {
	background(220);
	updateBoids(isNaive);
	if (mouseIsPressed) {
		if (mouseX < width && mouseY < height) {
			boids.push(Boid.atPos(mouseX, mouseY));
			populationSlider.value(populationSlider.value() + 1);
			populationValue.html(populationSlider.value());
		}
	}
}

