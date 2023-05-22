// Simulation and controller for the boids
// instantiated in main.rs and used to control
// contains boid compute mainloop, and manages
// the boids' data

use rand::prelude::*;

use crate::{windowWidth, windowHeight};
use crate::boid;
use crate::quadtree;

pub struct Simulation {
    pub size: i32,
    pub boids: Vec<boid::Boid>,
    pub quadtree: quadtree::Quadtree<boid::Boid>,
}

impl Simulation {
    pub fn new(population: i32) -> Self {

        let mut rng = thread_rng();

        // Generate `population` boids at random locations
        let mut boids = Vec::with_capacity(population as usize);
        for _ in 0..population {
            boids.push(boid::Boid {
                 pos: [rng.gen_range(0.0..1.0), rng.gen_range(0.0..1.0)],
                 vel: [rng.gen_range(-0.1..0.1), rng.gen_range(-0.1..0.1)],
                 acc: [rng.gen_range(-0.1..0.1), rng.gen_range(-0.1..0.1)],
            })
        }

        let boidsQuadtree = quadtree::Quadtree::<boid::Boid>::new(
            quadtree::Bounds {
                pos: [0.0, 0.0],
                size: [windowWidth, windowHeight],
            }
        );

        Self {
            size: population,
            boids,
            quadtree: boidsQuadtree,
        }
    }

    pub fn update(&mut self, naive: bool) {
        if naive {
            // Naive implementation
            let tmp_boids = self.boids.clone();
            for b in self.boids.iter_mut() {
                b.update(tmp_boids.iter().collect());
            }
        } else {
            // // Using quadtrees
            // for b in self.boids.iter_mut() {
            //     b.update(self.quadtree.query(quadtree::Bounds {
            //         pos: [b.pos[0] - boid::viewR/2.0, b.pos[1] - boid::viewR/2.0],
            //         size: [boid::viewR, boid::viewR],
            //     }));
            // }
        }
    }

    pub fn getBoids(&self) -> &Vec<boid::Boid> {
        &self.boids
    }
}
