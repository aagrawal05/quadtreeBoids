const coh = 1.0,
      ali = 1.0,
      sep = 1.0;
const vision = 100.0;
const width = 1080;
const height = 720;
const maxSpeed = 5.0;
const maxForce = 0.2;

class Boid {
    constructor() {
        this.position = { x: Math.random() * width, y: Math.random() * height };
        this.velocity = this.getRandom2DVector();
        this.velocity.magnitude = this.getRandomValue(2, 4);
        this.acceleration = { x: 0, y: 0 };
    }

    static atPos(x, y) {
        const b = new Boid();
        b.position.x = x;
        b.position.y = y;
        return b;
    }

    getRandom2DVector() {
        const angle = Math.random() * 2 * Math.PI;
        return {
            x: Math.cos(angle),
            y: Math.sin(angle),
            setMag: function (mag) {
                const currentMag = Math.sqrt(this.x * this.x + this.y * this.y);
                if (currentMag !== 0) {
                    this.x *= mag / currentMag;
                    this.y *= mag / currentMag;
                }
            },
        };
    }

    getRandomValue(min, max) {
        return Math.random() * (max - min) + min;
    }

    edges() {
        if (this.position.x > width) {
            this.position.x = 0;
        } else if (this.position.x < 0) {
            this.position.x = width;
        }
        if (this.position.y > height) {
            this.position.y = 0;
        } else if (this.position.y < 0) {
            this.position.y = height;
        }
    }

    cohesion(boids) {
        let steering = { x: 0, y: 0 };
        let total = 0;
        for (let other of boids) {
            steering.x += other.position.x;
            steering.y += other.position.y;
            total++;
        }
        if (total > 0) {
            steering.x /= total;
            steering.y /= total;
            steering.x -= this.position.x;
            steering.y -= this.position.y;
            const steeringMag = Math.sqrt(
                steering.x * steering.x + steering.y * steering.y
            );
            if (steeringMag !== 0) {
                steering.x *= maxSpeed / steeringMag;
                steering.y *= maxSpeed / steeringMag;
            }
            steering.x -= this.velocity.x;
            steering.y -= this.velocity.y;
            const steeringMag2 = Math.sqrt(
                steering.x * steering.x + steering.y * steering.y
            );
            if (steeringMag2 > maxForce) {
                steering.x *= maxForce / steeringMag2;
                steering.y *= maxForce / steeringMag2;
            }
        }
        return steering;
    }

    separate(boids) {
        let steering = { x: 0, y: 0 };
        let total = 0;
        for (let other of boids) {
            const d = this.getDistance(this.position, other.position);
            const diff = {
                x: this.position.x - other.position.x,
                y: this.position.y - other.position.y,
            };
            diff.x /= d * d;
            diff.y /= d * d;
            steering.x += diff.x;
            steering.y += diff.y;
            total++;
        }
        if (total > 0) {
            steering.x /= total;
            steering.y /= total;
            const steeringMag = Math.sqrt(
                steering.x * steering.x + steering.y * steering.y
            );
            if (steeringMag !== 0) {
                steering.x *= maxSpeed / steeringMag;
                steering.y *= maxSpeed / steeringMag;
            }
            steering.x -= this.velocity.x;
            steering.y -= this.velocity.y;
            const steeringMag2 = Math.sqrt(
                steering.x * steering.x + steering.y * steering.y
            );
            if (steeringMag2 > maxForce) {
                steering.x *= maxForce / steeringMag2;
                steering.y *= maxForce / steeringMag2;
            }
        }
        return steering;
    }

    align(boids) {
        let steering = { x: 0, y: 0 };
        let total = 0;
        for (let other of boids) {
            steering.x += other.velocity.x;
            steering.y += other.velocity.y;
            total++;
        }
        if (total > 0) {
            steering.x /= total;
            steering.y /= total;
            const steeringMag = Math.sqrt(
                steering.x * steering.x + steering.y * steering.y
            );
            if (steeringMag !== 0) {
                steering.x *= maxSpeed / steeringMag;
                steering.y *= maxSpeed / steeringMag;
            }
            steering.x -= this.velocity.x;
            steering.y -= this.velocity.y;
            const steeringMag2 = Math.sqrt(
                steering.x * steering.x + steering.y * steering.y
            );
            if (steeringMag2 > maxForce) {
                steering.x *= maxForce / steeringMag2;
                steering.y *= maxForce / steeringMag2;
            }
        }
        return steering;
    }

    flock(boids) {
        this.acceleration.x = 0;
        this.acceleration.y = 0;
        const cohesion = this.cohesion(boids);
        const separation = this.separate(boids);
        const alignment = this.align(boids);
        cohesion.x *= ali;
        cohesion.y *= ali;
        separation.x *= sep;
        separation.y *= sep;
        alignment.x *= coh;
        alignment.y *= coh;
        this.acceleration.x += cohesion.x;
        this.acceleration.y += cohesion.y;
        this.acceleration.x += separation.x;
        this.acceleration.y += separation.y;
        this.acceleration.x += alignment.x;
        this.acceleration.y += alignment.y;
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;
        const velocityMag = Math.sqrt(
            this.velocity.x * this.velocity.x +
            this.velocity.y * this.velocity.y
        );
        if (velocityMag > maxSpeed) {
            this.velocity.x *= maxSpeed / velocityMag;
            this.velocity.y *= maxSpeed / velocityMag;
        }
        this.edges();
    }

    getDistance(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
