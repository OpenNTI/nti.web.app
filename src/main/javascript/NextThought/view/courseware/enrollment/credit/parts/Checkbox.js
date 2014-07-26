Ext.define('NextThought.view.courseware.enrollment.credit.parts.Checkbox', {
	extend: 'Ext.Component',
	alias: 'widget.credit-checkbox',


	renderTpl: Ext.DomHelper.markup({
		tag: 'label', cls: 'credit-input dark full checkbox', cn: [
			{tag: 'input', type: 'checkbox', name: '{name}'},
			{tag: 'span', html: '{text}'}
		]
	}),

	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			name: this.name,
			text: this.text
		});
	}
});
