mod boid;
mod quadtree;

use crate::quadtree::QuadTree;
use crate::quadtree::Rect;
use crate::boid::Boid;

use nannou::prelude::*;

const WIDTH: i32 = 1080;
const HEIGHT: i32 = 720;

const POPULATION: i32 = 30000;
const VISION_RADIUS: f32 = 10.0;

const MAX_SPEED: f32 = 5.0;
const MAX_FORCE: f32 = 0.2;

const COHESION_COEFFICIENT: f32 = 5.0;
const SEPARATION_COEFFICIENT: f32 = 0.0;
const ALIGNMENT_COEFFICIENT: f32 = 5.0;

const MAX_CHILDREN: i32 = 10;
const MAX_DEPTH: i32 = 15;

const IS_NAIVE: bool = false;
const BOID_SIZE: f32 = 1.0;

fn main() {
    nannou::app(model).update(update).run();
}

struct Model {
    boids: Vec<Boid>,
    quadtree: QuadTree,
}

impl Model {
    fn init_boids(&mut self){
        self.boids = Vec::new();
        for _ in 0..POPULATION {
            let boid = Boid::new();
            self.boids.push(boid);
            if !IS_NAIVE {
                self.quadtree.insert(boid);
            }
        }
    }

    fn update_boids(&mut self) {
        if IS_NAIVE {
            let mut visible_boids: Vec<Vec<Boid>> = vec![Vec::new(); self.boids.len()];

            for i in 0..self.boids.len() {
                for j in (i + 1)..self.boids.len() {
                    let dist = self.boids[i].position.distance(self.boids[j].position);
                    if dist < VISION_RADIUS &&
                       dist != 0.0 {
                        visible_boids[i].push(self.boids[j]);
                        visible_boids[j].push(self.boids[i]);
                    }
                }
            }

            for i in 0..self.boids.len() {
                self.boids[i].flock(&visible_boids[i]);
                self.boids[i].update();
            }
        } else {
            for i in 0..self.boids.len() {
                let neighbors = self.quadtree.query(&self.boids[i]);
                self.boids[i].flock(&neighbors);
                self.boids[i].update();
            }

            self.quadtree = QuadTree::new(Rect::new(0.0, 0.0, WIDTH as f32, HEIGHT as f32));
            for i in 0..self.boids.len(){
                self.quadtree.insert(self.boids[i]);
            }
       }
    }
}

fn model(app: &App) -> Model {
    app.new_window()
        .size(WIDTH as u32, HEIGHT as u32)
        .view(view)
        .build()
        .unwrap();

    let mut model = Model {
        boids: Vec::new(),
        quadtree: QuadTree::new(Rect::new(0.0, 0.0, WIDTH as f32, HEIGHT as f32)),
    };

    model.init_boids();
    model
}

fn update(_app: &App, model: &mut Model, _update: Update) {
    model.update_boids();
}

fn view(app: &App, model: &Model, frame: Frame) {
    let draw = app.draw()
                    .x_y(-WIDTH as f32 / 2.0, -HEIGHT as f32 / 2.0);

    draw.background().color(rgb(220.0, 220.0, 220.0));

    for boid in &model.boids {
        boid.draw(&draw);
        // boid.draw_vision(&draw);
    }

    if !IS_NAIVE {
        // model.quadtree.render(&draw);
    }

    draw.to_frame(app, &frame).unwrap();
}

