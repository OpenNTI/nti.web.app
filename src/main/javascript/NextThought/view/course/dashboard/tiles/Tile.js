Ext.define('NextThought.view.course.dashboard.tiles.Tile',{
	extend: 'Ext.container.Container',

	requires: [
		'NextThought.layout.component.Natural'
	],

	statics: {
		/**
		 * Example implementation of getTileFor.  Do not use "inheritableStatics" for this function. It needs to be
		 * CLASS specific.
		 */
		getTileFor: function(date, courseNode, locationInfo, currentCourseNode, nextCourseNode){}
	},

	config: {
		cols:1,
		rows:1,
		weight: 1,
		lastModified: new Date(0)
	},

	ui: 'course-dashboard',
	layout: 'auto',
	componentLayout: 'natural',

	initComponent: function(){
		this.callParent(arguments);
		this.addCls([
			'grid-item',
			'row-'+this.getRows(),
			'col-'+this.getCols()
		]);
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
	 - Labs (Question Sets)
	 - 9 Most Active Users
	 - Poll
	 - Question?
	 - Supplemental Material
 */
