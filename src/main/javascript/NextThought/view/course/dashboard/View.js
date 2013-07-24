Ext.define('NextThought.view.course.dashboard.View',{
	extend: 'NextThought.view.course.dashboard.AbstractView',
	alias: 'widget.course-dashboard',

	requires:[
		'NextThought.view.course.dashboard.tiles.*'
	],

	GRID_WIDTH: 5,

	constructor: function(config){

		var items = config.items ||
				[
					{ cls:'grid-item col-4 row-2', cols:4, rows:2, weight: 10 },
					{ cls:'grid-item col-1 row-2', cols:1, rows:2, weight: 10 },
					{ cls:'grid-item col-2 row-1', cols:2, rows:1 },
					{ cls:'grid-item col-2 row-1', cols:2, rows:1 },
					{ cls:'grid-item col-1 row-1', cols:1, rows:1 },
					{ cls:'grid-item col-1 row-1', cols:1, rows:1 },
					{ cls:'grid-item col-2 row-2', cols:2, rows:2 },
					{ cls:'grid-item col-1 row-1', cols:1, rows:1 },
					{ cls:'grid-item col-1 row-1', cols:1, rows:1 },
					{ cls:'grid-item col-1 row-1', cols:1, rows:1 }
				];

		delete config.items;//don't replace our inner item
		this.callParent(arguments);
		this.container = this.items.first();


		this.addTiles(items);
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
	}
});
