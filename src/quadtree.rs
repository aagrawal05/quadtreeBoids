use crate::{VISION_RADIUS, MAX_CHILDREN, MAX_DEPTH};
use crate::Boid;

use nannou::prelude::*;

use std::cell::RefCell;
use std::rc::Rc;

pub struct Rect {
    pub position: Vec2,
    pub size: Vec2,
}

impl Rect {
    pub fn new(x: f32, y: f32, w: f32, h: f32) -> Self {
        Rect {
            position: pt2(x, y),
            size: vec2(w, h),
        }
    }

    pub fn intersects(&self, other: &Rect) -> bool {
        self.position.x < other.position.x + other.size.x
            && self.position.x + self.size.x > other.position.x
            && self.position.y < other.position.y + other.size.y
            && self.position.y + self.size.y > other.position.y
    }

    pub fn contains(&self, entity: &Boid) -> bool {
        entity.position.x > self.position.x
            && entity.position.x < self.position.x + self.size.x
            && entity.position.y > self.position.y
            && entity.position.y < self.position.y + self.size.y
    }
}

pub struct QuadTree {
    root: Rc<RefCell<QuadTreeNode>>,
}

impl QuadTree {
    pub fn new(bounds: Rect) -> Self {
        QuadTree {
            root: Rc::new(RefCell::new(QuadTreeNode::new(bounds, 0))),
        }
    }

    pub fn insert(&mut self, boid: Boid) {
        let mut curr = Rc::clone(&self.root);
        loop {
            let mut curr_ref = curr.borrow_mut();
            let next_node = if curr_ref.children.len() > MAX_CHILDREN as usize - 1 && (MAX_DEPTH == -1 || curr_ref.depth < MAX_DEPTH) {
                if boid.position.x > curr_ref.bounds.position.x + curr_ref.bounds.size.x / 2.0 {
                    // right
                    if boid.position.y > curr_ref.bounds.position.y + curr_ref.bounds.size.y / 2.0 {
                        // bottom
                        if curr_ref.bottom_right.is_none() {
                            curr_ref.subdivide();
                        }
                        Rc::clone(curr_ref.bottom_right.as_ref().unwrap())
                    } else {
                        if curr_ref.top_right.is_none() {
                            curr_ref.subdivide();
                        }
                        Rc::clone(curr_ref.top_right.as_ref().unwrap())
                    }
                } else {
                    if boid.position.y > curr_ref.bounds.position.y + curr_ref.bounds.size.y / 2.0 {
                        if curr_ref.bottom_left.is_none() {
                            curr_ref.subdivide();
                        }
                        Rc::clone(curr_ref.bottom_left.as_ref().unwrap())
                    } else {
                        if curr_ref.top_left.is_none() {
                            curr_ref.subdivide();
                        }
                        Rc::clone(curr_ref.top_left.as_ref().unwrap())
                    }
                }
            } else {
                break;
            };
            drop(curr_ref); // Release the mutable borrow before reassigning curr
            curr = next_node;
        }
        curr.borrow_mut().children.push(boid);
    }


    pub fn query(&self, boid: &Boid) -> Vec<Boid> {
        let bounding_rect = Rect::new(
            boid.position.x - VISION_RADIUS,
            boid.position.y - VISION_RADIUS,
            VISION_RADIUS * 2.0,
            VISION_RADIUS * 2.0,
        );
        self.root.borrow().query(boid, &bounding_rect)
    }

    pub fn render(&self, draw: &Draw){
        // Walk through the tree and draw their rectangle bounds
        let curr = Rc::clone(&self.root);
        loop {
            let curr_ref = curr.borrow();
            draw.rect()
                .xy(curr_ref.bounds.position)
                .wh(curr_ref.bounds.size)
                .stroke_weight(1.0)
                .stroke_color(BLACK)
                .color(rgba(0.0, 0.0, 0.0, 0.0));

            if curr_ref.top_left.is_some() ||
               curr_ref.top_right.is_some() ||
               curr_ref.bottom_left.is_some() ||
               curr_ref.bottom_right.is_some() {
                if curr_ref.top_left.is_some() {
                    QuadTree::render_helper(&curr_ref.top_left.as_ref().unwrap(), draw);
                }
                if curr_ref.top_right.is_some() {
                    QuadTree::render_helper(&curr_ref.top_right.as_ref().unwrap(), draw);
                }
                if curr_ref.bottom_left.is_some() {
                    QuadTree::render_helper(&curr_ref.bottom_left.as_ref().unwrap(), draw);
                }
                if curr_ref.bottom_right.is_some() {
                    QuadTree::render_helper(&curr_ref.bottom_right.as_ref().unwrap(), draw);
                }
            }
            break;
        }
    }

    fn render_helper(node: &Rc<RefCell<QuadTreeNode>>, draw: &Draw) {
        let curr_ref = node.borrow();
        draw.rect()
            .xy(curr_ref.bounds.position+curr_ref.bounds.size/2.0)
            .wh(curr_ref.bounds.size)
            .stroke_weight(1.0)
            .stroke_color(BLUE)
            .color(rgba(0.0, 0.0, 0.0, 0.0));

        if curr_ref.children.len() > 0 {
            if curr_ref.top_left.is_some() {
                QuadTree::render_helper(&curr_ref.top_left.as_ref().unwrap(), draw);
            }
            if curr_ref.top_right.is_some() {
                QuadTree::render_helper(&curr_ref.top_right.as_ref().unwrap(), draw);
            }
            if curr_ref.bottom_left.is_some() {
                QuadTree::render_helper(&curr_ref.bottom_left.as_ref().unwrap(), draw);
            }
            if curr_ref.bottom_right.is_some() {
                QuadTree::render_helper(&curr_ref.bottom_right.as_ref().unwrap(), draw);
            }
        }
    }
}

struct QuadTreeNode {
    bounds: Rect,
    children: Vec<Boid>,
    top_left: Option<Rc<RefCell<QuadTreeNode>>>,
    top_right: Option<Rc<RefCell<QuadTreeNode>>>,
    bottom_left: Option<Rc<RefCell<QuadTreeNode>>>,
    bottom_right: Option<Rc<RefCell<QuadTreeNode>>>,
    depth: i32,
}

impl QuadTreeNode {
    fn new(bounds: Rect, depth: i32) -> Self {
        QuadTreeNode {
            bounds,
            children: Vec::new(),
            top_left: None,
            top_right: None,
            bottom_left: None,
            bottom_right: None,
            depth,
        }
    }

    fn subdivide(&mut self) {
        let top_left_bounds = Rect::new(
            self.bounds.position.x,
            self.bounds.position.y,
            self.bounds.size.x / 2.0,
            self.bounds.size.y / 2.0,
        );
        let top_right_bounds = Rect::new(
            self.bounds.position.x + self.bounds.size.x / 2.0,
            self.bounds.position.y,
            self.bounds.size.x / 2.0,
            self.bounds.size.y / 2.0,
        );
        let bottom_left_bounds = Rect::new(
            self.bounds.position.x,
            self.bounds.position.y + self.bounds.size.y / 2.0,
            self.bounds.size.x / 2.0,
            self.bounds.size.y / 2.0,
        );
        let bottom_right_bounds = Rect::new(
            self.bounds.position.x + self.bounds.size.x / 2.0,
            self.bounds.position.y + self.bounds.size.y / 2.0,
            self.bounds.size.x / 2.0,
            self.bounds.size.y / 2.0,
        );

        self.top_left = Some(Rc::new(RefCell::new(QuadTreeNode::new(
            top_left_bounds,
            self.depth + 1,
        ))));
        self.top_right = Some(Rc::new(RefCell::new(QuadTreeNode::new(
            top_right_bounds,
            self.depth + 1,
        ))));
        self.bottom_left = Some(Rc::new(RefCell::new(QuadTreeNode::new(
            bottom_left_bounds,
            self.depth + 1,
        ))));
        self.bottom_right = Some(Rc::new(RefCell::new(QuadTreeNode::new(
            bottom_right_bounds,
            self.depth + 1,
        ))));

        let mut children = Vec::new();
        std::mem::swap(&mut self.children, &mut children);

        for child in children {
            if self.top_left.as_ref().unwrap().borrow().bounds.contains(&child) {
                self.top_left.as_ref().unwrap().borrow_mut().children.push(child);
            } else if self.top_right.as_ref().unwrap().borrow().bounds.contains(&child) {
                self.top_right.as_ref().unwrap().borrow_mut().children.push(child);
            } else if self.bottom_left.as_ref().unwrap().borrow().bounds.contains(&child) {
                self.bottom_left.as_ref().unwrap().borrow_mut().children.push(child);
            } else if self.bottom_right.as_ref().unwrap().borrow().bounds.contains(&child) {
                self.bottom_right.as_ref().unwrap().borrow_mut().children.push(child);
            } else {
                self.children.push(child);
            }
        }
    }

    fn query(&self, boid: &Boid, bounding_rect: &Rect) -> Vec<Boid> {
        let mut result = Vec::new();
        if self.bounds.intersects(&bounding_rect) {
            if self.top_left.is_none()
                && self.top_right.is_none()
                && self.bottom_left.is_none()
                && self.bottom_right.is_none()
            {
                for child in &self.children {
                    if child.position.distance(boid.position) <= VISION_RADIUS && 
                        child.position.distance(boid.position) != 0.0 {
                        result.push(child.clone());
                    }
                }
            } else {
                if let Some(ref node) = self.top_left {
                    result.append(&mut node.borrow().query(boid, bounding_rect));
                }
                if let Some(ref node) = self.top_right {
                    result.append(&mut node.borrow().query(boid, bounding_rect));
                }
                if let Some(ref node) = self.bottom_left {
                    result.append(&mut node.borrow().query(boid, bounding_rect));
                }
                if let Some(ref node) = self.bottom_right {
                    result.append(&mut node.borrow().query(boid, bounding_rect));
                }
            }
        }
        result
    }
}


