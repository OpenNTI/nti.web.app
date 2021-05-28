const Ext = require('@nti/extjs');

module.exports = exports = Ext.define('NextThought.common.form.fields.URL', {
	extend: 'Ext.Component',
	alias: 'widget.url-field',

	renderTpl: Ext.DomHelper.markup({
		cls: 'url-field',
		cn: [
			{
				tag: 'input',
				type: 'text',
				placeholder: '{placeholder}',
				value: '{value}',
				tabindex: '1',
			},
			{
				tag: 'tpl',
				if: 'required',
				cn: [
					{
						tag: 'input',
						type: 'url',
						value: '{value}',
						required: true,
					},
				],
			},
			{
				tag: 'tpl',
				if: '!required',
				cn: [{ tag: 'input', type: 'url', value: '{value}' }],
			},
			{ tag: 'a', href: '', target: '_blank', html: 'Preview' },
		],
	}),

	defaultProtocol: 'http://',
	placeholder: 'Enter a link',

	renderSelectors: {
		urlField: '.url-field',
		previewEl: 'a',
		inputEl: 'input[type=text]',
		validationInput: 'input[type=url]',
	},

	beforeRender: function () {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			name: this.schema.name,
			placeholder: this.schema.placeholder || this.placeholder,
			value: this.defaultValue,
			required: this.schema.required,
		});
	},

	afterRender: function () {
		this.callParent(arguments);

		this.attachInputListeners();
		this.onInputChange();

		if (this.focusOnRender) {
			this.focus();
		}
	},

	focus: function () {
		if (!this.rendered) {
			this.focusOnRender = true;
			return;
		}

		return this.inputEl && this.inputEl.dom.focus();
	},

	getInput: function () {
		return this.inputEl && this.inputEl.dom;
	},

	getValidator: function () {
		return this.validationInput && this.validationInput.dom;
	},

	appendToFormData(data) {
		data.append(this.schema.name, this.getValue());
	},

	getValue: function () {
		let validator = this.getValidator();
		let input = this.getInput();
		let value = validator.value;

		if (input.value === this.defaultValue) {
			value = input.value;
		}

		return value;
	},

	getErrors: function () {
		var input = this.getValidator();

		return {
			missing: input.validity && input.validity.valueMissing,
			invalidUrl: input.validity && input.validity.typeMismatch,
		};
	},

	showError: function () {
		this.urlField.addCls('error');
	},

	removeError: function () {
		this.urlField.removeCls('error');
	},

	isEmpty: function () {
		return !this.getValue();
	},

	isValid: function () {
		var input = this.getValidator();

		return !input.validity || input.validity.valid;
	},

	syncValidator: function (value) {
		const validator = this.getValidator();

		try {
			value = new URL(value).toString();
		} catch (e) {
			value = `${this.defaultProtocol}${value}`;
		}

		console.log('Validated: ', value);
		validator.value = value;

		return value;
	},

	attachInputListeners: function () {
		if (this.inputEl) {
			this.mon(this.inputEl, {
				scope: this,

				change: 'onInputChange',
				input: 'onInputChange',
				keyup: 'onInputChange',

				focus: 'onInputFocus',
				blur: 'onInputBlur',
			});
		}
	},

	onInputFocus: function () {
		this.urlField.addCls('focused');
	},

	onInputBlur: function () {
		this.urlField.removeCls('focused');
	},

	onInputChange: function (e) {
		const input = this.getInput();
		const value = this.syncValidator(input.value);
		const isValid = this.isValid();

		if (this.onChange) {
			this.onChange();
		}

		//only call this when we have an event
		if (this.schema.onChange && e) {
			this.schema.onChange.call(this, value, isValid);
		}

		if (isValid) {
			this.urlField.addCls('valid');
			this.previewEl.dom.setAttribute('href', value);
		} else {
			this.urlField.removeCls('valid');
			this.previewEl.dom.setAttribute('href', '');
		}
	},
});
