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
			me = this,
			toc, course,
			courseNavStore,
			date = new Date();//now

		if( l && l !== ContentUtils.NO_LOCATION ){
			toc = l.toc.querySelector('toc');
			course = toc && toc.querySelector('course');
			courseNavStore = new NextThought.store.course.Navigation({data: toc});

			if( me.el ){
				me.el.mask('Loading...');
			}

			this.queryTiles(
				date,course,l,
				courseNavStore.getCurrentBy(date),
				function(tiles){
					me.setTiles(tiles);
					if( me.el ){
						me.el.unmask();
					}
				}
			);
		}
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
	 * @param {Function} callback
	 * @param {Array} callback.tiles
	 */
	queryTiles: function(date, course, location, courseNode, callback){
		var NS = NextThought.view.course.dashboard.tiles,
			tiles = [],
			queue = [],
			me = this,
			push = tiles.push;

		Ext.Object.each(NS,function(clsName,cls){
			var fn = cls.getTileFor;
			if(fn){
				queue.push(Ext.bind(fn,cls));
			}
		});

		Ext.each(queue.slice(),function(fn){
			fn(date, course, location, courseNode, function finish(o){
				queue.pop();
				if( o ){
					push[Ext.isArray(o)?'apply':'call'](tiles,o);
				}

				if(queue.length===0){
					Ext.callback(callback,me,[tiles]);
				}
			});
		});
	}
});



