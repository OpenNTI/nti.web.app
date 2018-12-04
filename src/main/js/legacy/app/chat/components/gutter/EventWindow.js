const Ext = require('@nti/extjs');
const {Calendar} = require('@nti/web-calendar');

module.exports = exports = Ext.define('NextThought.app.chat.components.gutter.EventWindow', {
	extend: 'Ext.container.Container',
	alias: 'widget.gutter-list-event-window',
	cls: 'gutter-event-window',

	layout: 'none',

	initComponent () {
		this.callParent(arguments);

		this.add({
			xtype: 'react',
			component: Calendar,
			onClose: () => {
				this.onClose();
			}
		});
	}
});
