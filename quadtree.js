class Rect {
	constructor (x, y, w, h) {
		this.position = createVector(x, y);
		this.size = createVector(w, h);
	}

	intersects (rect) {
		return (
			this.position.x < rect.position.x + rect.size.x &&
			this.position.x + this.size.x > rect.position.x &&
			this.position.y < rect.position.y + rect.size.y &&
			this.position.y + this.size.y > rect.position.y
		);
	}

	dbgRender () {
		noFill();
		stroke(255, 0, 0);
		strokeWeight(1);
		rect(this.position.x, this.position.y, this.size.x, this.size.y);
	}
}

class QuadTree {
	constructor (width, height, maxDepth) {
		this.maxDepth = maxDepth;
		this.root = new QuadTreeNode(new Rect(0, 0, width, height));
	}

	insert (item) {
		let currentNode = this.root;
		while (currentNode.depth < this.maxDepth) {
			if (item.position.x > currentNode.bounds.position.x + currentNode.bounds.size.x / 2) { // right
				if (item.position.y < currentNode.bounds.position.y + currentNode.bounds.size.y / 2) { // top
					if (currentNode.topRight === null)
						currentNode.topRight = new QuadTreeNode(new Rect(currentNode.bounds.position.x + currentNode.bounds.size.x / 2,
																		 currentNode.bounds.position.y, 
																		 currentNode.bounds.size.x / 2, 
																		 currentNode.bounds.size.y / 2), currentNode.depth + 1);
					currentNode = currentNode.topRight;
				} else { 
					if (currentNode.bottomRight === null)
						currentNode.bottomRight = new QuadTreeNode(new Rect(currentNode.bounds.position.x + currentNode.bounds.size.x / 2,
																		    currentNode.bounds.position.y + currentNode.bounds.size.y / 2, 
																		    currentNode.bounds.size.x / 2, 
																		    currentNode.bounds.size.y / 2), currentNode.depth + 1);
					currentNode = currentNode.bottomRight;
				}
			} else { // left
				if (item.position.y < currentNode.bounds.position.y + currentNode.bounds.size.y / 2) { // top
					if (currentNode.topLeft === null)
						currentNode.topLeft = new QuadTreeNode(new Rect(currentNode.bounds.position.x,
																	    currentNode.bounds.position.y, 
																	    currentNode.bounds.size.x / 2, 
																	    currentNode.bounds.size.y / 2), currentNode.depth + 1);
					currentNode = currentNode.topLeft;
				}
				else {
					if (currentNode.bottomLeft === null)
						currentNode.bottomLeft = new QuadTreeNode(new Rect(currentNode.bounds.position.x,
																		   currentNode.bounds.position.y + currentNode.bounds.size.y / 2,
																		   currentNode.bounds.size.x / 2, 
																		   currentNode.bounds.size.y / 2), currentNode.depth + 1);
					currentNode = currentNode.bottomLeft;
				}
			}
		}
		currentNode.children.push(item);
	}

	query (boid, radius) {
		const boundingRect = new Rect(boid.position.x - radius, boid.position.y - radius, radius * 2, radius * 2);
		return this.root.query(boid, boundingRect, radius);
	}

	render () {
		this.root.render();
	}
}
class QuadTreeNode {
	constructor (bounds, depth = 0) {
		this.maxDepth = maxDepth;
		this.bounds = bounds;
		this.depth = depth;
		this.children = [];
			
		this.topLeft = null;
		this.topRight = null;
		this.bottomLeft = null;
		this.bottomRight = null;
	}

	query(boid, rect, radius) {
		const results = [];

		//rect.dbgRender();

		if (this.bounds.intersects(rect)) {
			if (this.depth === this.maxDepth)
				results.push(...(this.children.filter(child => dist(child.position.x, child.position.y, boid.position.x, boid.position.y) < radius && child != boid)));
			else {
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

	render () {

		noFill();
		stroke(255);
		strokeWeight(1);
		rect(this.bounds.position.x, this.bounds.position.y, this.bounds.size.x, this.bounds.size.y);

		if (this.topLeft !== null)
			this.topLeft.render();
		if (this.topRight !== null)
			this.topRight.render();
		if (this.bottomLeft !== null)
			this.bottomLeft.render();
		if (this.bottomRight !== null)
			this.bottomRight.render();
	}
}
