var Ext = require('extjs');
var PartsBaseInput = require('./BaseInput');


module.exports = exports = Ext.define('NextThought.app.course.enrollment.components.parts.Checkbox', {
	extend: 'NextThought.app.course.enrollment.components.parts.BaseInput',
	alias: 'widget.enrollment-checkbox',

	cls: 'enrollment-input dark full checkbox',

	renderTpl: Ext.DomHelper.markup([
		{tag: 'input', id: '{id}-{name}', type: 'checkbox', name: '{name}'},
		{tag: 'label', cls: '{cls}', 'for': '{id}-{name}', html: '{text}'},
		{cls: 'help', html: '{help}'}
	]),

	beforeRender: function () {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			name: this.name || 'enrollment-checkbox',
			text: this.text,
			cls: (this.text || '').length > 60 ? 'long' : '',
			help: this.help
		});
	},


	setValue: function (value) {
		var input;

		if (!this.rendered) {
			this.startingvalue = value;
			return;
		}

		value = value || value === 'Y';

		input = this.el.down('input[type=checkbox]');

		if (input) {
			input.dom.checked = value;
			this.changed();
		}
	},


	getValue: function (force) {
		if (!this.el || (!force && this.doNotSend)) { return; }

		var check = this.el.down('input[type=checkbox]'),
			isChecked = check.is(':checked'),
			value = {};

		if (!this.name) { return; }

		if (isChecked) {
			value[this.name] = this.useChar ? 'Y' : true;
		} else {
			value[this.name] = this.useChar ? 'N' : false;
		}

		return value;
	},

	isEmpty: function () {
		if (!this.rendered) { return true; }

		return false;
	},


	addError: function () {
		var label = this.el.down('label');

		label.addCls('error');
	},


	removeError: function () {
		var label = this.el.down('label');

		label.removeCls('error');
	}
});
