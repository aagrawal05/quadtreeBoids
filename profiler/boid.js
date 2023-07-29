const maxSpeed = 5;
const maxForce = 0.2;

class Boid {
    constructor() {
        this.position = createVector(random(WIDTH), random(HEIGHT));
        this.velocity = p5.Vector.random2D();
        this.velocity.setMag(random(2, 4));
        this.acceleration = createVector();
    }

    edges() {
        if (this.position.x > WIDTH || this.position.x < 0) 
            this.position.x = ((this.position.x % WIDTH) + WIDTH) % WIDTH;
        if (this.position.y > HEIGHT || this.position.y < 0)
            this.position.y = ((this.position.y % HEIGHT) + HEIGHT) % HEIGHT;
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
        cohesion.mult(ali);
        separation.mult(sep);
        alignment.mult(coh);
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
}
