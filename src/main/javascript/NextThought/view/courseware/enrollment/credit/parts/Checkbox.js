Ext.define('NextThought.view.courseware.enrollment.credit.parts.Checkbox', {
	extend: 'NextThought.view.courseware.enrollment.credit.parts.BaseInput',
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
	},

	getValue: function() {
		if (!this.el) { return; }

		var check = this.el.down('input[type=checkbox]');

		return check.is(':checked');
	},

	isEmpty: function() {
		if (!this.el) { return true; }

		return false;
	}
});
