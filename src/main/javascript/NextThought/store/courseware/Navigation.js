Ext.define('NextThought.store.courseware.Navigation', {
	extend: 'Ext.data.Store',
	requires: [
		'NextThought.model.courseware.navigation.Node'
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
