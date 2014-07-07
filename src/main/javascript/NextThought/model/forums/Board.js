Ext.define('NextThought.model.forums.Board', {
	extend: 'NextThought.model.forums.Base',

	isBoard: true,

	fields: [
		{ name: 'ForumCount', type: 'int', persist: false },
		{ name: 'title', type: 'auto', persist: false}
	],


	findBundle: function() { return Promise.reject('Not Found'); },//TODO: fill this in


	findCourse: function() {
		var me = this;

		if (me.course || me.course === false) {
			return Promise.resolve(me.course);
		}

		return CourseWareUtils.findCourseBy(function(course) {
			var instance = course.get('CourseInstance');
			return me.getId() === instance.get('Discussions').getId();
		}).done(function(course) {
			course = course.get('CourseInstance');
			me.course = course;
			return course;
		}).fail(function(reason) {
			console.log(reason);
			me.course = false;
			return false;
		});
	}

});
