Ext.define('NextThought.app.navigation.components.Default', {
	extend: 'Ext.Component',
	alias: 'widgets.default-navigation-bar',

	renderTpl: Ext.DomHelper.markup(
		{cls: 'library branding'}
	),


	renderSelectors: {
		libraryEl: '.library'
	},


	afterRender: function() {
		this.callParent(arguments);

		if (this.gotoLibrary) {
			this.mon(this.libraryEl, 'click', this.gotoLibrary.bind(this));
		} else {
			this.libraryEl.addCls('disabled');
		}
	}
});
