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


	initComponent: function() {
		this.callParent(arguments);

		function asPatterns(v) {
			return v ? (Array.isArray(v) ? v : [{'*': v}]) : undefined;
		}

		if (this.valueType === 'numeric') {
			this.valuePattern = this.valuePattern || '\\d*';
		}

		this.valuePattern = asPatterns(this.valuePattern);
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

		if (this.valuePattern) {
			this.formatter = new Formatter(Ext.getDom(this.input.inputEl), {
				patterns: this.valuePattern,
				persistent: false
			});
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


	isValid: function() {
		//if we are required and empty we aren't
		var value = this.getValue()[this.name],
			isValid = this.required ? !this.isEmpty() : true;

		if (this.valueValidation && !this.isEmpty()) {
			isValid = this.valueValidation.test(value);
		}

		if (!isValid) {
			this.addError();
		}

		return isValid;
	},


	isEmpty: function() {
		return Ext.isEmpty(this.input.getValue());
	},


	addError: function() {
		this.inputEl.addCls('error');
	},


	removeError: function() {
		this.inputEl.removeCls('error');
	},


	setValue: function(value) {
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
				.then(function() {
					me.input.setValue(value);
				});
		}
	},


	getValue: function(force) {
		var value = {},
			val = this.input.getValue();

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
