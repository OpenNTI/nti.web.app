Ext.define('NextThought.view.chat.View', {
	extend:'Ext.container.Container',
    alias: 'widget.chat-view',

    requires: [
        'NextThought.view.chat.Log',
        'NextThought.view.chat.Entry'
    ],

	header: false,
	frame: false,
	border: false,

	cls: 'chat-view',
	ui: 'chat-view',
    layout: {
		type: 'vbox',
		align: 'stretch'
	},
	items: [
		{ xtype: 'chat-log-view', flex:1 },
		{ xtype: 'chat-entry', mainEntry: true }
    ]
});
