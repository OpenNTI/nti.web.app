Ext.define('NextThought.view.courseware.info.outline.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-info-outline',
	layout: 'auto',

	requires: [
		'NextThought.view.courseware.info.outline.Menu',
		'NextThought.view.courseware.info.outline.OpenCourseInfo'
	],

	setContent: function(info, status) {
		this.removeAll(true);

		if (Ext.isString(info)) {
			this.hide();
			return;
		}

		this.show();

		this.add({
			xtype: 'course-info-outline-menu',
			info: info
		},{
			xtype: 'course-info-outline-open-course',
			info: info,
			enrollmentStatus: status
		});
	}
});
