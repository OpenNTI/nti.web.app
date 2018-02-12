const Ext = require('extjs');

const {getString} = require('legacy/util/Localization');
const CoursesStateStore = require('legacy/app/library/courses/StateStore');

require('./Menu');
require('./OpenCourseInfo');


module.exports = exports = Ext.define('NextThought.app.course.info.components.Outline', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-info-outline',
	layout: 'none',

	initComponent: function () {
		this.callParent(arguments);

		this.CourseStore = CoursesStateStore.getInstance();

		this.CourseStore.on('modified-course', (newEntry) => {
			if(newEntry && newEntry.NTIID === this.activeID) {
				this.updateCatalogEntry(newEntry);
			}
		});
	},

	updateCatalogEntry: function (catalogEntry) {
		this.activeID = catalogEntry.NTIID;

		this.updateStartDate(catalogEntry.StartDate ? new Date(catalogEntry.StartDate) : null);

		if(catalogEntry.Preview) {
			this.startDate && this.startDate.show();
		}
		else {
			this.startDate && this.startDate.hide();
		}
	},

	updateStartDate: function (newDate) {
		if(newDate) {
			this.startDateLabel && this.startDateLabel.update(Ext.util.Format.date(newDate, 'F j, Y') : '');
		}
		else {
			this.startDateLabel && this.startDateLabel.update('No start date');
		}
	},

	renderSelectors: {
		startDateLabel: '.course-info-header-bar .date'
	},

	setContent: function (info, status, showRoster, courseMode, inviteCodeLink, showReports) {
		this.activeID = info.get('NTIID');

		var startDateValue = info.get('StartDate');

		var startDate = startDateValue ? Ext.util.Format.date(startDateValue, 'F j, Y') : null;

		this.removeAll(true);

		this.startDate = this.add({
			xtype: 'box',
			autoEl: {
				cls: 'course-info-header-bar',
				cn: [
					{
						cls: 'col-left',
						cn: [
							{cls: 'label', html: getString('NextThought.view.courseware.info.parts.NotStarted.starts')},
							{cls: 'date', html: startDate || 'No start date'}
						]
					}
				]
			}
		});

		if(!info.get('Preview') && !courseMode) {
			this.startDate.hide();
		}

		this.menu = this.add({
			xtype: 'course-info-outline-menu',
			info: info,
			showRoster: showRoster,
			showReports: showReports,
			inviteCodeLink: inviteCodeLink
		});

		this.mon(this.menu, 'select-route', this.changeRoute.bind(this));

		if (!showRoster && info.get('IsEnrolled')) {
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

	setActiveItem: function (route) {
		this.activePath = route.path;

		if (this.menu) {
			this.menu.setActiveItem(route.path);
		}
	},

	getMenu: function () {
		return this.menu || this.down('course-info-outline-menu');
	},

	changeRoute: function (title, route) {
		this.fireEvent('select-route', title, route);
	}
});
