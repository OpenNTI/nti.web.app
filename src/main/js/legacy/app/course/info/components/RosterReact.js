const Ext = require('@nti/extjs');
const {Roster} = require('@nti/web-course');

require('legacy/overrides/ReactHarness');

const NavigationActions = require('legacy/app/navigation/Actions');

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
		// const baseroute = this.getBaseRoute();

		if (!this.roster) {
			this.roster = this.add({
				xtype: 'react',
				component: Roster,
				course: this.course,
				// baseroute: baseroute,
				setTitle: (title) => {
					this.setTitle(title);
				}
			});
		}
	}
});
