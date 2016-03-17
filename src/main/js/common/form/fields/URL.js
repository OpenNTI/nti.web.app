export default Ext.define('NextThought.common.form.fields.URL', {
	extend: 'Ext.Component',
	alias: 'widget.url-field',

	renderTpl: Ext.DomHelper.markup({
		cls: 'url-field', cn: [
			{tag: 'input', type: 'text', placeholder: '{placeholder}', value: '{value}', tabindex: '1'},
			{tag: 'tpl', 'if': 'required', cn: [
				{tag: 'input', type: 'url', name: '{name}', value: '{value}', required: true}
			]},
			{tag: 'tpl', 'if': '!required', cn: [
				{tag: 'input', type: 'url', name: '{name}', value: '{value}'}
			]},
			{tag: 'a', href: '', target: '_blank', html: 'Preview'}
		]
	}),

	defaultProtocol: 'http://',
	placeholder: 'Enter a link',

	renderSelectors: {
		urlField: '.url-field',
		previewEl: 'a',
		inputEl: 'input[type=text]',
		validationInput: 'input[type=url]'
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			name: this.schema.name,
			placeholder: this.schema.placeholder || this.placeholder,
			value: this.defaultValue,
			required: this.schema.required
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		this.attachInputListeners();
		this.onInputChange();

		if (this.focusOnRender) {
			this.focus();
		}
	},


	focus: function() {
		if (!this.rendered) {
			this.focusOnRender = true;
			return;
		}

		return this.inputEl && this.inputEl.dom.focus();
	},


	getInput: function() {
		return this.inputEl && this.inputEl.dom;
	},


	getValidator: function() {
		return this.validationInput && this.validationInput.dom;
	},


	getValue: function() {
		var input = this.getValidator();

		return input && input.value;
	},


	getErrors: function() {
		var input = this.getValidator();

		return {
			missing: input.validity && input.validity.valueMissing,
			invalidUrl: input.validity && input.validity.typeMismatch
		};
	},


	showError: function() {
		this.urlField.addCls('error');
	},


	removeError: function() {
		this.urlField.removeCls('error');
	},


	isEmpty: function() {
		return !this.getValue();
	},


	isValid: function() {
		var input = this.getValidator();

		return !input.validity || input.validity.valid;
	},


	syncValidator: function(value) {
		var parts = Globals.getURLParts(value),
			validator = this.getValidator();

		if (!parts.protocol) {
			value = this.defaultProtocol + value;
		}

		validator.value = value;

		return value;
	},


	attachInputListeners: function() {
		var input = this.getInput();

		if (input) {
			input.addEventListener('keyup', this.onInputChange.bind(this));
			input.addEventListener('focus', this.onInputFocus.bind(this));
			input.addEventListener('blur', this.onInputBlur.bind(this));
		}
	},


	onInputFocus: function() {
		this.urlField.addCls('focused');
	},


	onInputBlur: function() {
		this.urlField.removeCls('focused');
	},


	onInputChange: function() {
		var input = this.getInput(),
			value = this.syncValidator(input.value);

		if (this.onChange) {
			this.onChange();
		}

		if (this.isValid()) {
			this.urlField.addCls('valid');
			this.previewEl.dom.setAttribute('href', value);
		} else {
			this.urlField.removeCls('valid');
			this.previewEl.dom.setAttribute('href', '');
		}
	}
});

