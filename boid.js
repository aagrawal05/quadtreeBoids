class Boid {
	static maxSpeed=5;
	static maxForce=0.2;
	static r=2;

	constructor (){
		this.position = createVector(random(width), random(height));
		this.velocity = p5.Vector.random2D();
		this.velocity.setMag(random(2,4));
		this.acceleration = createVector();
	}
	
	edges(){
		if (this.position.x > width){
			this.position.x = 0;
		} else if (this.position.x < 0){
			this.position.x = width;
		}
		if (this.position.y > height){
			this.position.y = 0;
		} else if (this.position.y < 0){
			this.position.y = height;
		}
	}
	
	cohesion(boids){
		let steering = createVector();
		let total = 0;
		for (let other of boids){
			steering.add(other.position);
			total++;
		}
		if (total > 0){
			steering.div(total);
			steering.sub(this.position);
			steering.setMag(Boid.maxSpeed);
			steering.sub(this.velocity);
			steering.limit(Boid.maxForce);
		}
		return steering;
	}

	separate(boids){
		let steering = createVector();
		let total = 0;
		for (let other of boids){
			let d = this.position.dist(other.position);
			let diff = p5.Vector.sub(this.position, other.position);
			diff.div(d * d);
			steering.add(diff);
			total++;
		}
		if (total > 0){
			steering.div(total);
			steering.setMag(Boid.maxSpeed);
			steering.sub(this.velocity);
			steering.limit(Boid.maxForce);
		}
		return steering;
	}

	align(boids){
		let steering = createVector();
		let total = 0;
		for (let other of boids){
			steering.add(other.velocity);
			total++;
		}
		if (total > 0){
			steering.div(total);
			steering.setMag(Boid.maxSpeed);
			steering.sub(this.velocity);
			steering.limit(Boid.maxForce);
		}
		return steering;
	}
		
	flock(boids){
		this.acceleration.mult(0);
		let cohesion = this.cohesion(boids);
		let separation = this.separate(boids);
		let alignment = this.align(boids);
		cohesion.mult(alignSlider.value());
		separation.mult(separationSlider.value());
		alignment.mult(cohesionSlider.value());
		this.acceleration.add(cohesion);
		this.acceleration.add(separation);
		this.acceleration.add(alignment);
		this.update();
	}

	update(){
		this.position.add(this.velocity);
		this.velocity.add(this.acceleration);
		this.velocity.limit(Boid.maxSpeed);
		this.edges();
	}

	render(drawArrow){
		if (drawArrow) {
			// Draw a triangle rotated in the direction of velocity
			let theta = this.velocity.heading() + radians(90);
			fill(0);
			stroke(0);
			push();
			translate(this.position.x, this.position.y);
			rotate(theta);
			beginShape();
			vertex(0, -Boid.r * 2);
			vertex(-Boid.r, Boid.r * 2);
			vertex(Boid.r, Boid.r * 2);
			endShape(CLOSE);
			pop();
		} else {
			strokeWeight(Boid.r);
			stroke(0);
			point(this.position.x, this.position.y);
		}
	}
}
