Ext.define('NextThought.view.account.contacts.View',{
	extend: 'Ext.view.View',
	alias: 'widget.contacts-view',
	requires: [
	],

	title: 'Chat',
	tabConfig: {
		tooltip: 'Chat'
	},

	iconCls: 'contacts',
	ui: 'contacts',
	cls: 'contacts-view',


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
	tpl: Ext.DomHelper.markup([
		{ cls: 'contact-list',cn: { tag: 'tpl', 'for':'.', cn: [
			{ cls: 'contact-row', cn: [
				{ cls: 'presence {Presence}' },
				{ cls: 'avatar', style: {backgroundImage: 'url({avatarURL})'} },
				{ cls: 'wrap', cn: [
					{ cls: 'name', html:'{displayName}' },
					{ cls: 'status', html:'{status}' }
				]}
			]}
		]}},
		{
			cls: 'button-row',
			cn: [
				{cls: 'search', html: 'Search' },
				{cls: 'group-chat', html: 'Group Chat' }
			]
		}
	]),


	listeners: {
		resize: 'syncParts',
		refresh: 'setScrollRegion'
	},


	initComponent: function(){
		this.store = 'contacts-store';
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


	getSearchButton: function(){
		var el = this.el;
		return el && el.down('.button-row .search');
	},


	onSearchShow: function(cmp){
		var b = this.getSearchButton(),
			text;
		if( !b ){ return; }
		b.addCls('active');

		cmp.alignTo(b,'tr-br',[0,0]);
		text = cmp.down('simpletext');
		Ext.defer(text.focus,10,text);
	},


	onSearchHide: function(){
		var b = this.getSearchButton();
		if( b ){
			b.removeCls('active');
		}
	},


	afterRender: function(){
		this.callParent(arguments);

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
