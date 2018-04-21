const Ext = require('@nti/extjs');
const {wait} = require('@nti/lib-commons');

require('./BaseInput');


module.exports = exports = Ext.define('NextThought.app.course.enrollment.components.parts.CheckboxGroup', {
	extend: 'NextThought.app.course.enrollment.components.parts.BaseInput',
	alias: 'widget.enrollment-checkbox-group',

	cls: 'enrollment-input-container',

	renderTpl: Ext.DomHelper.markup({
		cls: 'enrollment-checkbox-group', cn: [
			{cls: 'enrollment-input dark full radio yes', cn: [
				{tag: 'input', id: '{id}-{name}-yes', type: 'radio', name: '{name}', value: 'Y'},
				{tag: 'label', 'for': '{id}-{name}-yes', html: 'Yes.'},

				{cls: 'options disabled', cn: [
					{tag: 'tpl', 'for': 'options', cn: [
						{cls: 'enrollment-input dark full checkbox', cn: [
							{tag: 'input', id: '{parent.id}-{name}', type: 'checkbox', name: '{name}'},
							{tag: 'label', 'for': '{parent.id}-{name}', html: '{text}'}
						]}
					]}
				]}
			]},
			{cls: 'enrollment-input dark full radio no', cn: [
				{tag: 'input', id: '{id}-{name}-no', type: 'radio', name: '{name}', value: 'N'},
				{tag: 'label', 'for': '{id}-{name}-no', html: 'No.'}
			]}
		]}),


	beforeRender: function () {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			options: this.options,
			name: this.name
		});
	},


	afterRender: function () {
		this.callParent(arguments);

		var options = this.el.down('.options'),
			label = this.el.down('.enrollment-input label');

		label.setHeight(options.getHeight() + 40);
	},


	changed: function (e) {
		var yes = this.el.down('.yes input'),
			options = this.el.down('.yes .options'),
			parent = this.up('[changed]'),
			inOption = e && e.getTarget('.options'),
			label, input;

		if (yes.is(':checked')) {
			options.removeCls('disabled');
		} else {
			options.addCls('disabled');
		}

		if (!inOption) {
			this.callParent(arguments);
			return;
		}

		//if the click was in the options we need to call changed on the parent to
		//push the values to the session storage
		label = e.getTarget('label');
		label = Ext.get(label);
		input = label && label.up('.enrollment-input').down('input[type=checkbox]');

		if (input && parent) {
			wait()
				.then(function () {
					parent.changed(input.dom.name, input.dom.checked);
				});
		}
	},


	isEmpty: function () {
		var yes = this.el.down('.yes input'),
			no = this.el.down('.no input');

		return !yes.is(':checked') && !no.is(':checked');
	},


	addError: function () {
		this.addCls('error');
	},


	removeError: function () {
		this.removeCls('error');
	},


	setValue: function (value, name) {
		var input;

		if (!this.rendered) {
			this.startingvaluename = name;
			this.startingvalue = value;
			return;
		}


		input = this.el.down('input[type=radio][value="' + value + '"]');
		input.dom.checked = true;
		this.changed();
	},


	getValue: function () {
		var el = this.el,
			yes = el.down('.yes input'),
			selected = yes && yes.is(':checked'),
			value = {};

		value[this.name] = selected ? 'Y' : 'N';

		function getOptionValue (name) {
			var input = el.down('input[name="' + name + '"]');

			return input.is(':checked') ? 'Y' : 'N';
		}

		//if N is checked don't add the options to the value
		//if y is checked add Y or N depending on if they are checked
		(this.options || []).forEach(function (option) {
			if (selected) {
				value[option.name] = getOptionValue(option.name);
			}
		});

		return value;
	}
});
