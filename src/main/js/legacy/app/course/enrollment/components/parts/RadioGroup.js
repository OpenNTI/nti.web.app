const Ext = require('extjs');
const {wait} = require('@nti/lib-commons');

require('./BaseInput');


module.exports = exports = Ext.define('NextThought.app.course.enrollment.components.parts.RadioGroup', {
	extend: 'NextThought.app.course.enrollment.components.parts.BaseInput',
	alias: 'widget.enrollment-radiogroup',

	cls: 'enrollment-input-container',

	renderTpl: Ext.DomHelper.markup({cn: [
		{cls: 'label', html: '{label}'},
		{tag: 'tpl', 'for': 'options', cn: {
			cls: 'enrollment-input dark full radio', cn: [
				{tag: 'input', id: '{parent.id}-{value}', type: 'radio', name: '{name}', value: '{value}'},
				{tag: 'label', cls: '{cls}', 'for': '{parent.id}-{value}', cn: [
					{html: '{text}'},
					{tag: 'tpl', 'if': 'content', cn: [
						{cls: 'content hidden', html: '{content}'}
					]},
					{tag: 'tpl', 'if': 'help', cn: [
						{cls: 'help', cn: [
							{cls: 'information', html: '{help}'}
						]}
					]}
				]}
			]}
		}
	]}),


	beforeRender: function () {
		this.callParent(arguments);

		var me = this,
			name = me.name;

		(me.options || []).forEach(function (option) {
			var width = (option.inputWidth && (option.inputWidth + 'px')) || 'auto';

			option.name = name;
			if (option.value === 'input') {
				option.cls = 'input';
				option.text = option.text.replace('{input}', Ext.DomHelper.markup({
					cls: 'input-container disabled',
					cn: {tag: 'input', type: 'text', style: {width: width}}
				}));
			}

			if (option.value === 'dropdown') {
				option.cls = 'input';
				me.dropdownOption = option;
				option.text = option.text.replace('{input}', Ext.DomHelper.markup({
					cls: 'input-container dropdown disabled'
				}));
			}
		});

		me.renderData = Ext.apply(me.renderData || {}, {
			options: me.options,
			label: me.label
		});
	},


	afterRender: function () {
		this.callParent(arguments);

		var me = this,
			dropdownContainer,
			scrollParent = this.el.parent('.enrollment-container'),
			option = me.dropdownOption;

		function stop (e) {
			e.stopEvent();
			var t = e.getTarget('input');
			if (t) {
				t.focus();
			}
		}

		if (option) {
			dropdownContainer = me.el.down('.input-container.dropdown');

			me.dropdown = Ext.widget('legacysearchcombobox', {
				options: me.dropdownoptions || option.options,
				emptyText: option.placeholder,
				renderTo: dropdownContainer
			});

			me.mon(scrollParent, 'scroll', function () {
				me.dropdown.hideOptions();
			});
		}

		me.el.query('label input').forEach(function (n) {
			me.mon(Ext.get(n), 'click', stop);
		});
	},


	addOptions: function (options) {
		if (this.dropdown) {
			this.dropdown.addOptions(options);
		}

		this.dropdownoptions = options;
	},


	setUpChangeMonitors: function () {
		var input, me = this;

		me.mon(me.el, 'click', 'changed');

		if (me.dropdown) {
			me.mon(me.dropdown, 'changed', 'changed');
		}

		input = me.el.down('input[type=text]');

		if (input) {
			me.mon(input, 'keydown', function () {
				clearTimeout(me.inputChangeTimeout);

				me.inputChangeTimeout = setTimeout(me.changed.bind(me), 500);
			});
		}
	},


	changed: function (e) {
		this.callParent(arguments);

		var me = this,
			inputFields = this.el.dom.querySelectorAll('.enrollment-input .input-container'),
			contents = this.el.select('.content');

		if (!Ext.isEmpty(contents)) {
			contents.addCls('hidden');
		}

		if (!inputFields || Ext.isEmpty(inputFields)) { return; }

		wait()
			.then(function () {
				var checked = me.el.down('input[type=radio]:checked'),
					container = checked && checked.up('.radio'),
					content = container && container.down('.content'),
					error = me.el.down('label.error');

				if (content) {
					content.removeCls('hidden');
				}

				if (error) {
					error.removeCls('error');
				}

				if (!me.isCorrect() && container && !me.noIncorrect) {
					container.addCls('error');
				}

				Ext.each(inputFields, function (input) {
					var credit = Ext.fly(input).up('.enrollment-input'),
						checkedRadio = credit && credit.el.dom.querySelector('input[type=radio]:checked');

					Ext.fly(input)[checkedRadio ? 'removeCls' : 'addCls']('disabled');
				});
			});
	},


	addError: function () {
		if (!this.noIncorrect) {
			this.addCls('error');
		}
	},


	removeError: function () {
		this.removeCls('error');
	},


	setValue: function (value) {
		var me = this,
			input, parent;

		if (!me.rendered) {
			me.startingvalue = value;
			return;
		}

		input = me.el.down('input[value="' + value + '"]');

		//if we have an input with the correct value, check it
		if (input) {
			input.dom.checked = true;
			me.changed();
			return;
		}

		//drop down is set in this.afterRender but this is called from the parent.afterRender
		//so wait until the next event pump
		wait()
			.then(function () {
				//if we have a drop down set that as the value
				if (me.dropdown) {
					me.dropdown.setValue(value);

					input = me.el.down('.input-container.dropdown');
					parent = input && input.up('.enrollment-input').down('input[type=radio]');

					//check the radio input associated with the drop down
					if (parent) {
						parent.dom.checked = true;
					}

					me.changed();
				} else {
					//check if we have an text input
					input = me.el.down('input[type=text]');
					parent = input && input.up('.enrollment-input').down('input[type=radio]');

					//if we have an input and the value isn't falsy
					if (input) {
						input.dom.value = value === 'NaN' ? 0 : value;
					}

					//check the radio input associated with the text input
					if (parent) {
						parent.dom.checked = true;
					}

					me.changed();
				}
			});
	},

	//itemChecked: function() {
	//	var selection = this.el.down('input[type=radio]:checked');
	//	return !!selection;
	//},

	/*
		return an object with values for the selected radio
		button and (if applicable) its corresponding text input,
		or null if no button is selected.
	*/
	__selectionValues: function () {
		var active = this.el.down('input[type=radio]:checked'),
			label, input, inputContainer, inputvalue;

		if (!active) {
			return;
		}

		label = active.up('.radio');

		if (label) {
			input = label.down('input[type=text]');
			inputContainer = label.down('.input-container');
		}

		if (inputContainer && inputContainer.is('.dropdown')) {
			inputvalue = this.dropdown.getValue() || '';
		} else if (input) {
			inputvalue = input.dom.value;
		}

		if (this.valType === 'number' && !Ext.isEmpty(inputvalue)) {
			var tmp = parseInt(inputvalue, 10);
			inputvalue = isNaN(tmp) ? (this.allowEmptyInput ? '' : null) : tmp;
		}
		return {
			checked: active.dom.value,
			input: inputvalue
		};
	},

	isValid: function () {
		if (!this.required || !this.isVisible(true)) { return true; }

		var val = this.getValue(),
			active = this.el.down('input[type=radio]:checked'),
			radio = active && active.up('.radio'),
			input = radio && radio.down('input[type=text]');

		//if there is a checked option and it doesn't have an input its valid
		//so don't check the other stuff
		if (!input && active) { return true; }

		if (val && !Ext.isEmpty(val[this.name], true)) {
			return true;
		}

		var selection = this.__selectionValues();
		if (selection && (this.allowEmptyInput && Ext.isEmpty(selection.input))) {
			return true;
		}

		this.addError();

		return false;
	},

	getValue: function (force) {
		if (!this.el || (!force && this.doNotSend)) { return; }

		var active = this.el.down('input[type=radio]:checked'),
			label, input, inputContainer, value = {},
			val;

		if (!active) { return; }

		label = active.up('.radio');

		if (label) {
			input = label.down('input[type=text]');
			inputContainer = label.down('.input-container');
		}

		if (inputContainer && inputContainer.is('.dropdown')) {
			val = this.dropdown.getValue() || '';
		} else if (input) {
			val = input.dom.value;
		} else {
			val = active.dom.value;
		}

		if (this.valType === 'number' && !Ext.isEmpty(val)) {
			var tmp = parseInt(val, 10);
			val = isNaN(tmp) ? (this.allowEmptyInput ? '' : null) : tmp;
		}

		var isBlank = (Ext.isEmpty(val) || val === 'N');
		if (isBlank) {
			var selection = this.__selectionValues();
			if (selection && selection.input != null && this.allowEmptyInput) {
				isBlank = false;
			}
		}

		if (isBlank && !force && this.omitIfBlank) {
			return value;
		}

		value[this.name] = val.toString();

		return value;
	},

	isEmpty: function () {
		if (!this.rendered) { return true; }

		var active = this.el.down('input[type=radio]:checked'), input;

		if (active) {
			input = active.up('.radio');
			if (input) {
				input = input.down('input[type=text]');
			}

			if (input) {
				active = input.dom.value;
			}
		}

		return !active;
	}
});
