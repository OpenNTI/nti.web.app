Ext.define('NextThought.view.course.Panel',{
	extend: 'NextThought.view.navigation.AbstractPanel',
	alias: 'widget.course',
	ui: 'course',
	requires: [
		'NextThought.view.course.Outline',
		'NextThought.view.course.Overview'
	],


	navigation: {xtype: 'course-outline', delegate:['course']},
	body: {xtype: 'course-overview', delegate:['course','course course-outline']},


	onNavigateComplete: function(pageInfo){
		if(!pageInfo || !pageInfo.isPartOfCourse()){
			this.navigation.clear();
			this.body.clear();
			return;
		}

		this.navigation.onNavigation(pageInfo);
	},


	getCourseStore: function(pageInfo){
		var s = this.store,
			l = pageInfo && ContentUtils.getLocation(pageInfo),
			t = l && l.title,
			course = t && t.getId();

		if(course && this.currentCourse !== course) {
			this.currentCourse = course;
			this.store = s = new NextThought.store.course.Navigation({data: l.toc});

		} else if(!s){
			console.warn('No store');
		}

		return s;
	}

});
