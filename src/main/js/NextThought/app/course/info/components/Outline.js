Ext.define('NextThought.app.course.info.components.Outline', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-info-outline',

	requires: [
		'NextThought.app.course.info.components.Menu',
		'NextThought.app.course.info.components.OpenCourseInfo'
	],

	setContent: function(info, status, showRoster) {
		this.removeAll(true);

		this.menu = this.add({
			xtype: 'course-info-outline-menu',
			info: info,
			showRoster: showRoster
		});


		if (!showRoster) {
			this.add({
				xtype: 'course-info-outline-open-course',
				info: info,
				enrollmentStatus: status
			});
		}
	},

	getMenu: function() {
		return this.menu || this.down('course-info-outline-menu');
	}
});