const maxSpeed = 5;
const maxForce = 0.2;

class Boid {
    constructor() {
        this.position = createVector(random(width), random(height));
        this.velocity = p5.Vector.random2D();
        this.velocity.setMag(random(2, 4));
        this.acceleration = createVector();
    }

    static atPos(x, y) {
        let b = new Boid();
        b.position.x = x;
        b.position.y = y;
        return b;
    }

    edges() {
        if (this.position.x > width || this.position.x < 0) 
            this.position.x = ((this.position.x % width) + width) % width;
        if (this.position.y > height || this.position.y < 0)
            this.position.y = ((this.position.y % height) + height) % height;
    }

    cohesion(boids) {
        let steering = createVector();
        let total = 0;
        for (let other of boids) {
            steering.add(other.position);
            total++;
        }
        if (total > 0) {
            steering.div(total);
            steering.sub(this.position);
            steering.setMag(maxSpeed);
            steering.sub(this.velocity);
            steering.limit(maxForce);
        }
        return steering;
    }

    separate(boids) {
        let steering = createVector();
        let total = 0;
        for (let other of boids) {
            let d = this.position.dist(other.position);
            let diff = p5.Vector.sub(this.position, other.position);
            diff.div(d * d);
            steering.add(diff);
            total++;
        }
        if (total > 0) {
            steering.div(total);
            steering.setMag(maxSpeed);
            steering.sub(this.velocity);
            steering.limit(maxForce);
        }
        return steering;
    }

    align(boids) {
        let steering = createVector();
        let total = 0;
        for (let other of boids) {
            steering.add(other.velocity);
            total++;
        }
        if (total > 0) {
            steering.div(total);
            steering.setMag(maxSpeed);
            steering.sub(this.velocity);
            steering.limit(maxForce);
        }
        return steering;
    }

    flock(boids) {
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
    }

    update() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.velocity.limit(maxSpeed);
        this.edges();
    }

    render(drawArrow, size) {
        if (drawArrow) {
            // Draw a triangle rotated in the direction of velocity
            let theta = this.velocity.heading() + radians(90);
            strokeWeight(1);
            fill(0);
            stroke(0);
            push();
            translate(this.position.x, this.position.y);
            rotate(theta);
            beginShape();
            vertex(0, -size * 2);
            vertex(-size, size * 2);
            vertex(size, size * 2);
            endShape(CLOSE);
            pop();
        } else {
            strokeWeight(2 * size);
            stroke(0);
            point(this.position.x, this.position.y);
        }
    }
}
