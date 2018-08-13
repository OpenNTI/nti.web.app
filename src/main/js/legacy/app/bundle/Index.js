const Ext = require('@nti/extjs');

const {getString} = require('legacy/util/Localization');
const PageInfo = require('legacy/model/PageInfo');

const ContentIndex = require('../content/content/Index');
const ForumIndex = require('../content/forum/Index');
const NotebookIndex = require('../content/notebook/Index');
const ContentStateStore = require('../library/content/StateStore');

const BundleStateStore = require('./StateStore');

require('legacy/mixins/Router');
require('legacy/mixins/State');

require('../content/Index');


module.exports = exports = Ext.define('NextThought.app.bundle.Index', {
	extend: 'NextThought.app.content.Index',
	alias: 'widget.bundle-view-container',
	stateKey: 'bundle_index',

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
		},
		{
			xtype: 'bundle-notebook',
			id: 'bundle-notebook'
		}
	],

	initComponent: function () {
		this.callParent(arguments);

		this.ContentStore = ContentStateStore.getInstance();
		this.BundleViewStore = BundleStateStore.getInstance();

		this.getActiveBundle = Promise.reject();

		this.initRouter();

		this.addRoute('/content', this.showContent.bind(this));
		this.addRoute('/discussions', this.showDiscussions.bind(this));
		this.addRoute('/notebook', this.showNotebook.bind(this));

		this.addDefaultRoute('/content');
	},

	afterRoute: function (route) {
		this.BundleViewStore.markRouteFor(this.activeBundle.getId(), route);
	},

	setActiveBundle: function (ntiid, bundle) {
		var me = this;

		ntiid = ntiid.toLowerCase();

		//if we are setting my current bundle no need to do anything
		if (me.activeBundle && (me.activeBundle.get('NTIID') || '').toLowerCase() === ntiid) {
			me.getActiveBundle = Promise.resolve(me.activeBundle);
		} else {
			me.getActiveBundle = me.ContentStore.onceLoaded()
				.then(function () {
					var current;
					//if the bundle was cached no need to look for it
					if (bundle && (bundle.getId() || '').toLowerCase() === ntiid) {
						current = bundle;
					} else {
						current = me.ContentStore.findContentBy(function (content) {
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

	applyState: function (state) {
		var bundle = this.activeBundle,
			active = state.active,
			tabs = [];

		/**
		 * Wether or not a view should show its tab
		 * if the view doesn't have a static showTab then show it,
		 * otherwise return the value of showTab
		 * @param  {Object} index the view to check
		 * @return {Boolean}	  show the tab or not
		 */
		function showTab (index) {
			return !index.showTab || index.showTab(bundle);
		}

		if (showTab(ContentIndex)) {
			tabs.push({
				text: getString('NextThought.view.content.View.booktab', 'Book'),
				route: 'content',
				subRoute: this.contentRoute,
				title: 'Book',
				active: active === 'bundle-content'
			});
		}

		if (showTab(ForumIndex)) {
			tabs.push({
				text: getString('NextThought.view.content.View.discussiontab', 'Discussions'),
				route: 'discussions',
				subRoute: this.discussionsRoute,
				active: active === 'bundle-forum'
			});
		}

		if(showTab(NotebookIndex)) {
			tabs.push({
				text: getString('NextThought.view.content.View.notebooktab', 'Notebook'),
				route: 'notebook',
				subRoute: this.notebookRoute,
				active: active === 'bundle-notebook'
			});
		}

		this.navigation.setTabs(tabs);
	},

	showContent: function (route, subRoute) {
		this.contentRoute = subRoute;

		return this.setActiveView('bundle-content', [
			'bundle-forum'
		]).then(function (item) {
			if (item.handleRoute) {
				item.handleRoute(subRoute, route);
			}
		});
	},

	showDiscussions: function (route, subRoute) {
		this.discussionsRoute = subRoute;

		return this.setActiveView('bundle-forum', [
			'bundle-forum'
		]).then(function (item) {
			if (item.handleRoute) {
				item.handleRoute(subRoute, route);
			}
		});
	},

	showNotebook (route, subRoute) {
		this.notebookRoute = subRoute;

		return this.setActiveView('bundle-notebook', [
			'bundle-forum'
		]).then(item => {
			if(item.handleRoute) {
				item.handleRoute(subRoute, route);
			}
		});
	},

	getRouteForPath: function (path, bundle) {
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
		} else if (root instanceof PageInfo) {
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
