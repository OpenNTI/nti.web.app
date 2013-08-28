Ext.define('NextThought.view.contacts.View', {
	extend: 'NextThought.view.Base',
	alias: 'widget.contacts-view-container',
	requires: [
		'NextThought.view.BoundPanel',
		'NextThought.view.contacts.Grouping',
		'NextThought.view.contacts.TabPanel',
		'NextThought.view.contacts.GroupButtons',
		'NextThought.view.contacts.ListButtons'
	],

	cls: 'contacts-view',
	title: 'NextThought: Contacts',


	items: [
		{xtype: 'data-bound-panel', title: 'Contacts', defaultType: 'contacts-tabs-card', storeId: 'all-contacts-store',
			emptyCmp: {
				xtype: 'component',
				emptyState: true,
				renderTpl: Ext.DomHelper.markup([
					{ cls: 'contacts-empty-state', cn: [
						{cls: 'header', html: '{{{no_contact_header}}}'},
						{cls: 'sub', html: '{{{no_contact_sub}}}'}
					]}
				])
			}
		},
		{xtype: 'data-bound-panel', title: 'Distribution Lists', defaultType: 'contacts-tabs-grouping', storeId: 'FriendsList',
			filter: function (group) {
				return !group.isDFL;
			},
			defaultInsertPoint: 1,
			items: [
				{xtype: 'list-buttons'}
			],
			emptyCmp: {
				xtype: 'component',
				emptyState: true,
				renderTpl: Ext.DomHelper.markup([
					{ cls: 'contacts-empty-state', cn: [
						{cls: 'header', html: '{{{no_list_header}}}'},
						{cls: 'sub', html: '{{{no_list_sub}}}'}
					]}
				])
			}
		},
		{xtype: 'data-bound-panel', title: 'Groups', defaultType: 'contacts-tabs-grouping', storeId: 'FriendsList',
			filter: function (group) {
				return group.isDFL;
			},
			defaultInsertPoint: 1,
			items: [
				{xtype: 'group-buttons'}
			],
			emptyCmp: {
				xtype: 'component',
				emptyState: true,
				renderTpl: Ext.DomHelper.markup([
					{ cls: 'contacts-empty-state', cn: [
						{cls: 'header', html: '{{{no_group_header}}}'},
						{cls: 'sub', html: '{{{no_group_sub}}}'}
					]}
				])
			}
		}
	],



	layout: {
		type: 'card',
		deferredRender: true
	},

	defaultType: 'box',
	activeItem: 0,



	tabSpecs: [
		{label: 'Contacts', viewId: ''},
		{label: 'Groups', viewId: ''},
		{label: 'Distribution Lists', viewId: ''}
	],


	updateActiveState: function(type,ntiid){
		var state = {};
		state['current_'+type] = ntiid;
		this.pushState(state);
	},


	onTabClicked: function(tabSpec){
		var active = this.layout.getActiveItem(),
			targetView = /^([^\?]+)(\?)?$/.exec(tabSpec.viewId) || [tabSpec.viewId],
			vId = targetView[1],
			needsChanging = vId!==active.id,
			//only reset the view if we are already there and the spec flagged that it can be reset.
			reset = !!targetView[2] && !needsChanging;

		if(Ext.isEmpty(vId)){
			return false;
		}

		if(needsChanging){
			this.setActiveTab(vId);
			this.pushState({activeTab: vId});
		} else if(reset) {
			console.log('ignore reset');
		}

		return true;
	},

//	pushState: function(s){
//		history.pushState({content: s}, this.title, this.getFragment());
//	},


	getTabs: function(){
		var tabs = this.tabSpecs,
			active = this.layout.getActiveItem(),
			activeId = active && active.id;

		Ext.each(tabs,function(t){
			t.selected = (t.viewId.replace(/\?$/,'')===activeId);
		});

		return this.tabs? tabs : [];
	},


	setActiveTab: function(tab){
		if(this.rendered) {
			this.layout.setActiveItem(tab||'course-book');
			this.setTitle(this.getTitlePrefix()+this.locationTitle);
		} else {
			this.on('afterrender', function(){
				this.layout.setActiveItem(tab);
			}, this);
		}
	},


	initComponent: function () {
		var me = this;

		me.callParent(arguments);
//		me.tabs = me.down('contacts-tabs');
//		me.mon(me.tabs, 'tabchange', me.monitorTabs, me);
//		me.on('resize', function () {
//			me.tabs.setHeight(me.getHeight());
//		});

		this.removeCls('make-white');




		//		this.on({
		//			'beforeactivate':'onBeforeActivation',
		//            'beforedeactivate': 'onBeforeDeActivation',
		//			'deactivate':'onDeactivated',
		//			'activate': 'onActivated'
		//		});
	},


	afterRender: function () {
		this.callParent(arguments);
		if (Ext.is.iPad) {
			// Absorb event for scrolling
			this.getEl().dom.addEventListener('touchmove', function (e) {
				e.stopPropagation();
			});
		}
	},


	monitorTabs: function (panel, newTab, oldTab) {
		if (this.restoring) {
			return;
		}
		var state = {};
		state[this.getId()] = {source: newTab.source};
		history.pushState(state, this.title, location.toString());
	},


	restore: function (state) {
		this.fireEvent('finished-restore');

//		var myState = state[this.getId()], tab;
//		if (myState && myState.source) {
//			tab = this.down('[source="' + myState.source + '"]');
//			this.restoring = true;
//			this.tabs.setActiveTab(tab);
//			delete this.restoring;
//			this.updateLayout();
//		}
	}
});

