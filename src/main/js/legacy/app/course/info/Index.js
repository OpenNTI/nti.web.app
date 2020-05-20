const Ext = require('@nti/extjs');
const {Info} = require('@nti/web-course');

const CoursesStateStore = require('legacy/app/library/courses/StateStore');

const StudentInfo = require('./ExtInfo');

require('legacy/mixins/Router');
require('legacy/overrides/ReactHarness');

module.exports = exports = Ext.define('NextThought.app.course.admin.ReactInfo', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-info',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'none',
	items: [],

	initComponent () {
		this.callParent(arguments);

		this.CourseStore = CoursesStateStore.getInstance();

		this.initRouter();
		this.addDefaultRoute(this.showCourseInfo.bind(this));
	},

	bundleChanged (bundle) {
		if (this.bundle === bundle) { return; }
		
		this.bundle = bundle;

		this.onceBundleSetup = bundle.getInterfaceInstance()
			.then((courseInterface) => {
				if (courseInterface?.PreferredAccess?.isAdministrative) {
					this.setupAdminInfo(courseInterface);
				} else {
					this.setupStudentInfo(bundle);
				}
			});
	},

	setupAdminInfo (course) {
		if (this.studentInfo) {
			this.studentInfo.destroy();
			delete this.studentInfo;
		}

		if (!this.adminInfo) {
			this.adminInfo = this.add({
				xtype: 'react',
				component: Info.Page,
				course,
				setTitle: t => this.setTitle(t),
				onSave: (savedEntry) => {
					this.CourseStore.fireEvent('modified-course', savedEntry);
					this.onSave?.(savedEntry);
				}
			});
		} else {
			this.adminInfo.setProps({course});
		}
	},

	setupStudentInfo (bundle) {
		if (this.adminInfo) {
			this.adminInfo.destroy();
			delete this.adminInfo;
		}

		if (!this.studentInfo) {
			this.studentInfo = this.add(
				StudentInfo.create({})
			);
		}

		this.studentInfo.bundleChanged(bundle);
	},

	async showCourseInfo (route, subRoute) {
		await this.onceBundleSetup;

		if (this.adminInfo) {
			this.adminInfo.setBaseRoute(this.getBaseRoute());
		} else if (this.studentInfo) {
			return this.studentInfo.handleRoute(subRoute);
		}
	}
});