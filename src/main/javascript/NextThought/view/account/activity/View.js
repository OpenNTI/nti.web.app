//Styles defined in _history-view.scss
Ext.define('NextThought.view.account.activity.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.activity-view',
	requires: [
		'NextThought.view.account.activity.Panel',
		'NextThought.view.account.history.View'
	],

	stateful: true,
	stateId: 'rhp-state',

	iconCls: 'activity',
	title: 'Activity',
	tabConfig: {
		tooltip: 'Recent Activity'
	},

	ui: 'activity',
	cls: 'activity-view',
	plain: true,


	mimeTypesMap: {
		'all': ['all'],
		'discussions': [
			'forums.personalblogcomment',
			'forums.personalblogentrypost',
			'forums.communityheadlinepost',
			'forums.generalforumcomment',
			'forums.communityheadlinetopic'
		],
		'notes': ['highlight', 'note'],
		'contact': ['user']
	},

	filtersMap: {
		'bookmarks': 'Bookmarks',
		'inCommunity': 'inCommunity',
		'IFollow': 'IFollow'
	},

	filtersTpl: Ext.DomHelper.createTemplate(
		{ cls: 'filters-container', cn: [
			{cls: 'activity-filters', cn: [
				{cls: 'tabs', cn: [
					{cls: 'tab from x-menu', html: 'Only Me'},
					{cls: 'tab types x-menu'}
				]}
			]}
		]}
	),

	typesFilterArray: [
		{contacts: true, community: true, text: 'Discussions & Thoughts', filter: 'discussions', type: 'discusssions'},
		{me: true, text: 'Highlights & Notes', filter: 'notes', type: 'menotes'},
		{contacts: true, community: true, text: 'Notes', filter: 'notes', type: 'communitynotes' },
		{me: true, text: 'Bookmarks', filter: 'bookmarks', type: 'bookmarks'},
		{contacts: true, community: true, text: 'Contact Requests', filter: 'contact', type: 'contactrequests', hideIfCoppa: true }
	],

	layout: {
		type: 'card',
		deferredRender: true
	},
	id: 'activity-tab-view',
	activeItem: 0,
	items: [
		{xtype: 'user-history-panel', stateId: 'rhp-activity-history'},
		{xtype: 'activity-panel', filter: 'inCommunity', stateId: 'rhp-activity-community', autoRefresh: true},
		{xtype: 'activity-panel', filter: 'IFollow', stateId: 'rhp-activity-contacts'}
	],


	maxRefreshInterval: 60 * 60 * 1000, //The time we wait between refreshes.  60 minutes
	initialRefreshInterval: 5 * 60 * 1000, //The initial refresh time interval.  5 minutes
	currentRefreshInterval: 0, //The current refresh interval.
	adjustmentFactor: 1.5,
	refreshing: false,


	initComponent: function() {
		this.callParent(arguments);
		var i,
			history = this.down('user-history-panel'),
			contacts = this.down('activity-panel[filter=IFollow]'),
			community = this.down('activity-panel[filter=inCommunity]');

		this.store = Ext.getStore('Stream');
		this.mon(this.store, {
			add: this.updateNotificationCountFromStore
		});

		this.fromMenu = Ext.widget('menu', {
			ui: 'nt',
			plain: true,
			showSeparator: false,
			shadow: false,
			frame: false,
			border: false,
			hideMode: 'display',
			title: 'Show Activity From',
			cls: 'menu from-menu',
			width: 258,
			defaults: {
				ui: 'nt-menuitem',
				xtype: 'menucheckitem',
				group: 'from',
				plain: true,
				listeners: {
					scope: this,
					'checkchange': 'switchPanel'
				}
			},
			items: [
				{cls: 'option', text: 'Only Me', type: 'onlyme', checked: false, isMe: true, tabFilter: 'onlyMe'},
				{cls: 'option', text: 'My Contacts', type: 'contacts', checked: false, isContacts: true, tabFilter: 'IFollow'},
				{cls: 'option', text: 'Everyone', type: 'community', checked: false, isCommunity: true, tabFilter: 'inCommunity'}
			]
		});

		Ext.each(this.typesFilterArray, function(item) {
			if (!Service.canFriend() && item.hideIfCoppa) {
				return;
			}
			if (item.me) {
				history.addFilterItem(item.text, item.filter, item.type);
			}

			if (item.contacts) {
				contacts.addFilterItem(item.text, item.filter, item.type);
			}

			if (item.community) {
				community.addFilterItem(item.text, item.filter, item.type);
			}
		}, this);

		this.filters = ['all'];
		this.monitoredInstance = $AppConfig.userObject;
		this.mon($AppConfig.userObject, 'changed', this.updateNotificationCount, this);
	},


	afterRender: function() {
		this.callParent(arguments);
		var filterEl = this.filtersTpl.append(this.el, null, true);

		//this.switchPanel('history');
		this.mon(filterEl, {
			scope: this,
			'click': 'handleClick'
		});

		this.mon(this, {
			scope: this,
			'deactivate': 'resetNotificationCount'
		});

		this.mon(this.fromMenu, {
			scope: this,
			'show': function() {
				this.el.down('.filters-container .tabs .from').addCls('selected');
			},
			'hide': function() {
				filterEl.down('.tabs .from').removeCls('selected');
			},
			'mouseenter': function() {
				clearTimeout(this.fromHideTimeout);
			},
			'mouseleave': function() {
				this.fromHideTimeout = Ext.defer(function() {
						this.fromMenu.hide();
					}, 500, this);
			}
		});


		this.el.on('mouseleave', function() {
			if (this.fromMenu.isVisible()) {
				this.fromHideTimeout = Ext.defer(function() {
					this.fromMenu.hide();
				}, 500, this);
			}
		}, this);

		this.fromMenu.show().hide();

		if (!this.stateApplied) {
			this.applyState({from: 'community', filter: ['Show All']});
		}

		if (!Service.canFriend()) {
			this.fromMenu.down('menuitem[isContacts]').destroy();
		}
	},

	applyState: function(state) {
		var me = this;
		if (state.from) {
			Ext.each(this.fromMenu.query('menuitem'), function(item) {
				var checked = item.type === state.from;

				if (me.rendered) {
					item.setChecked(checked);
				}else {
					me.on('afterrender', function() {
						item.setChecked(checked);
					}, me);
				}
			});
			this.stateApplied = true;
		}
	},

	getState: function() {
		var fromMenuItem = this.fromMenu.down('menuitem[checked]'),
			from = fromMenuItem && fromMenuItem.type;

		return from && {from: from};
	},


	maybeStartRefreshing: function(p) {
		//So some panels we like to refresh all the time
		//if this is one of them, do an initial refresh and
		//then start polling.  This is disgusting by the way
		//its unnecessary load, but whatever
		if (p.autoRefresh !== true) {
			//Ok we aren't suppossed to be autorefreshing now.
			//so stop doing that if we currently are
			this.stopAutoRefresh(p);
		}
		else {
			this.startAutoRefresh(p);
		}
	},


	stopAutoRefresh: function(p) {
		if (this.autoRefreshTimer) {
			console.log('Stopping refresh cycle');
			clearTimeout(this.autoRefreshTimer);
			delete this.autoRefreshTimer;
		}
		this.refreshing = false;
	},


	startAutoRefresh: function(p) {
		if (this.autoRefreshTimer) {
			return;
		}

		console.log('Starting autorefresh cycle');
		this.refreshing = true;
		this.currentRefreshInterval = this.initialRefreshInterval;
		this.refreshData(p);
	},


	refreshData: function(p) {
		var me = this;
		if (Ext.isFunction(p.forceRefresh)) {
			if (p.store.isLoading()) {
				p.store.on('load', function() {
					me.scheduleNextRefresh(p);
				}, null, {single: true});
			}
			else {
				console.log('Refreshing data for panel p');
				p.forceRefresh(function(records, ops, success) {
					if (success) {
						me.scheduleNextRefresh(p);
					}
				});
			}

		}
	},


	scheduleNextRefresh: function(p) {
		var me = this;
		me.currentRefreshInterval = me.currentRefreshInterval * me.adjustmentFactor;
		if (me.currentRefreshInterval > me.maxRefreshInterval) {
			me.currentRefreshInterval = me.maxRefreshInterval;
		}
		console.log('Scheduling next refresh for ', p, ' seconds=', me.currentRefreshInterval / 1000);
		me.autoRefreshTimer = setTimeout(function() {
			me.refreshData(p);
		}, me.currentRefreshInterval);
	},


	switchPanel: function(item) {
		var newPanel = this.getActivePanel(),
			newTab = this.fromMenu.down('menuitem[checked]'),
			tab = this.el.down('.filters-container .tabs .from');

		tab.update(newTab.text || item.text);
		this.getLayout().setActiveItem(newPanel);

		this.saveState();

		this.maybeStartRefreshing(newPanel);
	},

	getActivePanel: function() {
		var selectedTab = this.fromMenu.down('menuitem[checked]'),
			v = selectedTab && selectedTab.tabFilter;

		if (v === 'IFollow') {
			return this.down('activity-panel[filter=IFollow]');
		}

		if (v === 'inCommunity') {
			return this.down('activity-panel[filter=inCommunity]');
		}

		return this.down('user-history-panel');
	},

	handleClick: function(e) {
		if (e.getTarget('.from')) {
			this.showFromMenu();
		}

		if (e.getTarget('.types')) {
			this.showTypesMenu();
		}
	},

	showFromMenu: function() {
	   if (this.fromMenu.isVisible()) {
			this.fromMenu.hide();
			return;
	   }

		//this.el.down('.filters-container .activity-filters .tabs .from').addCls('selected');
		this.fromMenu.showBy(this.el.down('.filters-container'), 'bl-tl', [0, 0]);
	},

	showTypesMenu: function() {
		var active = this.getActivePanel(),
			menu = active.getTypesMenu();

		if (menu.isVisible()) {
			menu.hide();
			return;
		}

		Ext.destroy(this.menuMonitor);

		this.menuMonitor = this.mon(menu, {
			scope: this,
			'show': function() {
				this.el.down('.filters-container .activity-filters .tabs .types').addCls('selected');
			},
			'hide': function() {
				this.el.down('.filters-container .activity-filters .tabs .types').removeCls('selected');
			},
			'mouseenter': function() {
				clearTimeout(this.typesHideTimeout);
			},
			'mouseleave': function() {
				this.typesHideTimeout = Ext.defer(function() {
						menu.hide();
					}, 500, this);
			}
		});

		menu.showBy(this.el.down('.filters-container'), 'bl-tl', [0, 0]);
	},

	updateNotificationCountFromStore: function(store, records) {
		var u = $AppConfig.userObject,
			newCount = 0,
			c = (u.get('NotificationCount') || 0);


		Ext.each(records, function(record) {
			if (!/deleted/i.test(record.get('ChangeType'))) {
				newCount++;
			}
		});

		c += newCount;

		//Update current notification of the userobject.
		u.set('NotificationCount', c);
		u.fireEvent('changed', u);
	},


	onAdded: function() {
		this.callParent(arguments);
		//sigh
		Ext.defer(function() {
			this.setNotificationCountValue(
				this.monitoredInstance.get('NotificationCount'));
		}, 1, this);
	},


	updateNotificationCount: function(u) {
		if (u !== this.monitoredInstance && u === $AppConfig.userObject) {
			this.mun(this.monitoredInstance, 'changed', this.updateNotificationCount, this);
			this.monitoredInstance = u;
			this.mon(this.monitoredInstance, 'changed', this.updateNotificationCount, this);
		}
		this.setNotificationCountValue(u.get('NotificationCount'));
	},


	resetNotificationCount: function() {
		try {
			$AppConfig.userObject.saveField('NotificationCount', 0);
		}
		catch (e) {
			console.warn('Problem saving NotificationCount on active user account', $AppConfig.userObject);
		}
		this.setNotificationCountValue(0);
	},


	addBadge: function() {
		var tab = this.tab;

		if (!tab.rendered) {
			if (!tab.isListening('afterrender', this.addBadge, this)) {
				tab.on('afterrender', this.addBadge, this);
			}
			return;
		}
		this.badge = Ext.DomHelper.append(tab.getEl(), {cls: 'badge', html: tab.badge},true);
		delete tab.badge;
	},


	setNotificationCountValue: function(count) {
		var v = count || '&nbsp;',
			tab = this.tab;

		if (!this.badge) {
			tab.badge = v;
			this.addBadge();
			return;
		}

		this.badge.update(v);
	}
});
