Ext.define('NextThought.view.course.dashboard.tiles.Notes',{
	extend: 'NextThought.view.course.dashboard.tiles.Tile',
	alias: 'widget.course-dashboard-most-recent-notes',

	statics: {

		getTileFor: function(effectiveDate, course, locationInfo, courseNodeRecord){
			return this.create({
				lastModified: courseNodeRecord.get('date'),
				locationInfo: locationInfo,
				courseNodeRecord:courseNodeRecord
			});
		}

	},


	initComponent: function(){
		this.callParent(arguments);

	}
});
