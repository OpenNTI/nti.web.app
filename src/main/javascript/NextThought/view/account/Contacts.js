Ext.define('NextThought.view.account.Contacts',{
	extend: 'Ext.container.Container',
	alias: 'widget.contacts-view',
	requires: [
		'NextThought.view.account.contacts.Search',
		'NextThought.view.account.contacts.Card',
		'NextThought.view.account.contacts.Panel'
	],
	tooltip: 'Contacts',
	iconCls: 'contacts',
	ui: 'contacts',
	cls: 'contacts-view',
	plain: true,

	layout: {
		type: 'vbox',
		align: 'stretch'
	},

	items: [
		{xtype: 'box', cls: 'view-title', autoEl: {html: 'Contacts',cn:[{cls: 'search'}]}},
		{
			xtype: 'container',
			flex: 1,
			layout: 'card',
			defaults :{
				autoScroll: true,
				overflowX: 'hidden',
				xtype: 'container',
				defaults: {
					layout: 'anchor',
					anchor: '100%',
					xtype: 'contacts-panel'
				}
			},
			items: [

				{ id: 'my-groups' },

				{ xtype: 'box' },

				{ cls: "disabled-contacts-view", xtype: 'box',
					autoEl: {cls:'disabled-message-div',cn:[
						{cls:'disabled-title', html:'Social Features Disabled...'},
						'We need your parent\'s permission to give you more features.&nbsp; Ask your parent to email us.'
					]}
				}
			]
		}
	],


	initComponent: function(){
		this.callParent(arguments);
		if(!$AppConfig.service.canFriend()){
			this.down('box[cls=view-title]').autoEl = null;
			this.down('container').getLayout().setActiveItem(2);
		}
		this.contactSearch = Ext.widget('contact-search',{floatParent:this});
		this.mon(this.contactSearch,{
			scope: this,
			show: this.onSearchShow,
			hide: this.onSearchHide
		});
	},


	hideSearch: function(willAnimate){
		this.needsSyncUp = this.needsSyncUp || (!willAnimate && this.contactSearch.isVisible());
		this.contactSearch.hide();
	},


	resyncSearch: function(){
		if(!this.needsSyncUp){return;}
		delete this.needsSyncUp;
		Ext.defer(function(){this.contactSearch.show();},100,this);
	},


	onSearchShow: function(cmp){
		var b = this.searchBtn;
		if( !b ){ return; }
		b.addCls('active');

		cmp.alignTo(b,'tr-br',[0,0]);
		cmp.setHeight(Ext.Element.getViewportHeight()-cmp.getPosition()[1]);
		Ext.defer(function(){ cmp.down('simpletext').focus(); },10);
	},


	onSearchHide: function(){
		if( this.searchBtn ){
			this.searchBtn.removeCls('active');
		}
	},


	afterRender: function(){
		this.callParent(arguments);

		this.mon(this.up('main-sidebar'),{
			scope: this,
			beforemove: this.hideSearch,
			move: this.resyncSearch

		});

		var el = this.el.down('.view-title');
		this.searchBtn = el.down('.search');
		this.activeView = 0;
		if(el){
			this.mon(el,'click',this.toggleSearch,this);
		}
	},


	afterLayout: function(){
		this.callParent(arguments);
		var cmp = this.contactSearch;
		cmp.setWidth(this.getWidth());
	},


	toggleSearch: function(e){
//		this.activeView = (this.activeView+1)%2;
//		this.down('container').getLayout().setActiveItem(this.activeView);
//		this.manageBtn[this.activeView?'addCls':'removeCls']('active');

		var p = this.contactSearch;
		if(e.getTarget('.search')){
			p[p.isVisible()?'hide':'show']();
		}
		else {
			p.hide();
		}
	}
});
