var Ext = require('extjs');
var ComponentsMenu = require('./Menu');
var ComponentsOpenCourseInfo = require('./OpenCourseInfo');


module.exports = exports = Ext.define('NextThought.app.course.info.components.Outline', {
    extend: 'Ext.container.Container',
    alias: 'widget.course-info-outline',
    layout: 'none',

    initComponent: function() {
		this.callParent(arguments);
	},

    setContent: function(info, status, showRoster, courseMode) {
		var startDate = Ext.util.Format.date(info.get('StartDate'), 'F j, Y');

		this.removeAll(true);

		if (courseMode) {
			this.startDate = this.add({
				xtype: 'box',
			    autoEl: {
					cls: 'course-info-header-bar',
					cn: [
						{
							cls: 'col-left',
						    cn: [
						        {cls: 'label', html: getString('NextThought.view.courseware.info.parts.NotStarted.starts')},
								{cls: 'date', html: startDate}
						    ]
						}
					]
			    }
			});
		}

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

		if (this.activePath) {
			this.menu.setActiveItem(this.activePath);
		}
	},

    setActiveItem: function(route) {
		this.activePath = route.path;

		if (this.menu) {
			this.menu.setActiveItem(route.path);
		}
	},

    getMenu: function() {
		return this.menu || this.down('course-info-outline-menu');
	},

    changeRoute: function(title, route) {
		this.fireEvent('select-route', title, route);
	}
});
