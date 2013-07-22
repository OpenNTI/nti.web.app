Ext.define('NextThought.view.course.dashboard.View',{
	extend: 'Ext.container.Container',
	alias: 'widget.course-dashboard',

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
