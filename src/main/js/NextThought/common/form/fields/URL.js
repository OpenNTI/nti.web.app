Ext.define('NextThought.common.form.fields.URL', {
	extend: 'Ext.Component',
	alias: 'widget.url-field',

	renderTpl: Ext.DomHelper.markup({
		cls: 'url-field', cn: [
			{tag: 'tpl', 'if': 'required', cn: [
				{tag: 'input', type: 'url', name: '{name}', placeholder: '{placeholder}', value: '{value}', required: true}
			]},
			{tag: 'tpl', 'if': '!required', cn: [
				{tag: 'input', type: 'url', name: '{name}', placeholder: '{placeholder}', value: '{value}'}
			]},
			{tag: 'a', href: '', target: '_blank', html: 'Preview'}
		]
	}),


	renderSelectors: {
		urlField: '.url-field',
		previewEl: 'a',
		inputEl: 'input'
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			name: this.schema.name,
			placeholer: this.schema.placeholder,
			value: this.defaultValue,
			required: this.schema.required
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		this.attachInputListeners();
		this.onInputChange();
	},


	getInput: function() {
		return this.inputEl && this.inputEl.dom;
	},


	attachInputListeners: function() {
		var input = this.getInput();

		if (input) {
			input.addEventListener('keyup', this.onInputChange.bind(this));
		}
	},


	onInputChange: function() {
		var input = this.getInput(),
			isValid = !input.validity || input.validity.valid,
			value = input.value;

		if (isValid) {
			this.urlField.addCls('valid');
			this.previewEl.dom.setAttribute('href', value);
		} else {
			this.urlField.removeCls('valid');
			this.previewEl.dom.setAttribute('href', '');
		}
	}
});

