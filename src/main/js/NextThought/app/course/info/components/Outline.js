Ext.define('NextThought.app.course.info.components.Outline', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-info-outline',

	requires: [
		'NextThought.app.course.info.components.Menu',
		'NextThought.app.course.info.components.OpenCourseInfo'
	],

	initComponent: function() {
		this.callParent(arguments);
		// this.enableBubble('select-route');
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
			this.add({
				xtype: 'course-info-outline-open-course',
				info: info,
				enrollmentStatus: status
			});
		}
	},

	setActiveItem: function(route){
		this.menu.setActiveItem(route.path);
	},

	getMenu: function() {
		return this.menu || this.down('course-info-outline-menu');
	},

	changeRoute: function(title, route) {
		this.fireEvent('select-route', title, route);
	}

});