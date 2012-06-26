Ext.define('NextThought.view.chat.log.NotificationEntry', {
	extend: 'Ext.Component',
	alias: 'widget.chat-notification-entry',

	renderTpl: new Ext.XTemplate(
		'<div class="log-notification-wrapper">',
			'<div class="message">{message}</div> ',
		'</div>'
	),

	renderSelectors: {
		message: '.message'
	},

	initComponent: function(){
		this.renderData.message = this.message;
	}
});
