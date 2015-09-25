export default Ext.define('NextThought.app.chat.components.log.PagerEntry', {
	extend: 'Ext.Component',
	alias: 'widget.chat-pager-entry',

	renderTpl: Ext.DomHelper.markup([{
		cls: 'log-notification-wrapper',
		cn: [{
			cls: 'message more',
			html: 'Previous Messages'
		}]
	}]),

	renderSelectors: {
		messageEl: '.message'
	}
});
