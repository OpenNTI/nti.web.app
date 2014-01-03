Ext.define('NextThought.view.profiles.Panel', {
	extend: 'NextThought.view.navigation.AbstractPanel',
	alias: 'widget.profile-panel',

	//<editor-fold desc="Config">
	requires: [
		'NextThought.view.profiles.About',
		'NextThought.view.profiles.outline.View',
		'NextThought.view.profiles.parts.Blog'
	],

	navigation: {xtype: 'profile-outline'},

	body: {
		layout: {
			type: 'card',
			deferredRender: true
		}
	},

	ui: 'profile',
	cls: 'profile-view',

	config: {
		stateData: null,
		user: null,
		username: ''
	},
	//</editor-fold>

	//<editor-fold desc="Init">

	constructor: function(config) {
		var me = this,
			u = config.user;

		if (!u) {
			Ext.Error.raise('No user provided');
		}

		me.applyConfigs('navigation', {user: u});
		me.applyConfigs('body', {
			items: [
				{ xtype: 'profile-activity', user: u, username: u.getId(),
					flatPageStore: NextThought.store.FlatPage.create(),
					xhooks: {
						initComponent: function() {
							//"this" being the profile-activity component, not "me" for all three of these "this"s
							this.callParent(arguments);
							this.fireEvent('add-flatpage-store-context', this);
						}
					},
					listeners: {
						afterrender: { fn: 'attachScrollRelay', scope: me, single: true }
					}
				},
				{ xtype: 'profile-about', user: u },
				{ xtype: 'profile-blog', user: u, username: u.getId() }
			]
		});

		me.callParent(arguments);

		function monitor(panel) {
			panel.relayEvents(me.navigation, ['name-clicked', 'enable-edit', 'disable-edit']);
			me.mon(panel, {
				beforeactivate: 'onBeforeViewChanged',
				activate: 'onViewChanged',
				destroy: 'removeNavigationItem'
			});
		}

		me.forEachView(monitor, me);
		me.mon(me.navigation, {
			'show-profile-view': 'changeView'
		});

		me.on('beforedeactivate', 'onBeforeDeactivate');
	},


	forEachView: function(fn, scope) {
		this.body.items.each(fn, scope || this);
	},


	attachScrollRelay: function(cmp) {
		this.relayEvents(cmp.getEl(), ['scroll'], 'profile-body-');
	},


	afterRender: function() {
		this.callParent(arguments);
		this.initState();
	},


	initState: function() {
		//drive initial state restore here
		this.restoreState(this.getStateData());
	},

	//</editor-fold>

	//<editor-fold desc="Simple Handlers">

	onBeforeDeactivate: function() {
		console.log('about to deactivate the profile view');
		return Ext.Array.every(this.body.items.items, function(item) {
			return item.fireEvent('beforedeactivate');
		});
	},


	onBeforeViewChanged: function() {
		console.debug('onBeforeViewChange');
	},


	onViewChanged: function(activeCmp) {
    //		console.debug('onViewChange', activeCmp.id);
		this.navigation.updateSelection(activeCmp);
	},


	removeNavigationItem: function(cmp) {
		this.navigation.removeNavigationItem(cmp.xtype);
	},


	//</editor-fold>

	//<editor-fold desc="Read & Write State">
	restoreState: function(state) {
		console.log(state);
		var me = this,
			p = state && state.activeTab && state.activeTab.split('/'),
			activeView = p && p.shift(),
			activeViewData = p && p.join('/');

		function compareUriName(i) {
			var uri = i.uriFriendlyName || '';
			if (!Ext.isArray(uri)) { uri = [uri]; }
			if (activeView && Ext.Array.contains(uri, activeView)) {
				activeView = i;
			}

			return Ext.isString(activeView);
		}

		me.setStateData(Ext.clone(state));

		me.forEachView(compareUriName);
		if (!activeView || Ext.isString(activeView)) {
			console.warn('Could not find view: ' + activeView);
			me.fireEvent('restored');
			return;
		}

		this.body.getLayout().setActiveItem(activeView);
		activeView.restore(activeViewData, function() {
			me.fireEvent('restored');
		});

	},


	//This is fired based on USER interaction.
	// Do not call this to restore the view programmatically. Just call setActiveItem, otherwise you will end up with
	// bad history.
	changeView: function(view, action, data) {
		console.debug('USER Changing Profile View:', view, 'action:', action, 'data:', data);

		var stateData = Ext.clone(this.getStateData()),
			url,
			u = this.user,
			c = this.down(view);

		if (!c) {
			console.error('No view selected from query: ' + view);
			return;
		}

		this.body.getLayout().setActiveItem(c);
		if (c.performAction) {
			c.performAction(action, data);
		} else if (action !== 'view') {
			console.warn(c.$className + ' does not implement performAction and was requested to ' + action + ' but it was dropped');
		}

		stateData.activeTab = c.getStateData();
		//set state
		url = u.getProfileUrl(
				Ext.isEmpty(stateData.activeTab)
						? null
						: stateData.activeTab.split('/'));

		console.debug('State Data: ', stateData, url);
		history.pushState({profile: Ext.clone(stateData)},this.ownerCt.title, url);
	}
	//</editor-fold>

});
