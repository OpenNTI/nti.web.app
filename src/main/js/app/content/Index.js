export default Ext.define('NextThought.app.content.Index', {
	extend: 'Ext.container.Container',
	//Should only be extended

	layout: {
		type: 'card',
		deferredRender: true
	},

	requires: [
		'NextThought.app.content.components.Navigation',
		'NextThought.app.navigation.Actions',
		'NextThought.app.windows.StateStore',
		'NextThought.model.Video'
	],


	initComponent: function() {
		this.callParent(arguments);

		//Declare this here so its scope to the instance
		this.cmp_map = {};

		this.NavigationActions = NextThought.app.navigation.Actions.create();
		this.WindowStateStore = NextThought.app.windows.StateStore.getInstance();

		this.on({
			'beforedeactivate': this.onBeforeDeactivate.bind(this),
			'deactivate': this.onDeactivate.bind(this)
		});
	},


	onBack: function() {
		this.pushRootRoute('', '/');
	},


	onContentChange: function(title, route) {
		this.pushRootRoute('', route);
	},


	onTabChange: function(title, route) {
		this.pushRoute('', route);
	},


	onQuickLinkNav: function(tilte, route) {},


	getRouteTitle: function() {
		if (!this.activeBundle) { return ''; }

		var data = this.activeBundle.asUIData();

		return data.title;
	},


	getContext: function() {
		return this.activeBundle;
	},


	onBeforeDeactivate: function() {
		var current = this.getLayout().getActiveItem();

		return current.fireEvent('beforedeactivate');
	},


	onDeactivate: function() {
		var current = this.getLayout().getActiveItem();

		return current.fireEvent('deactivate');
	},


	getNavigation: function() {
		if (!this.navigation || this.navigation.isDestroyed) {
			this.navigation = NextThought.app.content.components.Navigation.create({
				bodyView: this
			});
		}

		return this.navigation;
	},


	getItem: function(xtype) {
		var cmp = this.cmp_map[xtype];

		if (!cmp) {
			cmp = this.cmp_map[xtype] = this.down(xtype);
			this.addChildRouter(cmp);
			cmp.courseContainer = this;
			cmp.setShadowRoot = this.setShadowRoot.bind(this, xtype);
		}

		return cmp;
	},


	setItemBundle: function(xtypes, bundle) {
		if (!Ext.isArray(xtypes)) {
			xtypes = [xtypes];
		}

		bundle = bundle || this.activeBundle;

		var me = this,
			activeBundle = this.activeBundle;

		xtypes = xtypes.map(function(xtype) {
			var item = me.getItem(xtype);

			return item.bundleChanged && item.bundleChanged(bundle);
		});

		return Promise.all(xtypes);
	},



	setActiveItem: function(xtype) {
		var layout = this.getLayout(),
			item = this.getItem(xtype),
			current = layout.getActiveItem();

		if (current === item) {
			item.fireEvent('activate');
		}


		this.getLayout().setActiveItem(item);
	},


	setShadowRoot: function(xtype, root) {
		this.SHADOW_ROOTS = this.SHADOW_ROOTS || {};

		this.SHADOW_ROOTS[xtype] = root;

		//reapply the state so the nav can get the new root
		this.applyState(this.activeState);
	},


	getRoot: function(xtype) {
		var shadow = this.SHADOW_ROOTS && this.SHADOW_ROOTS[xtype];

		return shadow || '';
	},


	__loadBundle: function() {
		var bundle = this.activeBundle;

		this.NavigationActions.updateNavBar({
			cmp: this.getNavigation()
		});

		this.NavigationActions.setActiveContent(bundle);
	},


	/**
	 * Set up the active tab
	 * @param  {String} active   xtype of the active tab
	 * @param  {Array} inactive xtypes of the other views to set the active course on, but not wait
	 * @return {Promise}         fulfills when the tab is set up
	 */
	setActiveView: function(active, inactive, tab) {
		var me = this;

		me.__loadBundle();

		me.navigation.bundleChanged(me.activeBundle, me.getCurrentRoute());

		me.activeState = {
			active: tab || active
		};

		me.applyState(me.activeState);

		function updateInactive() {
			wait().then(me.setItemBundle.bind(me, inactive, me.activeBundle));
		}

		return me.setItemBundle(active, me.activeBundle)
				.then(me.setActiveItem.bind(me, active))
				.then(function() {
					var item = me.getItem(active);

					updateInactive();
					return item;
				})
				.fail(function(reason) {
					me.replaceRoute('Info', 'info');
				});
	},


	getRouteForPageInfo: function(pageInfo, path) {
		var id = pageInfo.getId();

		id = ParseUtils.encodeForURI(id);

		return {
			path: '/content/' + id,
			isFull: true,
			isAccessible: true
		};
	},


	getRouteForForum: function(forum, path) {
		var forumId = forum.getId(),
			topic = path.shift(),
			comment = path.shift();

		if (topic) {
			this.WindowStateStore.cacheObject(topic.getId(), topic);
		}

		if (comment) {
			this.WindowStateStore.cacheObject(comment.getId(), topic);
		}

		forumId = ParseUtils.encodeForURI(forumId);

		return {
			path: '/discussions/' + forumId,
			isFull: true
		};
	}
});
