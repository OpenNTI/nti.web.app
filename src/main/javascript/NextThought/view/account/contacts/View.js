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


	getTargetEl: function(){
		return this.frameBodyEl;
	},

	overCls:'over',
	itemSelector:'.contact-row',
	tpl: Ext.DomHelper.markup({ tag: 'tpl', 'for':'.', cn: [
		{ cls: 'contact-row', cn: [
			{ cls: 'presence {Presence}' },
			{ cls: 'avatar', style: {backgroundImage: 'url({avatarURL})'} },
			{ cls: 'wrap', cn: [
				{ cls: 'name', html:'{displayName}' },
				{ cls: 'status', html:'{status}' }
			]}
		]}
	]}),


	constructor: function(){
		var cls = '', message = 'Create a group or join a group.';
		if(!$AppConfig.service.canCreateDynamicGroups()){
			cls = 'left';
			message = 'If you have a Group Code, enter it below to join a group.';
		}

		this.emptyText = Ext.DomHelper.markup({
			cls: "populate-contacts "+cls,
			cn: [{
					cls: 'title',
					html: 'Welcome to NextThought!'
			},{
				html:'Search for friends to add to your contact list.'
			},{
				cls: 'group-button-label',
				html: message
			}]
		});

		this.doSearch = Ext.Function.createBuffered(this.doSearch,250,this,null);
		return this.callParent(arguments);
	},


	initComponent: function(){
		this.callParent(arguments);
	},


	onSearchClick: function(e){
		this.buttonRow.addCls('search');
		this.searchField.focus();
	},


	onSearchBlur: function(e){
		this.removeCls('searching');
		this.buttonRow.removeCls('search');
	},


	onSearchKeyPressed: function(){
		var v = this.searchField.getValue();

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
		this.searchStore = new NextThought.store.UserSearch();

		this.contactSearch = Ext.widget('dataview',{
			preserveScrollOnRefresh: true,
			store: this.searchStore,
			overCls: this.overCls,
			itemSelector: this.itemSelector,
			tpl: this.tpl,
			emptyText: 'Not Found',
			renderTo: this.el,
			cls: 'contact-search'
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

	}
});
