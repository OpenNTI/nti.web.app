Ext.define('NextThought.store.course.Navigation',{
	extend: 'Ext.data.Store',
	requires:[
		'NextThought.model.course.navigation.Node'
	],
	model: 'NextThought.model.course.navigation.Node',
	sorters:[
		{
			fn: function(a,b){
				var sa = a.get('position'), sb = b.get('position');
				return Globals.naturalSortComparator(sa,sb);
			}
		}//We are assuming the dates are in order?
	],


	/**
	 * @returns {Integer}
	 * @private
	 */
	findByDate: function(date){
		return this.findBy(function(o){
			return o.get('date') >= date;
		});
	},


	/**
	 *
	 * @param {Date} date
	 * @returns {NextThought.model.course.navigation.Node}
	 */
	getCurrentBy: function(date){
		return this.getAt(this.findByDate(date));
	}
});
