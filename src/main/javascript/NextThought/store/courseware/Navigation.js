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
		this.building = true;
		this.callParent(arguments);
		this.outlinePromise.done(this.fillFromOutline.bind(this));
	},


	fillFromOutline: function(outline) {
		var index = 0, r = [], t, fill, maxDepth, depth = 0,
			tocNodes = this.tocNodes;

		function itr(n) {
			if (n.isNode) {
				t = tocNodes.getById(n.getId());
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
			this.building = false;
			this.fireEvent('built', this);
		}
	},


	/**
	 * @return {Integer}
	 * @private
	 */
	findByDate: function(date) {
		return this.findBy(function(o) {
			return o.get('date') >= date;
		});
	},


	/**
	 *
	 * @param {Date} date
	 * @return {NextThought.model.courseware.navigation.Node}
	 */
	getCurrentBy: function(date) {
		var r = this.getAt(this.findByDate(date));
		if (!r) {
			r = this.first();
			if (r && date > r.get('date')) {
				r = this.last();
				if (r && date < r.get('date')) {
					r = null;
				}
			}
		}
		return r;
	}
});
