Ext.define('NextThought.view.account.contacts.View',{
	extend: 'Ext.view.View',
	alias: 'widget.contacts-view',
	requires: [
	],

	title: 'Chat',
	tabConfig: {
		tooltip: 'Chat'
	},

	store: 'online-contacts-store',

	iconCls: 'contacts',
	ui: 'contacts',
	cls: 'contacts-view',
	preserveScrollOnRefresh: true,

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'contact-list'},
		{ cls: 'button-row', cn: [
			{cls: 'search', html: 'Search', cn:[
				{tag:'input', type:'text'/*, placeholder:'Search'*/},
				{cls:'clear', style: {display:'none'}}
			] },
			{cls: 'group-chat', html: 'Group Chat' }
		]
	}]),

	renderSelectors: {
		buttonRow: '.button-row',
		searchButton: '.button-row .search',
		groupChatButton: '.button-row .group-chat',
		clearNib: '.button-row .search .clear',
		searchField: '.button-row .search input',
		frameBodyEl: '.contact-list'
	},


	listeners: {
		itemclick: 'rowClicked',
		itemmouseenter: 'rowHover',
		select: function(s,record){ s.deselect(record); },
		'chat-dock-update-count': 'updateBadge'
	},


	getTargetEl: function(){
		return this.frameBodyEl;
	},

	overItemCls:'over',
	itemSelector:'.contact-row',
	tpl: new Ext.XTemplate(Ext.DomHelper.markup({ tag: 'tpl', 'for':'.', cn: [
		{ cls: 'contact-row {[this.isContact(values)]}', cn: [
			{ cls: 'presence {Presence}' },
			{ cls: 'nib' },
			{ cls: 'avatar', style: {backgroundImage: 'url({avatarURL})'} },
			{ cls: 'wrap', cn: [
				{ cls: 'name', html:'{displayName}' },
				{ cls: 'status', html:'{status}' }
			]}
		]}
	]}),{
		isContact: function(values){
			return (values.Class !=='User' || Ext.getStore('online-contacts-store').contains(values.Username)) ? 'contact':'not-contact';
		}
	}),


	constructor: function(){
		this.emptyText = Ext.DomHelper.markup({
			cls:'empty-list',
			html: 'None of your contacts are online.'
		});

		this.doSearch = Ext.Function.createBuffered(this.doSearch,250,this,null);
		return this.callParent(arguments);
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


	getBadge: function(){
		if(!this.badge){
			this.addBadge();
		}
		return this.badge;
	},


	updateBadge: function(count){
		var b = this.getBadge(),
			v = count || '';

		if(!b){
			this.tab.badge = v;
		}
		else {
			b.update(v);
		}
	},


	rowClicked: function(view,record,item){
		var el = Ext.fly(item).down('.avatar');
		//NextThought.view.account.contacts.management.Popout.popup(record,el,item,[-1, 0]);
		this.cancelPopupTimeout();
		this.fireEvent('chat', record);
		this.startPopupTimeout(view,record,item,2000);
	},


	rowHover: function(view, record, item, wait){
		this.startPopupTimeout(view, record, item, 500);
	},


	startPopupTimeout: function(view, record, item, wait){
		function fin(pop){
			// If the popout is destroyed, clear the activeTargetDom,
			// that way we will be able to show the popout again.
			if(!pop){ return; }
			pop.on('destroy', function(){
				delete me.activeTargetDom;
			});
		}

		var popout = NextThought.view.account.contacts.management.Popout,
			el = Ext.fly(item).down('.avatar'), me = this;

		if(!record || me.activeTargetDom === Ext.getDom(Ext.fly(item))){return;}

		console.log(wait);

		me.cancelPopupTimeout();
		me.hoverTimeout = Ext.defer(function(){
			Ext.fly(item).un('mouseout',me.cancelPopupTimeout,me,{single:true});
			popout.popup(record,el,item,[-1, 0], fin);
			me.activeTargetDom = Ext.getDom(Ext.fly(item));
		}, wait);

		Ext.fly(item).on('mouseout',me.cancelPopupTimeout,me,{single:true});
	},


	cancelPopupTimeout: function(){
		clearTimeout(this.hoverTimeout);
	},


	onSearchClick: function(){
		this.buttonRow.addCls('search');
		this.searchField.focus();
	},


	onSearchBlur: function(){
		var v = this.searchField.getValue();
		if(Ext.isEmpty(v)){
			this.removeCls('searching');
			this.buttonRow.removeCls('search');
			this.clearNib.hide();
		}
	},


	clearClicked: function(e){
		if(e){e.stopEvent();}

		this.searchField.dom.value = '';
		this.onSearchBlur();

		return false;
	},


	onSearchKeyPressed: function(e){
		if(e.ESC === e.getKey()){
			this.clearClicked();
		}

		var v = this.searchField.getValue();
		this.clearNib[Ext.isEmpty(v)?'hide':'show']();

		if( this.lastSearchValue !== v ){
			this.lastSearchValue = v;
			this.doSearch(v);
		}
	},


	doSearch: function(v){
		var fn = 'removeAll',
			action = 'removeCls',
			param = false;

		if(!Ext.isEmpty(v)){
			action = 'addCls';
			fn = 'search';
			param = v;
		}

		this[action]('searching');
		this.searchStore[fn](param);
	},


	afterRender: function(){
		var store = this.store;
		this.callParent(arguments);
		this.searchStore = new NextThought.store.UserSearch({
			filters:[
				//filter out communities, lists, groups and yourself. Just return users.
				function(rec){ return rec.getId() !== $AppConfig.contactsGroupName; },
				function(rec){ return !rec.isCommunity; },
				function(rec){ return !isMe(rec); },
				function(rec){ return rec.get('ContainerId') === 'Users'; }
			],
			sorters:[{
				//Put contacts first
				sorterFn: function(a,b){
					var c = store.contains(a.get('Username')),
						d = store.contains(b.get('Username'));
					return c === d
							? 0
							: c ? -1 : 1;
				},
				direction: 'ASC'
			},{
				//Sort, next, by displayName
				property: 'displayName',
				direction: 'ASC'
			}]
		});

		this.clearNib.setVisibilityMode(Ext.Element.DISPLAY);
		this.mon(this.clearNib,'click','clearClicked',this);

		this.contactSearch = Ext.widget('dataview',{
			preserveScrollOnRefresh: true,
			store: this.searchStore,
			overItemCls: this.overCls,
			itemSelector: this.itemSelector,
			tpl: this.tpl,
			emptyText: Ext.DomHelper.markup({cls: 'empty-list', html: 'No users found.'}),
			renderTo: this.el,
			cls: 'contact-search',
			listeners:{
				scope: this,
				itemclick: 'rowClicked',
				itemmouseenter: 'rowHover',
				select: function(s,record){ s.deselect(record); }
			}
		});

		this.mon(this.store,{
			scope: this.contactSearch,
			datachanged: 'refresh'
		});

		this.mon(this.searchButton,{
			scope: this,
			click: 'onSearchClick'
		});

		this.mon(this.searchField,{
			scope: this,
			blur: 'onSearchBlur',
			keyup: 'onSearchKeyPressed',
			contextmenu: function(e){e.stopPropagation();} //allow context on simple texts
		});

		if(this.groupChatButton){
			this.groupChatButton.setVisibilityMode(Ext.Element.DISPLAY).hide();
		}
		this.searchButton.addCls('no-group-chat');
	}
});
