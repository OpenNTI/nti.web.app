//Styles defined in _history-view.scss
Ext.define('NextThought.view.account.history.View',{
	extend: 'Ext.container.Container',
	alias: 'widget.history-view',
	requires: [
		'NextThought.view.SecondaryTabPanel',
		'NextThought.view.UserDataPanel'
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
						{ title: 'Bookmarks', mimeType: ['favorite'] },
						{ title: 'Chats', mimeType: ['transcriptsummary'] }
					]
				}
			]
		}
	],


	constructor: function(){
		var i;
		if(isFeature('chat-history')){
			i = this.items[1].items[0].items;
			delete i[2];
		}

		return this.callParent(arguments);
	},


    afterRender: function(){
        this.callParent(arguments);

        if (!$AppConfig.service.canChat()){
            this.down('[title=Chats]').destroy();
        }
    }

});
