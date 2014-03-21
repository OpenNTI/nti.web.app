Ext.define('NextThought.view.courseware.info.outline.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-info-outline',
	layout: 'auto',

	requires: [
		'NextThought.view.courseware.info.outline.Menu',
		'NextThought.view.courseware.info.outline.OpenCourseInfo'
	],

	setContent: function(info, status, showRoster) {
		this.removeAll(true);

		if (Ext.isString(info)) {
			this.hide();
			return;
		}

		this.show();

		this.add({
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
		//} else {
			//add chart and totals here? (Seems wastefull of vertical space to add it to
			// the header above the grid) -- when dev tools closed or unpined it still
			// feels very crunched with a pie chart above the grid.
		}
	}
});
