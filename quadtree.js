class QuadTree {
	constructor (maxDepth, maxChildren, bounds, depth = 0) {
		this.bounds = bounds;
		this.maxDepth = maxDepth;
		this.maxChildren = maxChildren;
		this.depth = depth;
		this.children = [];
		this.nodes = [];
	}

	insert (item) {
		if (this.nodes.length) {
			const index = this._findIndex(item);
			this.nodes[index].insert(item);
			return;
		}

		this.children.push(item);

		const len = this.children.length;
		if (len > this.maxChildren && this.depth < this.maxDepth) {
			this.subdivide();

			for (let i = 0; i < len; i++) {
				this.insert(this.children[i]);
			}

			this.children.length = 0;
		}
	}

	queryRadius (pos, radius) {
		// Walk the tree
		const results = [];
		for (let i = 0; i < this.nodes.length; i++) {
			const node = this.nodes[i];
			const dx = node.bounds.x - pos.x;
			const dy = node.bounds.y - pos.y;
			const dist = Math.sqrt(dx * dx + dy * dy);

			if (dist < radius) {
				results.push(...node.queryRadius(pos, radius));
			}
		}

		return results;
	}

	queryBounds (bounds) {
		const results = [];

		if (this.nodes.length) {
			this.nodes.forEach(node => {
				if (node.bounds.x > bounds.x + bounds.w || node.bounds.x + node.bounds.w < bounds.x || node.bounds.y > bounds.y + bounds.h || node.bounds.y + node.bounds.h < bounds.y) {
					return;
				}

				results.push(...node.queryBounds(bounds));
			});
		}

		const len = this.children.length;
		for (let i = 0; i < len; i++) {
			const child = this.children[i];
			if (child !== undefined) {
				if (child.x > bounds.x && child.x < bounds.x + bounds.w && child.y > bounds.y && child.y < bounds.y + bounds.h) {
					results.push(child);
				}
			}
		}

		return results;
	}

	subdivide () {
		const depth = this.depth + 1;
		const bx = this.bounds.x;
		const by = this.bounds.y;
		const b_w_h = (this.bounds.w / 2) | 0;
		const b_h_h = (this.bounds.h / 2) | 0;

		this.nodes[0] = new QuadTree(this.maxDepth, this.maxChildren, new Rect(bx, by, b_w_h, b_h_h), depth);
		this.nodes[1] = new QuadTree(this.maxDepth, this.maxChildren, new Rect(bx + b_w_h, by, b_w_h, b_h_h), depth);
		this.nodes[2] = new QuadTree(this.maxDepth, this.maxChildren, new Rect(bx, by + b_h_h, b_w_h, b_h_h), depth);
		this.nodes[3] = new QuadTree(this.maxDepth, this.maxChildren, new Rect(bx + b_w_h, by + b_h_h, b_w_h, b_h_h), depth);
	}

	clear () {
		this.children.length = 0;

		const len = this.nodes.length;
		for (let i = 0; i < len; i++) {
			this.nodes[i].clear();
		}

		this.nodes.length = 0;
	}


	_findIndex (item) {
		const b = this.bounds;
		const left = (item.x > b.x + b.w / 2) ? false : true;
		const top = (item.y > b.y + b.h / 2) ? false : true;

		let index = 0;
		if (left) {
			if (!top) {
				index = 2;
			}
		} else {
			if (top) {
				index = 1;
			} else {
				index = 3;
			}
		}

		return index;
	}

	render () {
		// Draw the subdivide lines
		stroke(255);
		strokeWeight(1);
		noFill();
		rect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);

		// Walk the tree
		const len = this.nodes.length;
		for (let i = 0; i < len; i++) {
			this.nodes[i].render();
		}
	}
}
