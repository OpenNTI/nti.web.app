Ext.define('NextThought.view.widgets.chat.PinnedMessageView', {
	extend:'Ext.panel.Panel',
	alias: 'widget.chat-pinned-message-view',
	requires: [
	],

	autoScroll: true,


	addMessage: function(m) {
		var id = IdCache.getIdentifier(m.getId());
		if (!this.down('[pinnedMessageId='+id+']')) {
			this.add({ xtype:'chat-log-entry-pinned', message: m, 'pinnedMessageId':id});
		}
	},


	initComponent: function() {
		this.callParent(arguments);

		//check to see if we are a mod or not, display clear button, or not.
		if (this.showClear){
			this.addDocked(
				{
					xtype: 'toolbar',
					dock: 'bottom',
					items: {
						text: 'clear'
					}
				}
			);
		}
	}

});
