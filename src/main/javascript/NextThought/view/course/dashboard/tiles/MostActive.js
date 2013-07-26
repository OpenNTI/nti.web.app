Ext.define('NextThought.view.course.dashboard.tiles.MostActive',{
	extend: 'NextThought.view.course.dashboard.tiles.Tile',
	alias: 'widget.course-dashboard-most-active',

	statics: {

		getTileFor: function(effectiveDate, course, locationInfo, courseNodeRecord){
			return this.create({locationInfo: locationInfo});
		}

	},

	config: {
		cols: 1,
		rows: 2,
		weight: 10,
		locationInfo: null
	}


});
