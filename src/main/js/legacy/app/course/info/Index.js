const Ext = require('@nti/extjs');
const { Info } = require('@nti/web-course');
const CoursesStateStore = require('internal/legacy/app/library/courses/StateStore');
const WindowsActions = require('internal/legacy/app/windows/Actions');
const Email = require('internal/legacy/model/Email');

const StudentInfo = require('./ExtInfo');

require('internal/legacy/mixins/Router');
require('internal/legacy/overrides/ReactHarness');

module.exports = exports = Ext.define(
	'NextThought.app.course.admin.ReactInfo',
	{
		extend: 'Ext.container.Container',
		alias: 'widget.course-info',

		mixins: {
			Router: 'NextThought.mixins.Router',
		},

		layout: 'none',
		items: [],

		initComponent() {
			this.callParent(arguments);

			this.CourseStore = CoursesStateStore.getInstance();
			this.WindowActions = WindowsActions.create();

			this.initRouter();
			this.addDefaultRoute(this.showCourseInfo.bind(this));
		},

		bundleChanged(bundle) {
			if (this.bundle === bundle) {
				return;
			}

			this.bundle = bundle;

			this.onceBundleSetup = bundle
				.getInterfaceInstance()
				.then(courseInterface => {
					if (courseInterface?.PreferredAccess?.isAdministrative) {
						this.setupAdminInfo(courseInterface);
					} else {
						this.setupStudentInfo(bundle);
					}
				});
		},

		setupAdminInfo(course) {
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
					onSave: savedEntry => {
						this.CourseStore.fireEvent(
							'modified-course',
							savedEntry
						);
						this.onSave?.(savedEntry);
					},
					getRouteFor: (object, context) => {
						const { type, filter, scopes } = context || {};
						object = object || {};

						if (type === 'email') {
							if (
								object.hasLink &&
								object.hasLink('Mail') &&
								object.username
							) {
								return () =>
									this.showIndividualEmailEditor(
										object.getLink('Mail'),
										object.username
									);
							}

							if (object.isCourse && object.canEmailEnrollees) {
								return () =>
									this.showCourseEmailEditor(
										object,
										filter,
										scopes
									);
							}
						}
					},
				});
			} else {
				this.adminInfo.setProps({ course });
			}
		},

		setupStudentInfo(bundle) {
			if (this.adminInfo) {
				this.adminInfo.destroy();
				delete this.adminInfo;
			}

			if (!this.studentInfo) {
				this.studentInfo = this.add(StudentInfo.create({}));
			}

			this.studentInfo.bundleChanged(bundle);
		},

		async showCourseInfo(route, subRoute) {
			await this.onceBundleSetup;

			if (this.adminInfo) {
				this.adminInfo.setBaseRoute(this.getBaseRoute());
			} else if (this.studentInfo) {
				return this.studentInfo.handleRoute(subRoute);
			}
		},

		showIndividualEmailEditor: function (url, receiver) {
			const emailRecord = new Email();

			// Set the link to post the email to
			emailRecord.set('url', url);
			emailRecord.set('Receiver', receiver);

			this.WindowActions.showWindow('new-email', null, null, null, {
				record: emailRecord,
			});
		},

		showCourseEmailEditor: function (course, scope = 'All', scopes) {
			const emailRecord = new Email();

			// Set the link to post the email to
			emailRecord.set('url', course && course.getLink('Mail'));
			emailRecord.set('scope', scope);
			emailRecord.set('scopes', scopes);

			this.WindowActions.showWindow('new-email', null, null, null, {
				record: emailRecord,
			});
		},
	}
);
