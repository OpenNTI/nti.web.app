Ext.define('NextThought.view.courseware.enrollment.credit.parts.TextInput', {
	extend: 'NextThought.view.courseware.enrollment.credit.parts.BaseInput',
	alias: 'widget.credit-textinput',

	requires: ['NextThought.view.form.fields.SimpleTextField'],

	renderTpl: Ext.DomHelper.markup([
		{cls: 'input-container credit-input text {required} {size}'},
		{tag: 'tpl', 'if': 'help', cn: [
			{cls: 'help', 'data-qtip': '{help}', html: '?'}
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

		this.input = Ext.widget('simpletext', {
			inputType: 'text',
			placeholder: this.placeholder,
			renderTo: this.inputEl
		});

		this.on('destroy', 'destroy', this.input);

		this.setUpChangeMonitors();
	},

	setUpChangeMonitors: function() {
		if (!this.input) { return; }

		this.mon(this.input, 'changed', 'changed');
	}
});
