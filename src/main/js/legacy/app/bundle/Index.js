var Ext = require('extjs');
var ContentIndex = require('../content/Index');
var MixinsState = require('../../mixins/State');
var MixinsRouter = require('../../mixins/Router');
var BundleStateStore = require('./StateStore');
var ContentStateStore = require('../library/content/StateStore');
var ContentIndex = require('../content/content/Index');
var ForumIndex = require('../content/forum/Index');


module.exports = exports = Ext.define('NextThought.app.bundle.Index', {
	extend: 'NextThought.app.content.Index',
	alias: 'widget.bundle-view-container',
	state_key: 'bundle_index',

	mixins: {
		State: 'NextThought.mixins.State',
		Router: 'NextThought.mixins.Router'
	},

	items: [
		{
			xtype: 'bundle-forum',
			id: 'bundle-forum'
		},
		{
			xtype: 'bundle-content',
			id: 'bundle-content'
		}
	],

	initComponent: function() {
		this.callParent(arguments);

		this.ContentStore = NextThought.app.library.content.StateStore.getInstance();
		this.BundleViewStore = NextThought.app.bundle.StateStore.getInstance();

		this.getActiveBundle = Promise.reject();

		this.initRouter();

		this.addRoute('/content', this.showContent.bind(this));
		this.addRoute('/discussions', this.showDiscussions.bind(this));

		this.addDefaultRoute('/content');
	},

	afterRoute: function(route) {
		this.BundleViewStore.markRouteFor(this.activeBundle.getId(), route);
	},

	setActiveBundle: function(ntiid, bundle) {
		var me = this;

		ntiid = ntiid.toLowerCase();

		//if we are setting my current bundle no need to do anything
		if (me.activeBundle && (me.activeBundle.get('NTIID') || '').toLowerCase() === ntiid) {
			me.getActiveBundle = Promise.resolve(me.activeBundle);
		} else {
			me.getActiveBundle = me.ContentStore.onceLoaded()
				.then(function() {
					var current;
					//if the bundle was cached no need to look for it
					if (bundle && (bundle.getId() || '').toLowerCase() === ntiid) {
						current = bundle;
					} else {
						current = me.ContentStore.findContentBy(function(content) {
							return content.get('NTIID').toLowerCase() === ntiid;
						});
					}

					if (!current) {
						return Promise.reject('No bundle found for:', ntiid);
					}

					me.activeBundle = current;

					return current;
				});
		}

		return me.getActiveBundle;
	},

	applyState: function(state) {
		var bundle = this.activeBundle,
			active = state.active,
			content = NextThought.app.content,
			tabs = [];

		/**
		 * Wether or not a view should show its tab
		 * if the view doesn't have a static showTab then show it,
		 * otherwise return the value of showTab
		 * @param  {Object} index the view to check
		 * @return {Boolean}	  show the tab or not
		 */
		function showTab(index) {
			return !index.showTab || index.showTab(bundle);
		}

		if (showTab(content.content.Index)) {
			tabs.push({
				text: getString('NextThought.view.content.View.booktab', 'Book'),
				route: 'content',
				subRoute: this.contentRoute,
				title: 'Book',
				active: active === 'bundle-content'
			});
		}

		if (showTab(content.forum.Index)) {
			tabs.push({
				text: getString('NextThought.view.content.View.discussiontab', 'Discussions'),
				route: 'discussions',
				subRoute: this.discussionsRoute,
				active: active === 'bundle-forum'
			});
		}

		this.navigation.setTabs(tabs);
	},

	showContent: function(route, subRoute) {
		this.contentRoute = subRoute;

		return this.setActiveView('bundle-content', [
				'bundle-forum'
			]).then(function(item) {
				if (item.handleRoute) {
					item.handleRoute(subRoute, route);
				}
			});
	},

	showDiscussions: function(route, subRoute) {
		this.discussionsRoute = subRoute;

		return this.setActiveView('bundle-forum', [
				'bundle-forum'
			]).then(function(item) {
				if (item.handleRoute) {
					item.handleRoute(subRoute, route);
				}
			});
	},

	getRouteForPath: function(path, bundle) {
		var root = path[0] || {},
			isAccessible = this.ContentStore.hasContent(bundle),
			subPath = path.slice[1],
			route;

		if (root.isBoard) {
			root = subPath[0];
			subPath = subPath.slice(1);
		}

		if (root.isForum) {
			route = this.getRouteForForum(root, subPath);
		} else if (root instanceof NextThought.model.PageInfo) {
			route = this.getRouteForPageInfo(root, subPath);
		} else {
			route = {
				path: '',
				isFull: path.length <= 0,
				isAccessible: isAccessible
			};
		}

		route.isAccessible = route.isAccessible === false ? false : isAccessible;

		return route;
	}
});
