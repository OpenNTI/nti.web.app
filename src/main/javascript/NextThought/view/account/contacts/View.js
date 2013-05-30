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

	emptyText: Ext.DomHelper.markup({
		cls: "populate-contacts",
		cn: [{
				cls: 'title',
				html: 'Welcome to NextThought!'
		},{
			html:'Search for friends to add to your contact list.'
//		},{
//			cls: 'group-button-label',
//			html:'Create a group or join a group.'
		}]

		/*
		if(!$AppConfig.service.canCreateDynamicGroups()){
			this.el.down('.populate-contacts').addCls('left');
			this.el.down('.group-button-label').update('If you have a Group Code, enter it below to join a group.');
		}
		 */
	}),

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


	listeners: {
		resize: 'syncParts',
		refresh: 'setScrollRegion'
	},


	initComponent: function(){
		this.callParent(arguments);

		this.contactSearch = Ext.widget('contact-search',{floatParent:this});
		this.mon(this.contactSearch,{
			scope: this,
			show: 'onSearchShow',
			hide: 'onSearchHide'
		});
		this.mon(this,'deactivate','hide',this.contactSearch);
	},


	hideSearch: function(willAnimate){
		this.needsSyncUp = this.needsSyncUp || (!willAnimate && this.contactSearch.isVisible());
		this.contactSearch.hide();
	},


	resyncSearch: function(){
		if(!this.needsSyncUp){return;}
		delete this.needsSyncUp;
		Ext.defer(this.contactSearch.show,100,this.contactSearch);
	},



	onSearchClick: function(e){
		this.buttonRow.addCls('search');
		this.searchField.focus();
//		this.contactSearch.show();
	},


	onSearchBlur: function(e){
		this.buttonRow.removeCls('search');
	},

	onSearchShow: function(cmp){
		var b = this.buttonRow, text;
		if( !b ){ return; }
		b.addCls('search');

		cmp.alignTo(b,'br-tr',[0,0]);
		text = cmp.down('simpletext');
		Ext.defer(text.focus,10,text);
	},


	onSearchHide: function(){
		var b = this.buttonRow;
		if( b ){
			b.removeCls('search');
		}
	},


	afterRender: function(){
		this.callParent(arguments);

		this.mon(this.searchButton,{
			scope: this,
			click: 'onSearchClick'
		});

		this.mon(this.searchField,{
			scope: this,
			blur: 'onSearchBlur'
		});



		this.mon(this.up('main-sidebar'),{
			scope: this,
			beforemove: 'hideSearch',
			move: 'resyncSearch'
		});
	},


	setScrollRegion: function(){
		var el = this.el,
			bEl = el && this.el.down('.button-row'),
			h = bEl && (this.getHeight() - bEl.getHeight()),
			scrollArea = el && el.down('.contact-list');
		if(bEl && scrollArea){
			scrollArea.setHeight(h);
		}
	},


	syncParts: function(){
		this.contactSearch.setWidth(this.getWidth());
		this.setScrollRegion();
	},


	toggleSearch: function(e){
		var p = this.contactSearch;
		if(e.getTarget('.search')){
			p[p.isVisible()?'hide':'show']();
		}
		else {
			p.hide();
		}
	}
});
