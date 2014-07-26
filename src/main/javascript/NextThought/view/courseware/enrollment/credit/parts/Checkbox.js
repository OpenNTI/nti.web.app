Ext.define('NextThought.view.courseware.enrollment.credit.parts.Checkbox', {
	extend: 'NextThought.view.courseware.enrollment.credit.parts.BaseInput',
	alias: 'widget.credit-checkbox',

	cls: 'credit-input dark full checkbox',

	renderTpl: Ext.DomHelper.markup([
		{tag: 'input', id: '{id}-{name}', type: 'checkbox', name: '{name}'},
		{tag: 'label', cls: '{cls}', 'for': '{id}-{name}', html: '{text}'}
	]),

	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			name: this.name || 'credit-checkbox',
			text: this.text,
			cls: (this.text || '').length > 40 ? 'long' : ''
		});
	},

	getValue: function(force) {
		if (!this.el || (!force && this.doNotSend)) { return; }

		var check = this.el.down('input[type=checkbox]'),
			value = {};

		if (!this.name) { return; }

		value[this.name] = check.is(':checked');

		return value;
	},

	isEmpty: function() {
		if (!this.rendered) { return true; }

		return false;
	},


	addError: function() {
		var label = this.el.down('label');

		label.addCls('error');
	},


	removeError: function() {
		var label = this.el.down('label');

		label.removeCls('error');
	}
});
