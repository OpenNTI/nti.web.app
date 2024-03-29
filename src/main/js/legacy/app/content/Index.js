const Ext = require('@nti/extjs');
const { encodeForURI } = require('@nti/lib-ntiids');
const { wait } = require('@nti/lib-commons');
const NavigationActions = require('internal/legacy/app/navigation/Actions');
const WindowsStateStore = require('internal/legacy/app/windows/StateStore');

const ComponentsNavigation = require('./components/Navigation');

require('internal/legacy/util/Parsing');
require('internal/legacy/model/Video');

module.exports = exports = Ext.define('NextThought.app.content.Index', {
	extend: 'Ext.container.Container',

	//Should only be extended

	layout: {
		type: 'card',
		deferredRender: true,
	},

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'navigation-container' },
		{ id: '{id}-body', cn: ['{%this.renderContainer(out,values)%}'] },
	]),

	initComponent: function () {
		this.callParent(arguments);

		//Declare this here so its scope to the instance
		this['componentMapping'] = {};

		this.NavigationActions = NavigationActions.create();
		this.WindowStateStore = WindowsStateStore.getInstance();

		this.on({
			beforedeactivate: this.onBeforeDeactivate.bind(this),
			deactivate: this.onDeactivate.bind(this),
		});
	},

	beforeDestroy() {
		if (this.navigationCmp) {
			this.navigationCmp.destroy();
			delete this.navigationCmp;
		}
	},

	onBack: function () {
		this.pushRootRoute('', '/');
	},

	onContentChange: function (title, route) {
		this.pushRootRoute('', route);
	},

	onTabChange: function (title, route) {
		this.pushRoute('', route);
	},

	onQuickLinkNav: function (tilte, route) {},

	getRouteTitle: function () {
		if (!this.activeBundle) {
			return '';
		}

		var data = this.activeBundle.asUIData();

		return data.title;
	},

	getContext: function () {
		return this.activeBundle;
	},

	onBeforeDeactivate: function () {
		var current = this.getLayout().getActiveItem();

		return current.fireEvent('beforedeactivate');
	},

	onDeactivate: function () {
		var current = this.getLayout().getActiveItem();

		return current.fireEvent('deactivate');
	},

	getNavigation: function () {
		if (!this.navigation || this.navigation.isDestroyed) {
			this.navigation = ComponentsNavigation.create({
				bodyView: this,
			});
		}

		return this.navigation;
	},

	getItem: function (xtype) {
		var cmp = this.componentMapping[xtype];

		if (!cmp) {
			cmp = this.componentMapping[xtype] = this.down(xtype);
			this.addChildRouter(cmp);
			cmp.courseContainer = this;
			cmp.setShadowRoot = this.setShadowRoot.bind(this, xtype);
			cmp.clearRouteState = this.clearRouteStateFor.bind(this, xtype);
		}

		return cmp;
	},

	setItemBundle: function (xtypes, bundle) {
		if (!Ext.isArray(xtypes)) {
			xtypes = [xtypes];
		}

		bundle = bundle || this.activeBundle;

		var me = this;

		xtypes = xtypes.map(function (xtype) {
			var item = me.getItem(xtype);

			return item.bundleChanged && item.bundleChanged(bundle);
		});

		return Promise.all(xtypes);
	},

	setActiveItem: function (xtype) {
		var layout = this.getLayout(),
			item = this.getItem(xtype),
			current = layout.getActiveItem();

		if (current === item) {
			item.fireEvent('activate');
		}

		this.getLayout().setActiveItem(item);
	},

	setShadowRoot: function (xtype, root) {
		this.SHADOW_ROOTS = this.SHADOW_ROOTS || {};

		this.SHADOW_ROOTS[xtype] = root;

		//reapply the state so the nav can get the new root
		this.applyState(this.activeState);
	},

	setCmpRouteState(xtype, state) {
		this.ROUTE_STATES = this.ROUTE_STATES || {};

		this.ROUTE_STATES[xtype] = state;
	},

	getCmpRouteState(xtype) {
		return (this.ROUTE_STATES || {})[xtype];
	},

	clearRouteStates() {
		this.ROUTE_STATES = {};
		this.SHADOW_ROOTS = {};
	},

	clearRouteStateFor(xtype) {
		if (this.ROUTE_STATES) {
			delete this.ROUTE_STATES[xtype];
		}
	},

	getRoot: function (xtype) {
		var shadow = this.SHADOW_ROOTS && this.SHADOW_ROOTS[xtype];

		return shadow || '';
	},

	__loadBundle: function (useWhiteMask) {
		var bundle = this.activeBundle;

		this.navBarConfig = {
			cmp: this.getNavigation(),
		};

		this.NavigationActions.updateNavBar(this.navBarConfig);

		this.usingWhiteMask = useWhiteMask;

		this.NavigationActions.setActiveContent(
			bundle,
			useWhiteMask,
			useWhiteMask
		);
	},

	updateActiveContent() {
		this.NavigationActions.setActiveContent(
			this.activeBundle,
			this.usingWhiteMask,
			this.usingWhiteMask
		);
	},

	renderNavigationCmp(cmp, props) {
		if (!this.rendered) {
			this.on('afterrender', () => this.setNavigationCmp(cmp, props));
			return;
		}

		if (this.navigationCmp) {
			this.navigationCmp.destroy();
			delete this.navigationCmp;
		}

		const container = this.el.down('.navigation-container');

		this.navigationCmp = Ext.widget({
			xtype: 'react',
			component: cmp,
			renderTo: container,
			...props,
		});
	},

	/**
	 * Set up the active tab
	 *
	 * @param  {string} active	 xtype of the active tab
	 * @param  {Array} inactive xtypes of the other views to set the active course on, but not wait
	 * @param {string} tab the tab to mark as active if different than the one for the xtype
	 * @param {Object} navConfig override the navbar config
	 * @param {boolean} useWhiteMask mask the course image with white
	 * @returns {Promise}		 fulfills when the tab is set up
	 */
	setActiveView: function (active, inactive, tab, navConfig, useWhiteMask) {
		var me = this;

		me.__loadBundle(useWhiteMask);

		me.navigation.bundleChanged(me.activeBundle, me.getCurrentRoute());

		if (navConfig) {
			this.hasAlternateNav = true;
			this.NavigationActions.updateNavBar(navConfig);
		} else if (this.hasAlternateNav) {
			delete this.hasAlternateNav;
			this.NavigationActions.updateNavBar({ showNavCmp: true });
		}

		me.activeState = {
			active: tab || active,
		};

		me.applyState(me.activeState);

		function updateInactive() {
			wait().then(me.setItemBundle.bind(me, inactive, me.activeBundle));
		}

		return me
			.setItemBundle(active, me.activeBundle)
			.then(me.setActiveItem.bind(me, active))
			.then(function () {
				var item = me.getItem(active);

				updateInactive();
				return item;
			})
			.catch(function (reason) {
				me.replaceRoute('Info', 'info');
			});
	},

	getRouteForPageInfo: function (pageInfo, path) {
		var id = pageInfo.getId();

		id = encodeForURI(id);

		return {
			path: '/content/' + id,
			isFull: true,
			isAccessible: true,
		};
	},

	getRouteForForum: function (forum, path) {
		var forumId = forum.getId(),
			topic = path.shift(),
			comment = path.shift();

		if (topic) {
			this.WindowStateStore.cacheObject(topic.getId(), topic);
		}

		if (comment) {
			this.WindowStateStore.cacheObject(comment.getId(), topic);
		}

		forumId = encodeForURI(forumId);

		return {
			path: '/discussions/' + forumId,
			isFull: true,
		};
	},
});
