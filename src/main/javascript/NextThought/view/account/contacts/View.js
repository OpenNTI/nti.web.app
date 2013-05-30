Ext.define('NextThought.view.account.contacts.View',{
	extend: 'Ext.view.View',
	alias: 'widget.contacts-view',
	requires: [
	],

	title: 'Chat',
	tabConfig: {
		tooltip: 'Chat'
	},

	store: 'contacts-store',

	iconCls: 'contacts',
	ui: 'contacts',
	cls: 'contacts-view',
	preserveScrollOnRefresh: true,

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'contact-list'},
		{ cls: 'button-row', cn: [
			{cls: 'search', html: 'Search', cn:{tag:'input', type:'text'/*, placeholder:'Search'*/} },
			{cls: 'group-chat', html: 'Group Chat' }
		]
	}]),

	renderSelectors: {
		buttonRow: '.button-row',
		searchButton: '.button-row .search',
		searchField: '.button-row .search input',
		frameBodyEl: '.contact-list'
	},

	listeners: {
		itemclick: 'rowClicked'
	},

	getTargetEl: function(){
		return this.frameBodyEl;
	},

	overCls:'over',
	itemSelector:'.contact-row',
	tpl: Ext.DomHelper.markup({ tag: 'tpl', 'for':'.', cn: [
		{ cls: 'contact-row', cn: [
			{ cls: 'presence {Presence}' },
			{ cls: 'add' },
			{ cls: 'avatar', style: {backgroundImage: 'url({avatarURL})'} },
			{ cls: 'wrap', cn: [
				{ cls: 'name', html:'{displayName}' },
				{ cls: 'status', html:'{status}' }
			]}
		]}
	]}),


	constructor: function(){
		this.emptyText = Ext.DomHelper.markup({
			cls: 'populate-contacts',
			cn: ['no one here']
		});

		this.doSearch = Ext.Function.createBuffered(this.doSearch,250,this,null);
		return this.callParent(arguments);
	},


	initComponent: function(){
		this.callParent(arguments);
	},


	rowClicked: function(view,record,item){
		var add = Ext.fly(item).down('.add');
		NextThought.view.account.contacts.management.Popout.popup(record,add,item,[-10, -18]);
	},


	onSearchClick: function(e){
		this.buttonRow.addCls('search');
		this.searchField.focus();
	},


	onSearchBlur: function(e){
		this.removeCls('searching');
		this.buttonRow.removeCls('search');
	},


	onSearchKeyPressed: function(e){
		var v = this.searchField.getValue();

		if(e.ESC === e.getKey()){
			v = '';
			this.onSearchBlur(e);
		}

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
		this.callParent(arguments);
		this.searchStore = new NextThought.store.UserSearch({
			filters:[
				function(rec){ return !rec.isCommunity; },
				function(rec){ return !isMe(rec); }
			]
		});

		this.contactSearch = Ext.widget('dataview',{
			preserveScrollOnRefresh: true,
			store: this.searchStore,
			overCls: this.overCls,
			itemSelector: this.itemSelector,
			tpl: this.tpl,
			emptyText: 'Not Found',
			renderTo: this.el,
			cls: 'contact-search',
			listeners:{
				scope: this,
				itemclick: 'rowClicked'
			}
		});

		this.mon(this.searchButton,{
			scope: this,
			click: 'onSearchClick'
		});

		this.mon(this.searchField,{
			scope: this,
//			blur: 'onSearchBlur',
			keyup: 'onSearchKeyPressed',
			contextmenu: function(e){e.stopPropagation();} //allow context on simple texts
		});
	}
});
