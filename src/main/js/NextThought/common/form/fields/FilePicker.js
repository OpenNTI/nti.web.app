Ext.define('NextThought.common.form.fields.FilePicker', {
	extend: 'Ext.Component',
	alias: 'widget.file-picker-field',

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'img',
			style: { backgroundImage: 'url({thumbnail})'},
			cn: [
				{tag: 'input', type: 'file', 'data-value': '{thumbnail}'}
			]
		},
		{
			cls: 'img-name'
		}
	]),

	beforeRender: function () {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, {
			thumbnail: this.thumbnail
		});
	}
});
