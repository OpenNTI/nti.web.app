Ext.define('NextThought.view.course.dashboard.View',{
	extend: 'NextThought.view.course.dashboard.AbstractView',
	alias: 'widget.course-dashboard',

	requires:[
		'NextThought.view.course.dashboard.tiles.*'
	],

	GRID_WIDTH: 5,


	onCourseChanged: function(pageInfo){
		if(!pageInfo.isPartOfCourse()){
			this.tileContainer.removeAll(true);
			return;
		}

		var l = ContentUtils.getLocation(pageInfo),
			toc, course,
			courseNavStore,
			date = new Date();//now

		if( l && l !== ContentUtils.NO_LOCATION ){
			toc = l.toc.querySelector('toc');
			course = toc && toc.querySelector('course');
			courseNavStore = new NextThought.store.course.Navigation({data: toc});
		}

		this.addTiles(this.queryTiles(
				date,course,l,
				courseNavStore.getCurrentBy(date),
				courseNavStore.getNextBy(date)
		));
	},


	/**
	 * Return a set of tile configs for the given arguments.
	 *
	 * This will ask each implementation if it has something to show, if it does it will return a config
	 *
	 * @param {Date} date
	 * @param {Node} course
	 * @param {Object} location
	 * @param {NextThought.model.course.navigation.Node} currentCourseNode
	 * @param {NextThought.model.course.navigation.Node} nextCourseNode
	 * @returns {Array}
	 */
	queryTiles: function(date, course, location, currentCourseNode, nextCourseNode){
		var NS = NextThought.view.course.dashboard.tiles,
			tiles = [];

		Ext.Object.each(NS,function(clsName,cls){
			var fn = cls.getTileFor,
				o = fn && fn.call(cls, date, course, location, currentCourseNode, nextCourseNode);
			if( o ){
				tiles.push(o);
			}
		});

		return tiles;
	}
});
