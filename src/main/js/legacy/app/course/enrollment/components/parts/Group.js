const Ext = require('@nti/extjs');

require('./Set');


module.exports = exports = Ext.define('NextThought.app.course.enrollment.components.parts.Group', {
	extend: 'NextThought.app.course.enrollment.components.parts.Set',
	alias: 'widget.enrollment-group',

	cls: 'admission-group',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'label {labelCls}', html: '{label}'},
		{ id: '{id}-body', cls: 'body-container',
			cn: ['{%this.renderContainer(out,values)%}'] }
	]),


	initComponent: function () {
		this.on('changed', 'changed');
		this.enableBubble(['reveal-item', 'hide-item']);

		this.callParent(arguments);
	},

	beforeRender: function () {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			label: this.label,
			labelCls: this.labelCls
		});

		this.changed();
	}
});
