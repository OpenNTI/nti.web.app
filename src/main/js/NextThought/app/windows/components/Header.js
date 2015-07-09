Ext.define('NextThought.app.windows.components.Header', {
	extend: 'Ext.Component',
	alias: 'widget.window-header',

	cls: 'window-header',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'title'},
		{cls: 'close'}
	]),


	renderSelectors: {
		titleEl: '.title',
		closeEl: '.close'
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.closeEl, 'click', this.doClose.bind(this));
	},

	setTitle: function(title) {
		if (!this.rendered) {
			this.on('afterrender', this.setTitle.bind(this, title));
			return
		}

		this.titleEl.update(title);
	}
});
