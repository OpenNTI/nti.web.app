Ext.define('NextThought.view.course.Panel',{
	extend: 'NextThought.view.navigation.AbstractPanel',
	alias: 'widget.course',

	requires: [
		'NextThought.view.course.Outline',
		'NextThought.view.course.Overview'
	],


	navigation: 'course-outline',
	body: 'course-overview',


	onNavigateComplete: function(pageInfo){
		if(!pageInfo || !pageInfo.isPartOfCourse()){
			this.navigation.clear();
			this.body.clear();
			return;
		}


	}

});
