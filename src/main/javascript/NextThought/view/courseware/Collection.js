Ext.define('NextThought.view.courseware.Collection', {
	extend: 'NextThought.view.library.Collection',
	alias: 'widget.course-collection',

	hidden: true, //don't show this component unless the courseware controller says it can show.
	courseList: true,
	store: 'courseware.EnrolledCourses',
	cls: 'courses',


	prepareData: function(data, index, record) {
		var i = Ext.Object.chain(this.callParent(arguments)),
			course = record.get('CourseInstance').asUIData();

		if (course) {
			Ext.apply(i, {
				icon: course.icon,
				title: course.title,
				courseName: course.label
			});
		}

		return i;
	},


	handleSelect: function(selModel, record) {
		selModel.deselect(record);
		var instance = record && record.get('CourseInstance');
		instance.fireNavigationEvent(this);
	}
});
