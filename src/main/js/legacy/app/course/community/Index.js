const Ext = require('@nti/extjs');
const {Community} = require('@nti/web-course');

const CommunityOverrides = require('nti-web-community-overrides');

require('legacy/overrides/ReactHarness');

module.exports = exports = Ext.define('NextThought.app.course.community.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-community',

	cls: `course-community ${CommunityOverrides.viewClassName}`,

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'none',
	items: [],

	initComponent () {
		this.callParent(arguments);

		this.initRouter();
		this.addDefaultRoute(this.showCommunity.bind(this));
	},


	bundleChanged (bundle) {
		if (bundle === this.activeBundle) { return; }

		this.activeBundle = bundle;
		//TODO: see if we need to update the existing component
	},


	async showCommunity (route) {
		const course = await this.activeBundle.getInterfaceInstance();
		const baseroute = this.getBaseRoute();

		if (!course || !course.hasCommunity) {
			throw new Error('Course does not have a community');
		}

		if (this.communityCmp) {
			//TODO: figure this out
		} else {
			this.communityCmp = this.add({
				xtype: 'react',
				component: Community,
				overrides: CommunityOverrides.Overrides,
				topicWindowClassName: CommunityOverrides.topicWindowClassName,
				course,
				baseroute,
				setTitle: (title) => this.setTitle(title)
			});
		}
	}
});