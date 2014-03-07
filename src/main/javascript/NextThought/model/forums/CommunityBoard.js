Ext.define('NextThought.model.forums.CommunityBoard', {
	extend: 'NextThought.model.forums.Board',

	fields: [
		{name: 'title', type: 'auto', persist: false}
	],


	findCourse: function() {
		var p = PromiseFactory.make(),
			me = this;

		if (me.course || me.course === false) {
			p.fulfill(me.course);
		} else {
			CourseWareUtils.findCourseBy(function(course) {
				var instance = course.get('CourseInstance');

				return me.getId() === instance.get('Discussions').getId();
			}).done(function(course) {
				course = course.get('CourseInstance');
				me.course = course;
				p.fulfill(course);
			}).fail(function(reason) {
				console.log(reason);
				me.course = false;
				p.fulfill(false);
			});
		}

		return p;
	}
});
