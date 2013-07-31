Ext.define('NextThought.view.course.dashboard.View',{
	extend: 'NextThought.view.course.dashboard.AbstractView',
	alias: 'widget.course-dashboard',

	requires:[
		'NextThought.view.course.dashboard.tiles.*'
	],


	onCourseChanged: function(pageInfo){
		if(!pageInfo.isPartOfCourse()){
			this.tileContainer.removeAll(true);
			return;
		}

		var l = ContentUtils.getLocation(pageInfo),
			toc, course,
			courseNavStore,
			date = new Date(),//now
			tiles = [];

		if( l && l !== ContentUtils.NO_LOCATION ){
			toc = l.toc.querySelector('toc');
			course = toc && toc.querySelector('course');
			courseNavStore = new NextThought.store.course.Navigation({data: toc});

			tiles = this.queryTiles(
					date,course,l,
					courseNavStore.getCurrentBy(date)
			);
		}

		this.setTiles(tiles);
	},


	/**
	 * Return a set of tile configs/instances for the given arguments.
	 *
	 * This will ask each implementation if it has something to show, if it does it will return a config
	 *
	 * @see NextThought.view.course.dashboard.tiles.Tile#getTileFor
	 *
	 * @param {Date} date
	 * @param {Node} course
	 * @param {Object} location
	 * @param {NextThought.model.course.navigation.Node} courseNode
	 * @returns {Ext.Component[]|Object[]}
	 */
	queryTiles: function(date, course, location, courseNode){
		var NS = NextThought.view.course.dashboard.tiles,
			tiles = [],
			push = tiles.push;

		Ext.Object.each(NS,function(clsName,cls){
			var fn = cls.getTileFor,
				o = fn && fn.call(cls, date, course, location, courseNode);
			if( o ){
				push[Ext.isArray(o)?'apply':'call'](tiles,o);
			}
		});

		return tiles;
	}
});
