var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.store.courseware.OutlineInterface', {

	statics: {
		fillInDepths: function (outline) {
			this.flattenOutline(outline);
		},


		flattenOutline: function (outline) {
			var records = [], maxDepth,
				index = 0, depth = 0;

			function itr (node) {
				node._max_depth = maxDepth;
				node._position = index;
				node._depth = depth;

				if (node.fillInItems) {
					node.fillInItems();
				}

				index += 1;

				records.push(node);

				depth += 1;
				(node.get('Items') || []).forEach(itr);
				depth -= 1;
			}

			function getDepth (n) {
				var items = ((n && n.get('Items')) || []),
					depth;

				depth = items.reduce(function (max, item) {
					var depth = getDepth(item);

					if (depth > max) {
						max = depth;
					}

					return max;
				}, 0);

				return items.length ? depth + 1 : 0;
			}

			maxDepth = getDepth(outline);

			itr(outline);

			return records;
		}
	},


	mixins: {
		observable: 'Ext.util.Observable'
	},


	constructor: function (config) {
		this.callParent(arguments);

		this.courseInstance = config.courseInstance;
		this.outlineContentsPromise = config.outlineContentsPromise;
		this.tocPromise = config.tocPromise || Promise.resolve();

		this.building = Promise.all([
			this.outlineContentsPromise,
			this.tocPromise
		]).then(this.__build.bind(this));

		this.mixins.observable.constructor.call(this, config);
	},


	onceBuilt: function () {
		return this.building;
	},


	__build: function (results) {
		this.outline = results[0];
		this.tocStore = results[1];

		this.__flattenOutline(this.outline);

		this.mon(this.outline, 'update', this.__flattenOutline.bind(this, this.outline));

		this.isBuilt = true;

		return this;
	},


	__flattenOutline: function (outline) {
		this.__flatContents = this.self.flattenOutline(outline);
	},


	getOutline: function () {
		return this.outline;
	},


	getContents: function () {
		if (!this.isBuilt) {
			console.warn('Calling get contents before it is finished building');
			return null;
		}

		return this.outline.get('Items');
	},

	findOutlineNode: function (id) {
		if (!this.isBuilt) {
			console.warn('Calling getOutlineNode before it is finisehd building');
			return null;
		}

		return this.findNodeBy(function (n) {
			return n.getId() === id || n.get('ContentNTIID') === id;
		});
	},


	getNode: function (id) {
		if (!this.isBuilt) {
			console.warn('Calling get node before it is finished building');
			return null;
		}

		return this.findNodeBy(function (n) {
			return n.getId() === id;
		});
	},


	findNodeBy: function (fn) {
		if (!this.isBuilt) {
			console.warn('Calling find node before it is finished building');
			return null;
		}

		var node;

		this.__flatContents.every(function (n) {
			if (fn(n)) {
				node = n;
				return false;
			}

			return true;
		});

		return node && this.fillInNode(node);
	},


	forEach: function (fn) {
		this.__flatContents.forEach(fn);
	},


	fillInNode: function (node) {
		if (!this.isBuilt) {
			console.warn('Calling fill in node before it is finished building');
			return null;
		}

		var id = node.getId(),
			tocNode = this.tocStore.getById(id);

		node.set('tocOutlineNode', tocNode);

		return node;
	}
});
