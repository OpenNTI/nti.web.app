Ext.define('NextThought.app.windows.components.Header', {
	extend: 'Ext.Component',
	alias: 'widget.window-header',

	cls: 'window-header',

	renderTpl: Ext.DomHelper.markup({
		cls: 'close'
	}),


	renderSelectors: {
		closeEl: '.close'
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.closeEl, 'click', this.doClose.bind(this));
	}
});
