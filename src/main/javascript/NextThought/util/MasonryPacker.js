/**
 * Implements a very naive bin packing algorithm.
 *
 * {@link http://codeincomplete.com/posts/2011/5/7/bin_packing/}
 */
Ext.define('NextThought.util.MasonryPacker', {

	constructor: function (w, h) {
		this.root = { x: 0, y: 0, w: w, h: h };
	},

	fit: function (blocks) {
		var n, node, block, len = blocks.length;
		for (n = 0; n < len; n++) {
			block = blocks[n];
			node = this.findNode(this.root, block.w, block.h);
			if (node) {
				block.fit = this.splitNode(node, block.w, block.h);
			}
		}
	},

	findNode: function (root, w, h) {
		if (root.used) {
			return this.findNode(root.right, w, h) || this.findNode(root.down, w, h);
		}

		if ((w <= root.w) && (h <= root.h)) {
			return root;
		}

		return null;
	},

	splitNode: function (node, w, h) {
		node.used = true;
		node.down = { x: node.x, y: node.y + h, w: node.w, h: node.h - h };
		node.right = { x: node.x + w, y: node.y, w: node.w - w, h: h          };
		return node;
	}
});
