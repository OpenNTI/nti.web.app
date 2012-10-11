Ext.define('NextThought.view.account.contacts.View',{
	extend: 'Ext.container.Container',
	alias: 'widget.contacts-view',
	requires: [
		'NextThought.view.SecondaryTabPanel',
		'NextThought.view.account.contacts.Search',
		'NextThought.view.account.contacts.Card',
		'NextThought.view.account.contacts.Panel',
        'NextThought.view.account.contacts.GroupButtons'
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
		{xtype: 'box', cls: 'view-title', autoEl: {html: 'Contacts',cn:[{cls: 'search', title: 'Search for contacts'}]}},
		{
			xtype: 'container',
			layout: 'card',
			flex: 1,
			id: 'contacts-view-panel',
			defaults :{
				autoScroll: true,
				overflowX: 'hidden',
				xtype: 'container',
				defaults: {
					layout: 'anchor',
					anchor: '100%'
				}
			},
			items: [
				{
					xtype: 'secondary-tabpanel',
					items: [
						{ id: 'contact-list', title: 'All Contacts', autoScroll: true},
                        { title:'Groups', layout: {
                            type: 'vbox',
                            align: 'stretch'
                            },
                            items:[
                            { xtype: 'container', id: 'my-groups', layout: 'auto', flex: 1, autoScroll: true}
                            { xtype: 'group-buttons', height: '50px'}
                        ]}
					]
				},

				{
					cls: "populate-contacts",
					xtype: 'box',
					autoEl: { cn: [
						{cls: 'title', html: 'Welcome to NextThought!'},
						'Search for friends to add to your contact list.'
					] }
				},

				{
					cls: "disabled-contacts-view",
					xtype: 'box',
					autoEl: { cn: [
						{ cls:'disabled-message-div',cn: [
							{ cls:'disabled-title', html:'Social Features Disabled...'},
							'We need your parent\'s permission to give you more features.&nbsp; Ask your parent to email us.  ',
                            {tag: 'span', cls: 'resend-consent', html:'Resend Consent?', handler: this.resendClicked}
						]}
					]}
				}
			]
		}
	],


	initComponent: function(){
		this.callParent(arguments);
		if(!$AppConfig.service.canFriend()){
			this.down('box[cls=view-title]').autoEl = null;
			Ext.getCmp('contacts-view-panel').getLayout().setActiveItem(2);
		}
		this.contactSearch = Ext.widget('contact-search',{floatParent:this});
		this.mon(this.contactSearch,{
			scope: this,
			show: this.onSearchShow,
			hide: this.onSearchHide
		});
		this.mon(this,'deactivate',this.contactSearch.hide,this.contactSearch);
	},


	hideSearch: function(willAnimate){
		this.needsSyncUp = this.needsSyncUp || (!willAnimate && this.contactSearch.isVisible());
		this.contactSearch.hide();
	},


    resendClicked: function(){
        this.fireEvent('resendConsent');
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

        this.mon(this.el.down('.resend-consent'), 'click', this.resendClicked, this);

	},


	afterLayout: function(){
		this.callParent(arguments);
		var cmp = this.contactSearch;
		cmp.setWidth(this.getWidth());
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
