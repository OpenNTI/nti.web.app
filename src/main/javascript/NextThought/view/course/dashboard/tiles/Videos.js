Ext.define('NextThought.view.course.dashboard.tiles.Videos',{
	extend: 'NextThought.view.course.dashboard.tiles.Base',
	alias: 'widget.course-dashboard-videos',

	statics: {

		getTileFor: function(date, courseNode, locationInfo, currentCourseNode, nextCourseNode){
			var f = 'object[mimeType$=ntivideo]',
				DQ = Ext.DomQuery,
				r = currentCourseNode && currentCourseNode.getChildren();

			r = DQ.filter(r||[],f);

			if(Ext.isEmpty(r)){
				return;
			}

			//We have videos
			return this.create({sources: r, locationInfo: locationInfo});
		}

	},

	config: {
		cols: 4,
		rows: 2,
		weight: 10
	}
});
