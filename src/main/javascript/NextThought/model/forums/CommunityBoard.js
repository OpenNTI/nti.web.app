Ext.define('NextThought.model.forums.CommunityBoard', {
	extend: 'NextThought.model.forums.Board',

	fields: [
		{name: 'title', type: 'auto', persist: false}
	],

	getRelatedCourse: function() {
		return this.course || this.findCourse();
	},

	belongsToCourse: function() {
		return !!this.getRelatedCourse();
	},

	findCourse: function() {
		var me = this;

		Ext.getStore('courseware.EnrolledCourses').each(function(course) {
			var instance = course.get('CourseInstance');
			if (me.getId() === instance.get('Discussions').getId()) {
				me.course = instance;
			}
		});

		return me.course || null;
	}
});
