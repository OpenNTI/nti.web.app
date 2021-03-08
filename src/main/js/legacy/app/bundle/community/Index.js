const Ext = require('@nti/extjs');
const { Community } = require('@nti/web-content');
const CommunityOverrides = require('internal/nti-web-community-overrides');

require('internal/legacy/overrides/ReactHarness');

module.exports = exports = Ext.define(
	'NextThought.app.bundle.community.Index',
	{
		extend: 'Ext.container.Container',
		alias: 'widget.bundle-community',

		cls: `bundle-community ${CommunityOverrides.viewClassName}`,

		mixins: {
			Router: 'NextThought.mixins.Router',
		},

		layout: 'none',
		items: [],

		initComponent() {
			this.callParent(arguments);

			this.initRouter();
			this.addDefaultRoute(this.showCommunity.bind(this));
		},

		bundleChanged(bundle) {
			if (bundle === this.activeBundle) {
				return;
			}

			this.activeBundle = bundle;

			if (this.communityCmp) {
				this.communityCmp.destroy();
				delete this.communityCmp;
			}
		},

		async showCommunity(route) {
			const bundle = await this.activeBundle.getInterfaceInstance();
			const baseroute = this.getBaseRoute();

			if (!bundle || !bundle.hasCommunity) {
				throw new Error('Bundle does not have a community');
			}

			if (!this.communityCmp) {
				this.communityCmp = this.add({
					xtype: 'react',
					component: Community,
					overrides: CommunityOverrides.Overrides,
					topicWindowClassName:
						CommunityOverrides.topicWindowClassName,
					content: bundle,
					baseroute,
					setTitle: title => this.setTitle(title),
				});
			}
		},
	}
);
