const Ext = require('@nti/extjs');
const {Roster} = require('@nti/web-course');

require('legacy/overrides/ReactHarness');

const NavigationActions = require('legacy/app/navigation/Actions');
const WindowsActions = require('legacy/app/windows/Actions');
const Email = require('legacy/model/Email');

require('legacy/mixins/Router');

const ROSTER_ROUTE = /^\/roster/;

module.exports = exports = Ext.define('NextThought.app.course.info.components.Roster', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-info-roster',
	mixins: {
		Route: 'NextThought.mixins.Router'
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

	async setContent (data) {
		if (data && data.getInterfaceInstance) {
			const course = await data.getInterfaceInstance();
			this.setCourse(course);
		}
	},

	setCourse (course) {
		this.course = course;
		
		if (this.roster) {
			this.roster.setProps({course});
		}
	},

	onRouteActivate () {
		this.showRoster();
	},

	onRouteDeactivate (newRoute) {
		if (!ROSTER_ROUTE.test(newRoute)) {
			this.roster.destroy();
			delete this.roster;
		}
	},

	showRoster (route) {
		const baseroute = this.getParentBaseRoute();

		if (!this.roster) {
			this.roster = this.add({
				xtype: 'react',
				component: Roster,
				course: this.course,
				baseroute: `${baseroute}/roster`,
				setTitle: (title) => {
					this.setTitle(title);
				},
				getRouteFor: (object, context) => {
					const {type, filter, scopes} = (context || {});
					if (type === 'email' && (object || {}).canEmailEnrollees) {
						return () => this.showEmailEditor(object, filter, scopes);
					}
				}
			});
		}
	},

	showEmailEditor: function (course, scope = 'All', scopes) {
		const emailRecord = new Email();

		// Set the link to post the email to
		emailRecord.set('url', course && course.getLink('Mail'));
		emailRecord.set('scope', scope);
		emailRecord.set('scopes', scopes);

		this.WindowActions.showWindow('new-email', null, null, null, {
			record: emailRecord
		});
	},

});
