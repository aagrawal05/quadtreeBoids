class Rect {
    constructor(x, y, w, h) {
        this.position = createVector(x, y);
        this.size = createVector(w, h);
    }

    intersects(rect) {
        return (
            this.position.x < rect.position.x + rect.size.x &&
            this.position.x + this.size.x > rect.position.x &&
            this.position.y < rect.position.y + rect.size.y &&
            this.position.y + this.size.y > rect.position.y
        );
    }
}

class QuadTree {
    constructor(width, height) {
        this.root = new QuadTreeNode(new Rect(0, 0, width, height));
    }

    insert(item) {
        let currentNode = this.root;
        while (currentNode.children.length > maxChildren - 1 &&
				(maxDepth == -1 || currentNode.depth < maxDepth)) {
            if (
                item.position.x >
                currentNode.bounds.position.x + currentNode.bounds.size.x / 2
            ) {
                // right
                if (
                    item.position.y <
                    currentNode.bounds.position.y +
                        currentNode.bounds.size.y / 2
                ) {
                    // top
                    if (currentNode.topRight === null) currentNode.subdivide();
                    currentNode = currentNode.topRight;
                } else {
                    if (currentNode.bottomRight === null)
                        currentNode.subdivide();
                    currentNode = currentNode.bottomRight;
                }
            } else {
                // left
                if (
                    item.position.y <
                    currentNode.bounds.position.y +
                        currentNode.bounds.size.y / 2
                ) {
                    // top
                    if (currentNode.topLeft === null) currentNode.subdivide();
                    currentNode = currentNode.topLeft;
                } else {
                    if (currentNode.bottomLeft === null)
                        currentNode.subdivide();
                    currentNode = currentNode.bottomLeft;
                }
            }
        }
        currentNode.children.push(item);
    }

    query(boid, radius) {
        const boundingRect = new Rect(
            boid.position.x - radius,
            boid.position.y - radius,
            radius * 2,
            radius * 2
        );
        return this.root.query(boid, boundingRect, radius);
    }

    render() {
        this.root.render();
    }
}
class QuadTreeNode {
    constructor(bounds, depth = 0) {
        this.bounds = bounds;
        this.depth = depth;
        this.children = [];

        this.topLeft = null;
        this.topRight = null;
        this.bottomLeft = null;
        this.bottomRight = null;
    }

    subdivide() {
        this.topLeft = new QuadTreeNode(
            new Rect(
                this.bounds.position.x,
                this.bounds.position.y,
                this.bounds.size.x / 2,
                this.bounds.size.y / 2
            ),
            this.depth + 1
        );
        this.topRight = new QuadTreeNode(
            new Rect(
                this.bounds.position.x + this.bounds.size.x / 2,
                this.bounds.position.y,
                this.bounds.size.x / 2,
                this.bounds.size.y / 2
            ),
            this.depth + 1
        );
        this.bottomLeft = new QuadTreeNode(
            new Rect(
                this.bounds.position.x,
                this.bounds.position.y + this.bounds.size.y / 2,
                this.bounds.size.x / 2,
                this.bounds.size.y / 2
            ),
            this.depth + 1
        );
        this.bottomRight = new QuadTreeNode(
            new Rect(
                this.bounds.position.x + this.bounds.size.x / 2,
                this.bounds.position.y + this.bounds.size.y / 2,
                this.bounds.size.x / 2,
                this.bounds.size.y / 2
            ),
            this.depth + 1
        );
        this.children.forEach((child) => {
            if (
                child.position.x >
                this.bounds.position.x + this.bounds.size.x / 2
            ) {
                // right
                if (
                    child.position.y <
                    this.bounds.position.y + this.bounds.size.y / 2
                ) {
                    // top
                    this.topRight.children.push(child);
                } else {
                    this.bottomRight.children.push(child);
                }
            } else {
                // left
                if (
                    child.position.y <
                    this.bounds.position.y + this.bounds.size.y / 2
                ) {
                    // top
                    this.topLeft.children.push(child);
                } else {
                    this.bottomLeft.children.push(child);
                }
            }
        });
    }

    query(boid, rect, radius) {
        const results = [];

        if (this.bounds.intersects(rect)) {
            if (
                this.topLeft === null &&
                this.topRight === null &&
                this.bottomLeft === null &&
                this.bottomRight === null
            ) {
                results.push(
                    ...this.children.filter(
                        (child) =>
                            dist(
                                child.position.x,
                                child.position.y,
                                boid.position.x,
                                boid.position.y
                            ) < radius && child != boid
                    )
                );
            } else {
                if (this.topLeft !== null)
                    results.push(...this.topLeft.query(boid, rect, radius));
                if (this.topRight !== null)
                    results.push(...this.topRight.query(boid, rect, radius));
                if (this.bottomLeft !== null)
                    results.push(...this.bottomLeft.query(boid, rect, radius));
                if (this.bottomRight !== null)
                    results.push(...this.bottomRight.query(boid, rect, radius));
            }
        }
        return results;
    }
}