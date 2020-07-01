const Ext = require('@nti/extjs');
const { encodeForURI } = require('@nti/lib-ntiids');
const {Community} = require('@nti/web-profiles');

const CommunityOverrides = require('nti-web-community-overrides');
const NavigationActions = require('legacy/app/navigation/Actions');
const lazy = require('legacy/util/lazy-require')
	.get('ParseUtils', ()=> require('legacy/util/Parsing'));

require('legacy/overrides/ReactHarness');

require('legacy/mixins/Router');

module.exports = exports = Ext.define('NextThought.app.profiles.community.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.profile-community',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	cls: `${CommunityOverrides.viewClassName}`,
	layout: 'none',
	items: [],

	initComponent () {
		this.callParent(arguments);
		this.NavActions = NavigationActions.create();

		this.initRouter();

		this.addDefaultRoute(this.showCommunity.bind(this));
	},


	onRouteActivate () {
		clearTimeout(this.deactivateTimeout);
	},

	onRouteDeactivate () {
		this.deactivateTimeout = setTimeout(() => {
			if (this.communityCmp) {
				this.communityCmp.destroy();
				delete this.communityCmp;
			}
		}, 100);
	},


	getContext () {
		return this.activeCommunity;
	},

	setActiveEntity (id) {
		const url = Service.getResolveUserURL(id);

		if (this.activeCommunity && this.activeCommunity.getId() === id) {
			return Promise.resolve(this.activeCommunity);
		}

		if (this.communityCmp) {
			this.communityCmp.destroy();
			delete this.communityCmp;
		}

		return Service.request(url)
			.then(resp => lazy.ParseUtils.parseItems(JSON.parse(resp) || {})[0])
			.then(community => this.activeCommunity = community);
	},


	updateNavigation () {
		this.NavActions.updateNavBar({
			hideBranding: true
		});

		this.NavActions.setActiveContent(null, false, false);
	},


	async showCommunity () {
		const community = await this.activeCommunity.getInterfaceInstance();
		const baseroute = this.getBaseRoute();

		if (!community) {
			throw new Error('Unable to find community.');
		}

		this.updateNavigation();

		if (!this.communityCmp) {
			this.communityCmp = this.add({
				xtype: 'react',
				component: Community.View,
				overrides: CommunityOverrides.Overrides,
				topicWindowClassName: CommunityOverrides.topicWindowClassName,
				community,
				baseroute,
				setTitle: (title) => this.setTitle(title)
			});
		}
	},


	getRouteForPath: function (path, community) {
		const [/*board*/, forum, topic, comment] = path;

		let route = '';

		if (forum) {
			route = `${route}/${encodeForURI(forum.getId())}`;
		}

		if (topic) {
			route = `${route}/${encodeForURI(topic.getId())}`;
		}

		if (comment && comment.isComment) {
			route = `${route}/#${encodeForURI(comment.getId())}`;
		}

		return {
			path: route,
			noWindow: true,
			isFull: true
		};
	}
});
