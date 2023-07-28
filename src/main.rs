mod boid;
mod quadtree;

use crate::quadtree::QuadTree;
use crate::quadtree::Rect;
use crate::boid::Boid;

use nannou::prelude::*;

const WIDTH: i32 = 1080;
const HEIGHT: i32 = 720;

const POPULATION: i32 = 1000;
const VISION_RADIUS: f32 = 10.0;

fn main() {
    nannou::app(model).update(update).run();
}

struct Model {
    boids: Vec<Boid>,
    is_naive: bool,
    boid_size: f32,
    quadtree: QuadTree,
}

impl Model {
    fn init_boids(&mut self){
        self.boids = Vec::new();
        for _ in 0..POPULATION {
            let boid = Boid::new();
            self.boids.push(boid);
            if !self.is_naive {
                self.quadtree.insert(boid);
            }
        }
    }

    fn update_boids(&mut self) {
        if self.is_naive {
            let mut visible_boids: Vec<Vec<Boid>> = vec![Vec::new(); self.boids.len()];

            for i in 0..self.boids.len() {
                for j in (i + 1)..self.boids.len() {
                    if self.boids[i].position.distance(self.boids[j].position) < VISION_RADIUS {
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
            // Regenerate quadtree
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

    let is_naive = false;
    let boid_size = 2.0;

    let mut model = Model {
        boids: Vec::new(),
        is_naive,
        boid_size,
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

    draw.background().color(BLACK);

    for boid in &model.boids {
        boid.draw(&draw, model.boid_size);
        boid.draw_vision(&draw);
    }

    draw.to_frame(app, &frame).unwrap();
}

