Ext.define('NextThought.view.course.dashboard.View',{
	extend: 'Ext.container.Container',
	alias: 'widget.course-dashboard',

	ui: 'course',
	cls: 'course-dashboard-container',
	layout: 'auto',

	items:{
		layout: 'auto',
		ui: 'course',
		cls: 'course-dashboard',
		xtype: 'container',
		defaultType: 'box',
		items:[
			{ cls:'grid-item col-4 row-2', cols:4, rows:2 },
			{ cls:'grid-item col-1 row-2', cols:1, rows:2 },
			{ cls:'grid-item col-2 row-1', cols:2, rows:1 },
			{ cls:'grid-item col-2 row-1', cols:2, rows:1 },
			{ cls:'grid-item col-1 row-1', cols:1, rows:1 },
			{ cls:'grid-item col-1 row-1', cols:1, rows:1 },
//			{ cls:'grid-item col-1 row-4', cols:1, rows:4 },
			{ cls:'grid-item col-1 row-1', cols:1, rows:1 },
			{ cls:'grid-item col-1 row-1', cols:1, rows:1 },
			{ cls:'grid-item col-1 row-1', cols:1, rows:1 }
		]
	},


	//Used to test sorting
	shuffle: function shuffle(array) {
	  var m = array.length, t, i;

	  // While there remain elements to shuffle…
	  while (m) {
	    // Pick a remaining element…
	    i = Math.floor(Math.random() * m--);

	    // And swap it with the current element.
	    t = array[m];
	    array[m] = array[i];
	    array[i] = t;
	  }

	  return array;
	},

	constructor: function(config){

		config.items = Ext.clone(this.items);
		this.shuffle(config.items.items);


		this.callParent(arguments);
	},


	onNavigateComplete: function(pageInfo){
		if(!pageInfo.isPartOfCourse()){
			this.removeAll(true);
			return;
		}

		var l = ContentUtils.getLocation(pageInfo),
			toc, course;

		if( l && l !== ContentUtils.NO_LOCATION ){
			toc = l.toc.querySelector('toc');
			course = toc && toc.querySelector('course');
		}
	}
});
