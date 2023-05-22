// 2D sparse quadtree implementation

pub struct Bounds {
    pos: [f32; 2],
    size: [f32; 2],
}

pub trait ContainsBounds {
    fn getBounds(&self) -> Bounds;
}

impl Bounds {
    pub fn overlaps (&self, other: &Bounds) -> bool {
        let x_overlap = self.pos[0] < other.pos[0] + other.size[0] &&
                        self.pos[0] + self.size[0] > other.pos[0];
        let y_overlap = self.pos[1] < other.pos[1] + other.size[1] &&
                        self.pos[1] + self.size[1] > other.pos[1];
        x_overlap && y_overlap
    }
    pub fn contains (&self, other: &Bounds) -> bool {
        self.pos[0] <= other.pos[0] &&
        self.pos[1] <= other.pos[1] &&
        self.pos[0] + self.size[0] >= other.pos[0] + other.size[0] &&
        self.pos[1] + self.size[1] >= other.pos[1] + other.size[1]
    }
}

pub struct Quadtree<T: ContainsBounds> {
    bounds: Bounds,
    elements: Vec<T>,
    children: [Option<Box<Quadtree<T>>>; 4],
}

impl<T: ContainsBounds> Quadtree<T> {
    pub fn new(initialBounds: Bounds) -> Self {
        Self {
            bounds: initialBounds,
            elements: Vec::new(),
            children: [None, None, None, None],
        }
    }

    pub fn insert(&mut self, item: &T) {
        if self.bounds.contains(&item.getBounds()) {
            self.elements.push(item.clone());
        } else {
            let mut child_index = 0;
            for i in 0..2 {
                if item.getBounds().pos[i] > self.bounds.pos[i] + self.bounds.size[i] / 2.0 {
                    child_index += 1;
                }
            }
            for i in 0..2 {
                if item.getBounds().pos[i] + item.getBounds().size[i] < self.bounds.pos[i] + self.bounds.size[i] / 2.0 {
                    child_index += 2;
                }
            }
            if self.children[child_index].is_none() {
                let mut child_bounds = self.bounds.clone();
                for i in 0..2 {
                    child_bounds.pos[i] += (child_index % 2) as f32 * child_bounds.size[i] / 2.0;
                    child_bounds.size[i] /= 2.0;
                }
                self.children[child_index] = Some(Box::new(Quadtree::new(child_bounds)));
            }
            self.children[child_index].as_mut().unwrap().insert(item);
        }
    }

    pub fn query(&self, bounds: &Bounds) -> Vec<&T> {
        let mut result = Vec::new();
        if self.bounds.overlaps(bounds) {
            for element in &self.elements {
                if bounds.overlaps(&element.getBounds()) {
                    result.push(element);
                }
            }
            for child in &self.children {
                if let Some(child) = child {
                    result.append(&mut child.query(bounds));
                }
            }
        }
        result
    }
}
