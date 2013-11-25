Ext.define('NextThought.view.courseware.View', {
	extend: 'NextThought.view.navigation.AbstractPanel',
	alias: 'widget.course',
	ui: 'course',
	requires: [
		'NextThought.view.courseware.outline.View',
		'NextThought.view.courseware.overview.View'
	],


	navigation: {xtype: 'course-outline'},
	body: {xtype: 'course-overview', delegate: ['course course-outline']},


	clear: function() {
		this.navigation.clear();
		this.body.clear();
	},


	courseChanged: function(courseInstance) {
		if (this.currentCourse === courseInstance) {
			return;
		}

		this.currentCourse = courseInstance;
		if (!courseInstance) {
			delete this.currentCourse;
			this.clear();
			return;
		}

		this.store = courseInstance.getNavigationStore();

		this.navigation.maybeChangeStoreOrSelection(courseInstance.getId(), this.store);
	}
});
