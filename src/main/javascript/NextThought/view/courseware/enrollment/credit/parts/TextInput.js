Ext.define('NextThought.view.courseware.enrollment.credit.parts.TextInput', {
	extend: 'NextThought.view.courseware.enrollment.credit.parts.BaseInput',
	alias: 'widget.credit-textinput',

	requires: ['NextThought.view.form.fields.SimpleTextField'],

	renderTpl: Ext.DomHelper.markup([
		{cls: 'input-container credit-input text {required} {size}'},
		{tag: 'tpl', 'if': 'help', cn: [
			{cls: 'help', cn: [
				{cls: 'information', html: '{help}'}
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

		if (this.valuetype === 'numeric') {
			this.mon(this.input.inputEl, 'keydown', 'enforceNumber', DomUtils);
		}

		this.on('destroy', 'destroy', this.input);

		this.setUpChangeMonitors();

		//if (helpIcon) {
		//	helpText = this.el.down('.help .information');

		//	this.mon(helpIcon, 'click', helpText.toggleCls.bind(helpText, 'hidden'));
		//}
	},


	setUpChangeMonitors: function() {
		if (!this.input) { return; }

		this.mon(this.input, 'changed', 'changed');
	},


	isEmpty: function() {
		var value = this.input.getValue();

		return Ext.isEmpty(value);
	},


	addError: function() {
		this.inputEl.addCls('error');
	},


	removeError: function() {
		this.inputEl.removeCls('error');
	},


	getValue: function(force) {
		var value = {},
			val = this.input.getValue();

		if (this.valuetype === 'numeric') {
			val = (val && val.replace(/[^0-9]/g, '')) || val;
		}

		if ((Ext.isEmpty(val) || !val) && !force) {
			return value;
		}

		value[this.name] = val;

		return value;
	}
});
