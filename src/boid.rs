use rand::Rng;
use crate::{
    WIDTH, 
    HEIGHT, 
    VISION_RADIUS, 
    BOID_SIZE,
    MAX_SPEED,
    MAX_FORCE,
    COHESION_COEFFICIENT,
    SEPARATION_COEFFICIENT,
    ALIGNMENT_COEFFICIENT
};

use nannou::prelude::*;

fn with_magnitude(vec: Vec2, mag:f32) -> Vec2 {
    let mut normalized = vec.normalize();
    normalized *= mag;
    normalized
}

fn limit_magnitude(vec: Vec2, mag:f32) -> Vec2 {
    let mut limited = vec;
    if limited.length() > mag {
        limited = with_magnitude(limited, mag);
    }
    limited
}

#[derive(Clone, Copy)]
pub struct Boid {
    pub position: Vec2,
    velocity: Vec2,
    acceleration: Vec2,
}

impl Boid {
    pub fn new() -> Self {
        let mut rng = rand::thread_rng();
        let x = rng.gen::<f32>() * WIDTH as f32;
        let y = rng.gen::<f32>() * HEIGHT as f32;
        let mut velocity = vec2(rng.gen::<f32>() * 2.0 - 1.0, rng.gen::<f32>() * 2.0 - 1.0);
        velocity = velocity.normalize() * rng.gen::<f32>() * 2.0 + 2.0;

        Boid {
            position: pt2(x, y),
            velocity,
            acceleration: vec2(0.0, 0.0),
        }
    }

    fn edges(&mut self) {
        if self.position.x > WIDTH as f32 {
            self.position.x = 0.0;
        } else if self.position.x < 0.0 {
            self.position.x = WIDTH as f32;
        }
        if self.position.y > HEIGHT as f32 {
            self.position.y = 0.0;
        } else if self.position.y < 0.0 {
            self.position.y = HEIGHT as f32;
        }
    }

    fn cohesion(&self, boids: &Vec<Boid>) -> Vec2 {
        let mut steering = vec2(0.0, 0.0);
        let mut total = 0;
        for other in boids {
            steering += other.position;
            total += 1;
        }
        if total > 0 {
            steering /= total as f32;
            steering -= self.position;
            steering = with_magnitude(steering, MAX_SPEED);
            steering -= self.velocity;
            steering = limit_magnitude(steering, MAX_FORCE);
        }
        steering
    }

    fn separate(&self, boids: &Vec<Boid>) -> Vec2 {
        let mut steering = vec2(0.0, 0.0);
        let mut total = 0;
        for other in boids {
            let mut diff = self.position - other.position;
            let d = diff.length();
            diff /= d * d;
            steering += diff;
            total += 1;
        }
        if total > 0 {
            steering /= total as f32;
            steering = with_magnitude(steering, MAX_SPEED);
            steering -= self.velocity;
            steering = limit_magnitude(steering, MAX_FORCE);
        }
        steering
    }

    fn align(&self, boids: &Vec<Boid>) -> Vec2 {
        let mut steering = vec2(0.0, 0.0);
        let mut total = 0;
        for other in boids {
            steering += other.velocity;
            total += 1;
        }
        if total > 0 {
            steering /= total as f32;
            steering = with_magnitude(steering, MAX_SPEED);
            steering -= self.velocity;
            steering = limit_magnitude(steering, MAX_FORCE);
        }
        steering
    }

    pub fn flock(&mut self, boids: &Vec<Boid>) {
        // println!("BOIDS: {:?}", boids);
        self.acceleration *= 0.0;
        self.acceleration += self.cohesion(boids) * COHESION_COEFFICIENT;
        self.acceleration += self.separate(boids) * SEPARATION_COEFFICIENT;
        self.acceleration += self.align(boids) * ALIGNMENT_COEFFICIENT;
    }

    pub fn update(&mut self) {
        self.position += self.velocity;
        self.velocity += self.acceleration;
        self.velocity = limit_magnitude(self.velocity, MAX_SPEED);
        self.edges();
    }

    pub fn draw(&self, draw: &Draw) {
        let theta = self.velocity.angle() + PI / 2.0;

        draw.polygon()
            .stroke_weight(0.1)
            .stroke_color(WHITE)
            .points(
                vec![
                    pt2(0.0, -BOID_SIZE * 2.0),
                    pt2(-BOID_SIZE, BOID_SIZE * 2.0),
                    pt2(BOID_SIZE, BOID_SIZE * 2.0)
                ]
                .iter()
                .map(|p| {
                    let mut new_p = *p;
                    new_p = new_p.rotate(theta);
                    new_p += self.position;
                    new_p
                }),
            );
    }

    pub fn draw_vision(&self, draw: &Draw) {
        draw.ellipse()
            .xy(self.position)
            .radius(VISION_RADIUS)
            .stroke_weight(0.1)
            .stroke_color(WHITE)
            .no_fill();
    }
}
