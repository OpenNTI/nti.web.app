Ext.define('NextThought.view.courseware.enrollment.credit.parts.TextInput', {
	extend: 'NextThought.view.courseware.enrollment.credit.parts.BaseInput',
	alias: 'widget.credit-textinput',

	requires: ['NextThought.view.form.fields.SimpleTextField'],

	renderTpl: Ext.DomHelper.markup([
		{cls: 'input-container credit-input text {required} {size}'},
		{tag: 'tpl', 'if': 'help', cn: [
			{cls: 'help', cn: [
				{cls: 'information hidden', html: '{help}'},
				{cls: 'icon'}
			]}
		]}
	]),

	renderSelectors: {
		inputEl: '.input-container'
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			required: this.required ? 'required' : '',
			size: this.size,
			help: this.help
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		var helpIcon = this.el.down('.help .icon'), helpText;

		this.input = Ext.widget('simpletext', {
			inputType: 'text',
			placeholder: this.placeholder,
			renderTo: this.inputEl
		});

		this.on('destroy', 'destroy', this.input);

		this.setUpChangeMonitors();

		if (helpIcon) {
			helpText = this.el.down('.help .information');

			this.mon(helpIcon, 'click', helpText.toggleCls.bind(helpText, 'hidden'));
		}
	},

	setUpChangeMonitors: function() {
		if (!this.input) { return; }

		this.mon(this.input, 'changed', 'changed');
	},


	getValue: function() {
		var value = {};

		value[this.name] = this.input.getValue();

		return value;
	}
});
