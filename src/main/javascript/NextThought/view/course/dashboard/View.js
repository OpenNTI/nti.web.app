Ext.define('NextThought.view.course.dashboard.View',{
	extend: 'NextThought.view.course.dashboard.AbstractView',
	alias: 'widget.course-dashboard',

	requires:[
		'NextThought.view.course.dashboard.tiles.*'
	],

	GRID_WIDTH: 5,

	constructor: function(config){
		delete config.items;//don't replace our inner item
		this.callParent(arguments);
		this.container = this.items.first();
	},


	onCourseChanged: function(pageInfo){
		if(!pageInfo.isPartOfCourse()){
			this.container.removeAll(true);
			return;
		}

		var l = ContentUtils.getLocation(pageInfo),
			toc, course,
			date = new Date();//now

		if( l && l !== ContentUtils.NO_LOCATION ){
			toc = l.toc.querySelector('toc');
			course = toc && toc.querySelector('course');
		}

		this.addTiles(this.queryTiles(date,course,l));
	},


	/**
	 * Return a set of tile configs for the given arguments.
	 *
	 * This will ask each implementation if it has something to show, if it does it will return a config
	 *
	 * @param {Date} date
	 * @param {Node} course
	 * @param {Object} location
	 * @returns {Array}
	 */
	queryTiles: function(date, course, location){
		var NS = NextThought.view.course.dashboard.tiles,
			tiles = [];

		Ext.Object.each(NS,function(clsName,cls){
			var fn = cls.getTileFor,
				o = fn && fn.call(cls, date, course, location);
			if( o ){
				tiles.push(o);
			}
		});

		return tiles;
	}
});
