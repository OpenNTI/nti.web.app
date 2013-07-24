Ext.define('NextThought.view.course.dashboard.tiles.Base',{
	extend: 'Ext.container.Container',


	statics: {
		/**
		 * Example implementation of getTileFor.  Do not use "inheritableStatics" for this function. It needs to be
		 * CLASS specific.
		 */
		getTileFor: function(date, courseNode, locationInfo){}
	},


	cols:1,
	rows:1,
	weight: 1,

	initComponent: function(){
		this.addCls([
			'grid-item',
			'rows-'+this.rows,
			'cols-'+this.cols
		]);
		this.callParent(arguments);
	}
});
