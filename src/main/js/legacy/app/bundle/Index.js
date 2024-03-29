const Ext = require('@nti/extjs');
const { encodeForURI } = require('@nti/lib-ntiids');
const PageInfo = require('internal/legacy/model/PageInfo');

const ContentStateStore = require('../library/content/StateStore');

const BundleStateStore = require('./StateStore');
const BundleNavigation = require('./Tabs');

require('../content/content/Index');
require('../content/forum/Index');
require('../content/notebook/Index');
require('./community/Index.js');
require('internal/legacy/mixins/Router');
require('internal/legacy/mixins/State');

require('../content/Index');

module.exports = exports = Ext.define('NextThought.app.bundle.Index', {
	extend: 'NextThought.app.content.Index',
	alias: 'widget.bundle-view-container',
	stateKey: 'bundle_index',

	mixins: {
		State: 'NextThought.mixins.State',
		Router: 'NextThought.mixins.Router',
	},

	items: [
		{
			xtype: 'bundle-forum',
			id: 'bundle-forum',
		},
		{
			xtype: 'bundle-content',
			id: 'bundle-content',
		},
		{
			xtype: 'bundle-notebook',
			id: 'bundle-notebook',
		},
		{
			xtype: 'bundle-community',
			id: 'bundle-community',
		},
	],

	initComponent: function () {
		this.callParent(arguments);

		this.ContentStore = ContentStateStore.getInstance();
		this.BundleViewStore = BundleStateStore.getInstance();

		this.initRouter();

		this.addRoute('/content', this.showContent.bind(this));
		this.addRoute('/discussions', this.showDiscussions.bind(this));
		this.addRoute('/notebook', this.showNotebook.bind(this));
		this.addRoute('/community', this.showCommunity.bind(this));

		this.addDefaultRoute('/content');
	},

	afterRoute: function (route) {
		this.BundleViewStore.markRouteFor(this.activeBundle.getId(), route);
	},

	async setActiveBundle(ntiid, bundle) {
		ntiid = ntiid.toLowerCase();

		//if we are setting my current bundle no need to do anything
		if (this.activeBundle?.get('NTIID')?.toLowerCase?.() === ntiid) {
			return this.activeBundle;
		}

		await this.ContentStore.onceLoaded();
		//if the bundle was cached no need to look for it
		const current =
			bundle?.getId?.()?.toLowerCase?.() === ntiid
				? bundle
				: this.ContentStore.findContentBy(function (content) {
						return content.get('NTIID').toLowerCase() === ntiid;
				  });

		if (!current) {
			throw new Error('No bundle found for: ' + ntiid);
		}

		this.activeBundle = current;

		return current;
	},

	applyState() {
		if (!this.activeBundle) {
			return;
		}

		this.activeBundle.getInterfaceInstance().then(content => {
			if (this.navigationCmp && this.navigationCmp.content === content) {
				this.navigationCmp.componentInstance.forceUpdate();
				return;
			}

			this.renderNavigationCmp(BundleNavigation, {
				content,
				baseroute: this.getBaseRoute(),
				getRouteFor: (obj, context) => {
					if (obj !== content) {
						return;
					}

					const base = `/app/bundle/${encodeForURI(
						content.getID()
					)}/`;
					let part = '';

					if (context === 'content') {
						part = 'content';
					} else if (context === 'discussions') {
						part = 'discussions';
					} else if (context === 'notebook') {
						part = 'notebook';
					} else if (context === 'community') {
						part = 'community';
					}

					return `${base}${part}/`;
				},
			});
		});

		this.navigation.useCommonTabs();
	},

	showContent: function (route, subRoute) {
		this.contentRoute = subRoute;

		return this.setActiveView('bundle-content', ['bundle-forum']).then(
			function (item) {
				if (item.handleRoute) {
					item.handleRoute(subRoute, route);
				}
			}
		);
	},

	showDiscussions: function (route, subRoute) {
		this.discussionsRoute = subRoute;

		return this.setActiveView('bundle-forum', ['bundle-forum']).then(
			function (item) {
				if (item.handleRoute) {
					item.handleRoute(subRoute, route);
				}
			}
		);
	},

	showNotebook(route, subRoute) {
		this.notebookRoute = subRoute;

		return this.setActiveView('bundle-notebook', ['bundle-forum']).then(
			item => {
				if (item.handleRoute) {
					item.handleRoute(subRoute, route);
				}
			}
		);
	},

	showCommunity(route, subRoute) {
		this.communityRoute = subRoute;

		return this.setActiveView('bundle-community', ['bundle-forum']).then(
			item => {
				if (item.handleRoute) {
					item.handleRoute(subRoute, route);
				}
			}
		);
	},

	getRouteForPath: function (path, bundle) {
		var root = path[0] || {},
			isAccessible = !!bundle, //this.ContentStore.hasContent(bundle),
			subPath = path.slice(1),
			route;

		if (root.isBoard) {
			root = subPath[0];
			subPath = subPath.slice(1);
		}

		if (root.isForum) {
			route = this.getRouteForForum(root, subPath);
		} else if (root instanceof PageInfo) {
			route = this.getRouteForPageInfo(root, subPath);
		} else {
			route = {
				path: '',
				isFull: path.length <= 0,
				isAccessible: isAccessible,
			};
		}

		route.isAccessible =
			route.isAccessible === false ? false : isAccessible;

		return route;
	},

	getRouteForForum(forum, path) {
		const forumPart = encodeForURI(forum.getId());
		const topic = path && path[0];
		const comment = path && path[1];

		let route = `/community/${forumPart}`;

		if (topic && topic.isTopic) {
			route = `${route}/${encodeForURI(topic.getId())}`;
		}

		if (comment) {
			route = `${route}/#${encodeForURI(comment.getId())}`;
		}

		return {
			path: route,
			noWindow: true,
			isFull: true,
		};
	},
});
