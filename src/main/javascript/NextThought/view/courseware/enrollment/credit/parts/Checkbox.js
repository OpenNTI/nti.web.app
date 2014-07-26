Ext.define('NextThought.view.courseware.enrollment.credit.parts.Checkbox', {
	extend: 'NextThought.view.courseware.enrollment.credit.parts.BaseInput',
	alias: 'widget.credit-checkbox',

	cls: 'credit-input dark full checkbox',

	renderTpl: Ext.DomHelper.markup([
		{tag: 'input', id: '{id}-{name}', type: 'checkbox', name: '{name}'},
		{tag: 'label', 'for': '{id}-{name}', html: '{text}'}
	]),

	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			name: this.name || 'credit-checkbox',
			text: this.text
		});
	},

	getValue: function() {
		if (!this.el) { return; }

		var check = this.el.down('input[type=checkbox]'),
			value = {};

		value[this.name] = check.is(':checked');

		return value;
	},

	isEmpty: function() {
		if (!this.rendered) { return true; }

		return false;
	}
});
