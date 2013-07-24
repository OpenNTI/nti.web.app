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


/*
	# Tiles Needed:

	 - Up Next
	 - Top Forum Topics (Top Discussions)
	 - Latest Topic (from teacher's forum)
	 - Sprinkles:
		- Most Commented Discussions(forums? or notes?... if the former, isn't that the same as the second one?)
		- Most Liked
		- Comments on ??my?? blogs?
	 - Most Recent Notes

	# From Design:
	 - Videos
	 - Labs (Question Sets)
	 - 9 Most Active Users
	 - Poll
	 - Question?
	 - Supplemental Material
 */
