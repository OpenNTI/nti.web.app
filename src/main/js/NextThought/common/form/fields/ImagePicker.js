Ext.define('NextThought.common.form.fields.ImagePicker', {
	extend: 'Ext.Component',
	alias: 'widget.image-picker-field',


	renderTpl: Ext.DomHelper.markup({
		cls: 'image-picker no-file', cn: [
			{cls: 'add-button'},
			{cls: 'preview'},
			{tag: 'input', type: 'file', accept: 'image/*'},
			{cls: 'clear', html: 'Clear Image'}
		]
	})
});
