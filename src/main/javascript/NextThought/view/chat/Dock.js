Ext.define('NextThought.view.chat.Dock',{
	extend: 'Ext.panel.Panel',
	alias: 'widget.chat-dock',
	id: 'chat-dock',//there should be ONLY ONE instance of this.

	title: 'Chats',
	collapsible: true,

//	ui: 'chat-dock',
	cls: 'chat-dock',
	defaultType: 'panel',
	defaults: {
		html: 'foo'
	}

});
