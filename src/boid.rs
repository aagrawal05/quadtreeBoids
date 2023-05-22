use crate::{windowWidth, windowHeight};
use crate::quadtree;

//TODO: Move to window creation

const maxForce:f32 = 0.03;
const maxSpeed:f32 = 0.1;
const sepCoef:f32 = 1.5;
const aliCoef:f32 = 1.0;
const cohCoef:f32 = 1.0;
const sizeR:f32 = 0.01;
pub const viewR:f32 = 5.0;

#[derive(Clone, Copy, Debug)]
pub struct Boid
{
    pub pos: [f32; 2],
    pub vel: [f32; 2],
    pub acc: [f32; 2],
}

impl quadtree::ContainsBounds for Boid {
    fn getBounds (&self) -> quadtree::Bounds {
        quadtree::Bounds {
            pos: [self.pos[0] - sizeR/2.0, self.pos[1] - sizeR/2.0], // Top left corner of boid
            size: [sizeR, sizeR] // Radius of boid
        }
    }
}
impl Boid { 
    pub fn update(&mut self, boids: Vec<&Boid>) {
        self.flock(boids);
        self.update_self();
    }

    fn update_self(&mut self) {
        self.vel[0] += self.acc[0];
        self.vel[1] += self.acc[1];
        self.vel[0] = self.vel[0].min(maxSpeed).max(-maxSpeed);
        self.vel[1] = self.vel[1].min(maxSpeed).max(-maxSpeed);
        self.acc[0] = 0.0;
        self.acc[1] = 0.0;
        self.pos[0] += self.vel[0];
        self.pos[1] += self.vel[1];
        self.borders();
    }

    fn flock(&mut self, boids: Vec<&Boid>) {
        let sep = self.separate(boids.clone());
        let ali = self.align(boids.clone());
        let coh = self.cohesion(boids);
        self.acc[0] += sep[0] * sepCoef + ali[0] * aliCoef + coh[0] * cohCoef;
        self.acc[1] += sep[1] * sepCoef + ali[1] * aliCoef + coh[1] * cohCoef;
    }

    fn borders(&mut self) {
        if self.pos[0] < -sizeR {
            self.pos[0] = windowWidth + sizeR;
        }
        if self.pos[1] < -sizeR {
            self.pos[1] = windowHeight + sizeR;
        }
        if self.pos[0] > windowWidth + sizeR {
            self.pos[0] = -sizeR;
        }
        if self.pos[1] > windowWidth + sizeR {
            self.pos[1] = -sizeR;
        }
    }

    fn separate(&self, boids: Vec<&Boid>) -> [f32; 2] {
        let mut steer = [0.0; 2];
        let mut count = 0;
        for other in boids {
            let d = (self.pos[0] - other.pos[0]) * (self.pos[0] - other.pos[0]) + (self.pos[1] - other.pos[1]) * (self.pos[1] - other.pos[1]);
            if d > 0.0 && d < viewR * viewR {
                let mut diff = [self.pos[0] - other.pos[0], self.pos[1] - other.pos[1]];
                let len = (diff[0] * diff[0] + diff[1] * diff[1]).sqrt();
                diff[0] /= len;
                diff[1] /= len;
                steer[0] += diff[0];
                steer[1] += diff[1];
                count += 1;
            }
        }
        if count > 0 {
            steer[0] /= count as f32;
            steer[1] /= count as f32;
        }
        let len = (steer[0] * steer[0] + steer[1] * steer[1]).sqrt();
        if len > 0.0 {
            steer[0] /= len;
            steer[1] /= len;
        }
        steer
    }

    fn align(&self, boids: Vec<&Boid>) -> [f32; 2] {
        let mut steer = [0.0; 2];
        let mut count = 0;
        for other in boids {
            let d = (self.pos[0] - other.pos[0]) * (self.pos[0] - other.pos[0]) + (self.pos[1] - other.pos[1]) * (self.pos[1] - other.pos[1]);
            if d > 0.0 && d < viewR * viewR {
                steer[0] += other.vel[0];
                steer[1] += other.vel[1];
                count += 1;
            }
        }
        if count > 0 {
            steer[0] /= count as f32;
            steer[1] /= count as f32;
        }
        let len = (steer[0] * steer[0] + steer[1] * steer[1]).sqrt();
        if len > 0.0 {
            steer[0] /= len;
            steer[1] /= len;
        }
        steer
    }

    fn cohesion(&self, boids:  Vec<&Boid>) -> [f32; 2] {
        let mut steer = [0.0; 2];
        let mut count = 0;
        for other in boids {
            let d = (self.pos[0] - other.pos[0]) * (self.pos[0] - other.pos[0]) + (self.pos[1] - other.pos[1]) * (self.pos[1] - other.pos[1]);
            if d > 0.0 && d < viewR * viewR {
                steer[0] += other.pos[0];
                steer[1] += other.pos[1];
                count += 1;
            }
        }
        if count > 0 {
            steer[0] /= count as f32;
            steer[1] /= count as f32;
        }
        let len = (steer[0] * steer[0] + steer[1] * steer[1]).sqrt();
        if len > 0.0 {
            steer[0] /= len;
            steer[1] /= len;
        }
        steer
    }
}

