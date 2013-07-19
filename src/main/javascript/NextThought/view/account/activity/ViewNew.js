//Styles defined in _history-view.scss
//TODO: Once we permanently enable this view, rename to View.js
Ext.define('NextThought.view.account.activity.ViewNew',{
	extend: 'Ext.container.Container',
	alias: 'widget.activity-view-new',
	requires: [
		'NextThought.view.account.activity.Panel',
		'NextThought.view.account.history.View'
	],

	stateful: true,
	stateId: 'rhp-state',

	iconCls: 'activity',
	title: 'Activity',
	tabConfig:{
		tooltip: 'Recent Activity'
	},

	ui: 'activity',
	cls: 'activity-view',
	plain: true,


	mimeTypesMap: {
		'all': ['all'],
		'discussions': ['forums.personalblogcomment', 'forums.personalblogentrypost','forums.communityheadlinepost', 'forums.generalforumcomment','forums.communityheadlinetopic'],
		'notes': ['highlight', 'note'],
		'contact': ['user']
	},

	filtersMap: {
		'bookmarks': 'Bookmarks',
		'inCommunity': 'inCommunity',
		'notInCommunity': 'notInCommunity'
	},

	filtersTpl: Ext.DomHelper.createTemplate(
		{ cls: 'filters-container', cn:{
			cls: 'activity-filters', cn: [
				{cls: 'tabs', cn:[
					{cls: 'tab from x-menu', html: 'Only Me'},
					{cls: 'tab types x-menu'}
				]}
			]}
		}
	),


	layout: {
		type:'card',
		deferredRender: true
	},
	id: 'activity-tab-view',
	activeItem: 0,
	items: [
		{xtype: 'user-history-panel'},
		{xtype: 'activity-panel'}
	],


	initComponent: function(){
		var i;

		this.callParent(arguments);
		this.store = Ext.getStore('Stream');
		this.mon(this.store,{
			add: this.updateNotificationCountFromStore
		});

		this.fromMenu = Ext.widget('menu',{
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
				{cls: 'option', text: 'Only Me', checked: false, isMe: true, tabFilter:'onlyMe'},
				{cls: 'option', text: 'My Contacts', checked:false, isContacts: true, tabFilter: 'notInCommunity'},
				{cls: 'option', text: 'Community', checked: false, isCommunity: true, tabFilter: 'inCommunity'}
			]
		});

		this.typesMenu = Ext.widget('menu',{
			ui: 'nt',
			plain: true,
			showSeparator: false,
			shadow: false,
			frame: false,
			border: false,
			hideMode: 'display',
			title: 'Activity Type',
			cls: 'menu types-menu',
			width: 258,
			defaults: {
				ui: 'nt-menuitem',
				xtype: 'menucheckitem',
				plain: true,
				listeners:{
					scope: this,
					'beforecheckchange':function(item, checked){ return checked || item.allowUncheck!==false; },
					'checkchange': 'changeFilter'
				}
			},
			items: [
				{cls: 'option', me: true, contacts: true, community: true, text: 'Show All', checked: true, allowUncheck: false, isAll: true, filter: 'all'},
				{cls: 'option discussions', contacts: true, text: 'Discussions & Thoughts', filter: 'discussions'},
				{cls: 'option', me: true, text: 'Highlights & Notes', filter: 'notes'},
				{cls: 'option', contacts: true, community: true, text: 'Notes', filter: 'notes'},
				{cls: 'option bookmarks', me: true, text: 'Bookmarks', filter: 'bookmarks'},
				//{cls: 'option', text: 'Likes', filter: 'likes'},
				{cls: 'option contact', contacts: true, community: true, text: 'Contact Requests', filter: 'contact'}
			]
		});

		this.filters = ['all'];
		this.monitoredInstance = $AppConfig.userObject;
		this.mon($AppConfig.userObject, 'changed', this.updateNotificationCount, this);
		//this.setActiveItem
	},


	afterRender: function(){
		this.callParent(arguments);

		this.mon(this, {
			scope: this,
			'deactivate': 'resetNotificationCount'
		});

		var filterEl = this.filtersTpl.append(this.el,null,true);

		//this.switchPanel('history');
		this.mon(filterEl,{
			scope: this,
			'click': 'handleClick'
		});

		this.mon(this.fromMenu, {
			scope: this,
			'show': function(){
				this.el.down('.filters-container .activity-filters .tabs .from').addCls('selected');
			},
			'hide': function(){
				filterEl.down('.activity-filters .tabs .from').removeCls('selected');
			},
			'mouseenter': function(){
				clearTimeout(this.fromHideTimeout);
			},
			'mouseleave': function(){
				this.fromHideTimeout = Ext.defer(function(){
						this.fromMenu.hide();
					}, 500, this);
			}
		});

		this.mon(this.typesMenu, {
			scope: this,
			'show': function(){
				this.el.down('.filters-container .activity-filters .tabs .types').addCls('selected');
			},
			'hide': function(){
				filterEl.down('.activity-filters .tabs .types').removeCls('selected');
			},
			'mouseenter': function(){
				clearTimeout(this.typesHideTimeout);
			},
			'mouseleave': function(){
				this.typesHideTimeout = Ext.defer(function(){
						this.typesMenu.hide();
					}, 500, this);
			}
		});

		this.applyFilters();

		this.fromMenu.show().hide();
		this.typesMenu.show().hide();

		if(!this.stateApplied){
			this.applyState({from: 'Community', filter: ['Show All']});
		}

		if(!$AppConfig.service.canFriend()){
			this.fromMenu.down('menuitem[text=My Contacts]').destroy();
		}
	},

	applyState: function(state){
		var me = this,
			fromItems = this.fromMenu.query('menuitem'),
			filterItems = this.typesMenu.query('menuitem');
		if(state.from){
			Ext.each(fromItems, function(item){
				var checked = item.text === state.from;
				if(me.rendered){
					item.setChecked(checked);
				}else{
					me.on('afterrender', function(){
						item.setChecked(checked);
					}, this, {single: true});
				}
			});
		}

		if(state.filter){
			Ext.each(filterItems, function(item){
				var checked = Ext.Array.contains(state.filter, item.text);
				
				if(me.rendered){
					item.setChecked(checked);
				}else{
					me.on('afterrender', function(){
						item.setChecked(checked);
					});
				}
			});
		}

		this.stateApplied = true;
	},

	getState: function(){
		var fromMenuItem = this.fromMenu.down('menuitem[checked]'),
			filterMenuItems = this.typesMenu.query('menuitem[checked]'),
			from = fromMenuItem.text, filter = [];

		Ext.each(filterMenuItems, function(item){
			filter.push(item.text);
		});

		return {from: from, filter: filter};
	},

	switchPanel: function(item){
		var newPanel = this.getActivePanel(),
			allItems = this.typesMenu.query('menuitem'),
			newTab = this.fromMenu.down('menuitem[checked]'),
			tab = this.el.down('.filters-container .activity-filters .tabs .from');

		tab.update(newTab.text || item.text);
		this.getLayout().setActiveItem(newPanel);

		Ext.each(allItems, function(item){
			if(newTab.isMe){
				item[item.me? 'show': 'hide']();
			}else if(newTab.isContacts){
				item[item.contacts? 'show': 'hide']();
			}else if(newTab.isCommunity){
				item[item.community? 'show': 'hide']();
			}
		});

		
		if(newTab.isContacts){
			this.applyFilters('notInCommunity');
			newPanel.filter = 'notInCommunity';
		}else if(newTab.isCommunity){
			this.applyFilters('inCommunity');
			newPanel.filter = 'inCommunity';
		}

		this.saveState();
	},

	getActivePanel: function(){
		var selectedTab = this.fromMenu.down('menuitem[checked]'),
			v = selectedTab && selectedTab.tabFilter;

		if(v === 'notInCommunity' || v === 'inCommunity'){
			return this.down('activity-panel');
		}
		return this.down('user-history-panel');
	},

	changeFilter: function(item){
		var allChecked = true, allUnchecked = true,
			allItems = this.typesMenu.query('menuitem');

		function uncheck(items){
			Ext.Array.each(items, function(i){
				if(!i.isAll){
					i.setChecked(false, true);
				}
			});
		}

		if(item.checked){
			if(item.isAll){
				uncheck(allItems);
			}else{
				this.typesMenu.query('[isAll]')[0].setChecked(false, true);
			}
		}else{
			Ext.Array.each(allItems, function(i){
				allUnchecked = allUnchecked && !i.checked;
			});

			if(allUnchecked){
				item.setChecked(true,true);
			}
		}

		if(this.typesMenu.query('menuitem[checked]').length === 0){
			this.typesMenu.query('[isAll]')[0].setChecked(true, true);
		}

		this.applyFilters();
		this.saveState();
	},

	applyFilters: function(filter){
		var menu = this.typesMenu,
			allItems = menu.query('menuitem'),
			everything = menu.down('[isAll]').checked, me = this,
			activePanel = this.getActivePanel(),
			mimeTypes = [],
			filterTypes = filter? [filter] : [];

			Ext.each(allItems, function(item){
				var mt = this.mimeTypesMap[item.filter],
					ft = this.filtersMap[item.filter];

				if ((everything || item.checked)) {
					if(mt){
						Ext.Array.each(Ext.Array.from(mt), function(m){
							mimeTypes.push('application/vnd.nextthought.'+m);
						}, this);
					}

					if(ft){
						filterTypes.push(ft);
					}

					if((item.filter === 'all' || item.filter === 'notes') && activePanel.$className === "NextThought.view.account.history.Panel"){
						Ext.Array.include(filterTypes,'onlyMe');
					}
				}
			}, this);

		if(activePanel && activePanel.applyFilters){
		   activePanel.applyFilters(mimeTypes, filterTypes);
		}
	},

	handleClick: function(e){
		if(e.getTarget('.from')){
			this.showFromMenu();
		}

		if(e.getTarget('.types')){
			this.showTypesMenu();
		}
	},

	showTypesMenu: function(){
		if(this.typesMenu.isVisible()){
			this.typesMenu.hide();
			return;
		}

		
		//this.el.down('.filters-container .activity-filters .tabs .types').addCls('selected');
		this.typesMenu.showBy(this.el.down('.filters-container'), 'bl-tl', [0, 0]);
	},

	showFromMenu: function(){
	   if(this.fromMenu.isVisible()){
			this.fromMenu.hide();
			return;
	   }

		//this.el.down('.filters-container .activity-filters .tabs .from').addCls('selected');
		this.fromMenu.showBy(this.el.down('.filters-container'), 'bl-tl', [0, 0]);
	},

	updateNotificationCountFromStore: function(store, records){
		var u = $AppConfig.userObject,
			newCount = 0,
			c = (u.get('NotificationCount') || 0);


		Ext.each(records, function(record){
			if(!/deleted/i.test(record.get('ChangeType'))){
				newCount++;
			}
		});

		c += newCount;

		//Update current notification of the userobject.
		u.set('NotificationCount', c);
		u.fireEvent('changed',u);
	},


	onAdded: function(){
		this.callParent(arguments);
		//sigh
		Ext.defer(function(){
			this.setNotificationCountValue(
				this.monitoredInstance.get('NotificationCount'));
		}, 1, this);
	},


	updateNotificationCount: function(u) {
		if(u !== this.monitoredInstance && u === $AppConfig.userObject){
			this.mun(this.monitoredInstance,'changed', this.updateNotificationCount,this);
			this.monitoredInstance = u;
			this.mon(this.monitoredInstance,'changed', this.updateNotificationCount,this);
		}
		this.setNotificationCountValue(u.get('NotificationCount'));
	},


	resetNotificationCount: function(){
		try {
			$AppConfig.userObject.saveField('NotificationCount', 0);
		}
		catch(e){
			console.warn('Problem saving NotificationCount on active user account', $AppConfig.userObject);
		}
		this.setNotificationCountValue(0);
	},


	addBadge: function(){
		var tab = this.tab;

		if(!tab.rendered){
			if(!tab.isListening('afterrender',this.addBadge,this)){
				tab.on('afterrender',this.addBadge,this);
			}
			return;
		}
		this.badge = Ext.DomHelper.append( tab.getEl(),{cls:'badge', html:tab.badge},true);
		delete tab.badge;
	},


	setNotificationCountValue: function(count){
		var v = count || '&nbsp;',
			tab = this.tab;

		if(!this.badge){
			tab.badge = v;
			this.addBadge();
			return;
		}

		this.badge.update(v);
	}
});
