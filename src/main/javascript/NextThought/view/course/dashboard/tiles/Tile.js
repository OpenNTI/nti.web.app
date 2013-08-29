Ext.define('NextThought.view.course.dashboard.tiles.Tile', {
	extend: 'Ext.container.Container',

	requires: [
		'NextThought.layout.component.Natural'
	],

	inheritableStatics: {

		/**
		 * @param {NextThought.model.course.navigation.Node} r
		 * @returns {Node[]}
		 */
		getChildrenNodes: function (r) {
			return r && r.getChildren && r.getChildren();
		},

		/**
		 * @param {NextThought.model.course.navigation.Node} r
		 * @returns {NextThought.store.course.Navigation}
		 */
		getCourseNavStore: function (r) {
			return r && r.store;
		}
	},

	statics: {
		/**
		 * Example implementation of getTileFor.  Do not use "inheritableStatics" for this function. It needs to be
		 * CLASS specific.
		 *
		 * @param {Date} effectiveDate
		 * @param {Node} course The node from the ToC document describing this course. aka the <course> tag.
		 * @param {Object} locationInfo the results of {@link NextThought.util.Content#getLocation()} The location information of the navigation that triggered a onCourseChanged.
		 * @param {NextThought.model.course.navigation.Node} courseNodeRecord The record in the course nav store that represents the current point in the course - on or after the effectiveDate.
		 * @param {Function} finish The callback function that hands you the resolved tile(s)
		 * @param {NextThought.view.course.dashboard.tiles.Tile|NextThought.view.course.dashboard.tiles.Tile[]} finish.tiles
		 */
		getTileFor: function (effectiveDate, course, locationInfo, courseNodeRecord, finish) { Ext.callback(finish); }
	},

	config: {
		cols:             2,
		rows:             2,
		baseWeight:       1,
		lastModified:     new Date(0),
		locationInfo:     null,
		courseNodeRecord: null
	},

	innerWeight: 0,
	maxInner:    1,

	getTimeWeight: function () { return 0; },

	ui:     'course-dashboard-tile',
	layout: 'auto',

	initComponent: function () {
		this.callParent(arguments);
		this.addCls([
						'grid-item',
						'row-' + this.getRows(),
						'col-' + this.getCols()
					]);
	}
});


/*
 # Tiles Needed:

 - Up Next
 - Latest Topic (from teacher's forum)
 - Sprinkles:
 - Most Commented Discussions(forums? or notes?... if the former, isn't that the same as the second one?)
 - Most Liked
 - Comments on ??my?? blogs?
 - Most Recent Notes

 # From Design:
 - Labs (Question Sets)

 # Later:
 - Poll
 - Question?
 */
