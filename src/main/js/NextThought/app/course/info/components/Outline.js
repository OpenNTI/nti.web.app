Ext.define('NextThought.app.course.info.components.Outline', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-info-outline',

	requires: [
		'NextThought.app.course.info.components.Menu',
		'NextThought.app.course.info.components.OpenCourseInfo'
	],

	layout: 'none',

	initComponent: function() {
		this.callParent(arguments);
	},

	setContent: function(info, status, showRoster) {
		this.removeAll(true);

		this.menu = this.add({
			xtype: 'course-info-outline-menu',
			info: info,
			showRoster: showRoster
		});

		this.mon(this.menu, 'select-route', this.changeRoute.bind(this));


		if (!showRoster) {
			this.openCourseInfo = this.add({
				xtype: 'course-info-outline-open-course',
				info: info,
				enrollmentStatus: status
			});

			this.mon(this.openCourseInfo, 'show-enrollment', this.fireEvent.bind(this, 'show-enrollment'));
		}
	},

	setActiveItem: function(route) {
		this.menu.setActiveItem(route.path);
	},

	getMenu: function() {
		return this.menu || this.down('course-info-outline-menu');
	},

	changeRoute: function(title, route) {
		this.fireEvent('select-route', title, route);
	}

});
