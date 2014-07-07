Ext.define('NextThought.store.courseware.Navigation', {
	extend: 'Ext.data.Store',
	requires: [
		'NextThought.model.courseware.navigation.CourseOutlineNode'
	],
	model: 'NextThought.model.courseware.navigation.Node',
	sorters: [
		{
			fn: function(a, b) {
				var sa = a.get('position'), sb = b.get('position');
				return Globals.naturalSortComparator(sa, sb);
			}
		}//We are assuming the dates are in order?
	],


	constructor: function() {
		this.building = this.outlinePromise
				.then(this.fillFromOutline.bind(this), this.failedToBuild.bind(this));
		this.callParent(arguments);
	},


	onceBuilt: function() {
		return this.building;
	},


	failedToBuild: function(reason) {
		console.error('Could not build outline store:', reason);
		return this;
	},


	fillFromOutline: function(outline) {
		var index = 0, r = [], t, fill, maxDepth, depth = 0,
			tocNodes = this.tocNodes;

		function itr(n) {
			var id = n.getId();

			if (n.isNode) {
				if (!id) {
					console.warn('Node doesnt have an id', n);
				}

				t = tocNodes.getById(id);

				if (!t) {
					console.warn('Node isnt found in toc', id);
				}

				fill = t ? {
					label: t.get('label'),
					tocOutlineNode: t
				} : {};

				Ext.apply(n, {
					_max_depth: maxDepth,
					_depth: depth
				});

				n.set(Ext.apply({ position: index++ }, fill));
				r.push(n);
			}
			depth++;
			(n.get('Items') || []).forEach(itr);
			depth--;
		}

		//we agreed to just count the depth of the first branch. :}
		function getDepth(n) {
			var i = ((n && n.get('Items')) || [])[0];
			return i ? (getDepth(i) + 1) : 0;
		}

		try {
			maxDepth = this.depth = getDepth(outline);

			itr(outline);
			this.add(r);
		}
		finally {
			this.fireEvent('built', this);
		}
		return this;
	},


	findByDate: function(date) {
		var recs = this.getRange() || [];
		return recs.filter(function(o) {
			var open = o.get('AvailableBeginning') || date,
				close = o.get('AvailableEnding') || date;
			return o.get('type') === 'lesson' && close >= date && open <= date;
		});
	}
});
