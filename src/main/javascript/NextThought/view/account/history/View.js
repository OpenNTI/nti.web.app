//Styles defined in _history-view.scss
Ext.define('NextThought.view.account.history.View',{
	extend: 'Ext.container.Container',
	alias: 'widget.history-view',
	requires: [
		'NextThought.view.SecondaryTabPanel',
		'NextThought.view.UserDataPanel',
		'NextThought.view.account.history.Panel',
		'NextThought.view.account.history.FavoritePanel'
	],

	title: 'History',
	tabConfig:{tooltip: 'History'},
	iconCls: 'history',
	ui: 'history',
	cls: 'history-view',
	plain: true,

	layout: {
		type: 'vbox',
		align: 'stretch'
	},

	items: [
		{xtype: 'box', cls: 'view-title', autoEl: {}},
		{
			xtype: 'container',
			layout: 'fit',
			flex: 1,
			id: 'history-view-panel',

			items: [
				{
					xtype: 'secondary-tabpanel',
					stateId: 'history-side-view',
					defaults: {xtype:'user-data-panel'},
					items: [
						{ title: 'Notes', mimeType: ['note','highlight'] },
						{ title: 'Bookmarks', mimeType: ['favorite'] }
					]
				}
			]
		}
	],


	constructor: function(){
		var i, t;

		if(isFeature('remove-history-tab')){
			this.title = "Me";
			this.items[1].items[0].items[0].xtype = 'user-history-panel';
			this.items[1].items[0].items[1].xtype = 'user-history-favorite-panel';
		}

		this.callParent(arguments);
	},


    afterRender: function(){
        this.callParent(arguments);

	    var chatTab = this.down('[title=Chats]');
        if (!$AppConfig.service.canChat() && !Ext.isEmpty(chatTab)){
	        chatTab.destroy();
        }
    },

	getActiveView: function(){
		return this.down("[title=Notes]").isVisible() ? this.down("[title=Notes]") : this.down("[title=Bookmarks]");
	},

	applyFilters: function(filter){
		if(Ext.isEmpty(filter)){
			return;
		}

		var v = this.getActiveView(),
			s = v  && v.getStore(),
			selectedMimeTypes = [];

		s.removeAll();
		s.clearFilter();
		if(filter){
			Ext.each( filter.value, function(item){
				var mt = item.value;
				if(mt){
					selectedMimeTypes.push(mt);
				}
			});
			s.filter([{filterFn: function(item) {
				return filter.test(item); }} ]);
		}
		s.proxy.extraParams = Ext.apply(s.proxy.extraParams||{},{
			sortOn: 'relevance',
			sortOrder: 'descending',
			accept: selectedMimeTypes.join(',')
		});

		s.load();
	}

});
