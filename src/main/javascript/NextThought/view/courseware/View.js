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


	onNavigateComplete: function(pageInfo) {
		if (!pageInfo || !pageInfo.isPartOfCourse()) {
			this.navigation.clear();
			this.body.clear();
			return;
		}

		var l = pageInfo && ContentUtils.getLocation(pageInfo),
			t = l && l.title,
			course = t && t.getId();

		if (this.currentCourse !== course) {
			try {
				this.fireEvent('courseChanged', pageInfo, course);
			}
			catch (e) {
				console.error(e.stack || e.message || e);
			}
			this.currentCourse = course;
			this.store = course ? new NextThought.store.courseware.Navigation({data: l.toc}) : undefined;
		}

		this.navigation.maybeChangeStoreOrSelection(pageInfo, this.store);
	},

	makeListenForCourseChange: function(monitors) {
		Ext.each(monitors, function(m) {
			m.mon(this, 'courseChanged', 'onCourseChanged');
		}, this);
	}
});
