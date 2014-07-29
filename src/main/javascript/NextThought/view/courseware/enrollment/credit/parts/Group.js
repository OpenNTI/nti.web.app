Ext.define('NextThought.view.courseware.enrollment.credit.parts.Group', {
	extend: 'NextThought.view.courseware.enrollment.credit.parts.Set',
	alias: 'widget.enrollment-credit-group',

	requires: ['NextThought.view.courseware.enrollment.credit.parts.Set'],

	cls: 'admission-group',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'label {labelCls}', html: '{label}'},
		{ id: '{id}-body', cls: 'body-container',
			cn: ['{%this.renderContainer(out,values)%}'] }
	]),


	initComponent: function() {
		this.on('changed', 'changed');
		this.enableBubble(['reveal-item', 'hide-item']);

		this.callParent(arguments);
	},

	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			label: this.label,
			labelCls: this.labelCls
		});

		this.changed();
	}
});
