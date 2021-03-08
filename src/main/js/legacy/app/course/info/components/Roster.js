const Ext = require('@nti/extjs');
const { Roster } = require('@nti/web-course');
const NavigationActions = require('internal/legacy/app/navigation/Actions');
const WindowsActions = require('internal/legacy/app/windows/Actions');
const Email = require('internal/legacy/model/Email');
require('internal/legacy/overrides/ReactHarness');
require('internal/legacy/mixins/Router');

const ROSTER_ROUTE = /^\/roster/;

module.exports = exports = Ext.define(
	'NextThought.app.course.info.components.Roster',
	{
		extend: 'Ext.container.Container',
		alias: 'widget.course-info-roster',
		mixins: {
			Route: 'NextThought.mixins.Router',
		},

		items: [],
		layout: 'none',

		initComponent: function () {
			this.callParent(arguments);
			this.removeCls('make-white');
			this.initRouter();
			this.addDefaultRoute(this.showRoster.bind(this));
			this.NavigationActions = NavigationActions.create();
			this.WindowActions = WindowsActions.create();
		},

		async setContent(data) {
			if (data && data.getInterfaceInstance) {
				const course = await data.getInterfaceInstance();
				this.setCourse(course);
			}
		},

		setCourse(course) {
			this.course = course;

			if (this.roster) {
				this.roster.setProps({ course });
			}
		},

		onRouteActivate() {
			this.showRoster();
		},

		onRouteDeactivate(newRoute) {
			if (!ROSTER_ROUTE.test(newRoute)) {
				this.roster.destroy();
				delete this.roster;
			}
		},

		showRoster(route) {
			const baseroute = this.getParentBaseRoute();

			if (!this.roster) {
				this.roster = this.add({
					xtype: 'react',
					component: Roster,
					course: this.course,
					baseroute: `${baseroute}/roster`,
					setTitle: title => {
						this.setTitle(title);
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
