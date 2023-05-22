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
        let boids = vec![
            boid::Boid {
                pos: [rng.gen_range(0.0..1.0), rng.gen_range(0.0..1.0)],
                vel: [rng.gen_range(-0.1..0.1), rng.gen_range(-0.1..0.1)],
                acc: [rng.gen_range(-0.1..0.1), rng.gen_range(-0.1..0.1)],
            };
            population as usize
        ];

        let boidsQuadtree = quadtree::Quadtree::<boid::Boid>::new(
            Bounds{
                pos: [0, 0],
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
        // if naive {
        //     // Naive implementation
        //     for b in self.boids.iter_mut() {
        //         b.update(self.boids);
        //     }
        // } else {
        //     // Using quadtrees
        //     for b in self.boids.iter_mut() {
        //         b.update(self.quadtree.query(Bounds {
        //             pos: [b.pos[0] - boid::viewR/2.0, b.pos[1] - boid::viewR/2.0],
        //             size: [boid::viewR, boid::viewR],
        //         }));
        //     }
        // }
    }

    pub fn getBoids(&self) -> &Vec<boid::Boid> {
        &self.boids
    }
}
