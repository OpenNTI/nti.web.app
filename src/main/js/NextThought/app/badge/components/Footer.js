Ext.define('NextThought.app.badge.components.Footer', {
	extend: 'Ext.Component',
	alias: 'widget.badge-window-footer',

	cls: 'footer',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'left', cn: [
			{cls: 'btn export', 'data-qtip': 'Download or Export Badge'}
		]},
		{cls: 'right', cn: [
			{cls: 'btn close', html: 'Close'}
		]}
	]),

	renderSelectors: {
		exportEl: '.export',
		closeEl: '.close'
	},


	afterRender: function(){
		this.callParent(arguments);

		this.mon(this.exportEl, 'click', this.onExportClick.bind(this));
		this.mon(this.closeEl, 'click', this.onCloseClick.bind(this));
	},


	onExportClick: function(e){
		if (this.onExport) {
			this.onExport(e);
		}
	},

	onCloseClick: function(e){
		if (this.doClose) {
			this.doClose(e);
		}
	}
})