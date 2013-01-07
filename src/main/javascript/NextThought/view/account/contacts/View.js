Ext.define('NextThought.view.account.contacts.View',{
	extend: 'Ext.container.Container',
	alias: 'widget.contacts-view',
	requires: [
		'NextThought.view.SecondaryTabPanel',
		'NextThought.view.account.contacts.Search',
		'NextThought.view.account.contacts.Card',
		'NextThought.view.account.contacts.Panel',
        'NextThought.view.account.contacts.GroupButtons',
		'NextThought.view.account.contacts.ListButtons'
	],

	tabConfig: {
		tooltip: 'Contacts'
	},

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
				xtype: 'container',
				defaults: {
					layout: 'anchor',
					anchor: '100%',
					defaults: {anchor: '100%'}
				}
			},
			items: [
				{
					xtype: 'secondary-tabpanel',

					items: [
						{ id: 'contact-list', title: 'All Contacts', autoScroll: true },
                        { title: 'Lists',
						  layout: 'anchor',
						  defaults: {anchor: '100%'},
                          items:[
                            { xtype: 'container', id: 'my-lists', layout: 'auto', flex: 1, autoScroll: true, anchor: '100% -50px'},
							{ xtype: 'list-buttons', height: '50px'}
                        ]},
						{ title: 'Groups',
						  layout: 'anchor',
						  defaults: {anchor: '100%'},
                          items:[
                            { xtype: 'container', id: 'my-groups', layout: 'auto', flex: 1, autoScroll: true, anchor: '100% -50px'},
                            { xtype: 'group-buttons', height: '50px'}
                        ]}
					]
				},

				{
					xtype: 'container',
					autoScroll: false,
					overflowX: 'hidden',
					overflowY: 'hidden',
					layout: {type: 'vbox', align: 'stretch', reserveScrollbar: false},
					items: [{
						xtype: 'box',
						flex: 1,
						cls: "populate-contacts",
						autoEl: {
							cn: [{
									cls: 'title',
									html: 'Welcome to NextThought!'
							},{
								html:'Search for friends to add to your contact list.'
							},{
								html:'Create a group or join a group.',
								cls: 'group-button-label'
							}]
						}
					},{
						xtype: 'group-buttons',
						height: '50px'
					}]
				},

				{
					cls: "disabled-contacts-view",
					xtype: 'box',
					autoEl: { cn: [
						{ cls:'disabled-message-div',cn: [
							{ cls:'disabled-title', html:'Social Features Disabled...'},
							'We need your parent\'s permission to give you more features.  ',
                            {tag: 'span', cls: 'resend-consent', html:'Resend Consent Form', handler: this.resendClicked}
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

		if(!$AppConfig.service.canCreateDynamicGroups()){
			this.el.down('.populate-contacts').addCls('left');
			this.el.down('.group-button-label').update('If you have a Group Code, enter it below to join a group.');
		}

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

		Ext.QuickTips.register({
			target: this.searchBtn.id,
			text: this.searchBtn.getAndRemoveAttr('title')
		});

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
