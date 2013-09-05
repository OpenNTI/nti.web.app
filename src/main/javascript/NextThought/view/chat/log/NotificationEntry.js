Ext.define('NextThought.view.chat.log.NotificationEntry', {
	extend: 'Ext.Component',
	alias: 'widget.chat-notification-entry',

	renderTpl: Ext.DomHelper.markup([{
		cls: 'log-notification-wrapper',
		cn:[{
			cls: 'message',
			html: '{message}'
		}]
	}]),

	renderSelectors: {
		message: '.message'
	},

	initComponent: function(){
		this.callParent(arguments);
		this.renderData.message = this.message;
	}
});
