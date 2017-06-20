/*globals jQuery*/
const Ext = require('extjs');
const {wait} = require('nti-commons');
const Formatter = require('formatter.js/dist/formatter');

require('legacy/common/form/fields/SimpleTextField');
require('./BaseInput');


module.exports = exports = Ext.define('NextThought.app.course.enrollment.components.parts.TextInput', {
	extend: 'NextThought.app.course.enrollment.components.parts.BaseInput',
	alias: 'widget.enrollment-textinput',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'input-container enrollment-input text {required} {size}'},
		{tag: 'tpl', 'if': 'help', cn: [
			{cls: 'help', cn: [
				{cls: 'information', html: '{help}'}
			]}
		]}
	]),

	renderSelectors: {
		inputEl: '.input-container'
	},

	initComponent: function () {
		this.callParent(arguments);

		function asPatterns (v) {
			return v ? (Array.isArray(v) ? v : [{'*': v}]) : undefined;
		}

		if (this.valueType === 'numeric') {
			this.valuePattern = this.valuePattern || '\\d*';
		}

		this.valuePattern = asPatterns(this.valuePattern);
	},

	beforeRender: function () {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			required: this.required ? 'required' : '',
			size: this.size,
			help: this.help
		});
	},

	afterRender: function () {
		this.callParent(arguments);

		this.input = Ext.widget('simpletext', {
			inputType: 'text',
			placeholder: this.placeholder,
			renderTo: this.inputEl
		});

		if (this.valuePattern) {
			this.formatter = new Formatter(Ext.getDom(this.input.inputEl), {
				patterns: this.valuePattern,
				persistent: false
			});
		}

		if (this.focusEvent) {
			this.mon(this.input, 'input-focus', this.fireEvent.bind(this, this.focusEvent));
		}

		this.on('destroy', 'destroy', this.input);

		this.setUpChangeMonitors();

		if (this.paymentFormatter) {
			this.addFormatter(this.paymentFormatter);
		}

		//if (helpIcon) {
		//	helpText = this.el.down('.help .information');

		//	this.mon(helpIcon, 'click', helpText.toggleCls.bind(helpText, 'hidden'));
		//}
	},

	addFormatter: function (formatter) {
		var input = this.input && this.input.inputEl && this.input.inputEl.dom;

		if (input) {
			jQuery(input).payment(formatter);
		}
	},

	setUpChangeMonitors: function () {
		if (!this.input) { return; }

		this.mon(this.input, 'changed', 'changed');
	},

	isValid: function () {
		//if we are required and empty we aren't
		var value = this.getValue()[this.name],
			isValid = this.required ? !this.isEmpty() : true,
			paymentValidator = this.validator && jQuery.payment[this.validator];

		if (this.valueValidation && !this.isEmpty()) {
			isValid = this.valueValidation.test(value);
		}

		if (paymentValidator && !paymentValidator(value)) {
			isValid = false;
		}

		if (!isValid) {
			this.addError();
		} else {
			this.removeError();
		}

		return isValid;
	},

	isEmpty: function () {
		return Ext.isEmpty(this.input.getValue().replace(/\W/ig, ''));
	},

	addError: function () {
		this.inputEl.addCls('error');
	},

	removeError: function () {
		this.inputEl.removeCls('error');
	},

	setValue: function (value) {
		var me = this;

		if (!me.rendered) {
			me.startingvalue = value;
			return;
		}

		if (me.input) {
			me.input.setValue(value);
		} else {
			//me.input is set in this.afterRender but we are called in this.parent.afterRender
			//so wait until the next event pump when we have me.input
			wait()
				.then(function () {
					me.input.setValue(value);
				});
		}
	},

	getValue: function (force) {
		var value = {}, val = this.input.getValue();

		if (this.getter && Ext.isFunction(this.getter)) {
			val = this.getter.call(null, val);
		} else if (this.paymentGetter) {
			val = jQuery(this.input.inputEl.dom).payment(this.paymentGetter);
		}

		if (this.valueType === 'numeric') {
			val = (val && val.replace(/[^0-9]/g, '')) || val;
		}

		if ((Ext.isEmpty(val) || !val) && !force) {
			return value;
		}

		value[this.name] = val;

		return value;
	}
});
