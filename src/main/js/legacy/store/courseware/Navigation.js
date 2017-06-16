const Ext = require('extjs');

const Globals = require('../../util/Globals');
require('../../model/courses/navigation/CourseOutlineNode');
require('../../model/courses/navigation/Node');

module.exports = exports = Ext.define('NextThought.store.courseware.Navigation', {
	extend: 'Ext.data.Store',
	model: 'NextThought.model.courses.navigation.Node',

	sorters: [
		{
			fn: function (a, b) {
				var sa = a.get('position'), sb = b.get('position');
				return Globals.naturalSortComparator(sa, sb);
			}
		}//We are assuming the dates are in order?
	],

	constructor: function (config) {
		if (!config.outlinePromise) {
			config.outlinePromise = Promise.reject('Not Given');
		}

		if (!config.tocPromise) {
			config.tocPromise = Promise.resolve();
		}

		this.building = Promise.all([
			config.outlinePromise,
			config.tocPromise
		])
			.then(this.fillFromOutline.bind(this))
			.catch(this.failedToBuild.bind(this));

		this.callParent(arguments);
	},

	onceBuilt: function () {
		return this.building;
	},

	failedToBuild: function (reason) {
		console.error('Could not build outline store:', reason);
		return this;
	},

	fillFromOutline: function (results) {
		var outline = results[0],
			tocNodes = results[1],
			index = 0, r = [], t,
			depth = 0, maxDepth;

		function itr (node) {
			var id = node.getId(),
				fill = {};

			if (node.isNode) {
				t = id && tocNodes.getById(id);

				if (t) {
					fill.tocOutlineNode = t;
				}

				fill.position = index++;

				node['_max_depth'] = maxDepth;
				node['_depth'] = depth;

				if (!node.get('label')) {
					fill.label = 'Empty';
				}

				node.set(fill);

				r.push(node);
			}

			depth++;
			(node.get('Items') || []).forEach(itr);
			depth--;
		}

		function getDepth (n) {
			var i = ((n && n.get('Items')) || [])[0];

			return i ? (getDepth(i) + 1) : 0;
		}


		try {
			maxDepth = this.depth = getDepth(outline);

			itr(outline);
			this.suspendEvents();
			this.add(r);
			this.resumeEvents();
			this.fireEvent('clear', this);
		} finally {
			this.fireEvent('build', this);
		}

		return this;
	},

	findByDate: function (date) {
		var recs = this.getRange() || [];
		return recs.filter(function (o) {
			var open = o.get('AvailableBeginning') || date,
				close = o.get('AvailableEnding') || date;
			return o.get('type') === 'lesson' && close >= date && open <= date;
		});
	}
});
