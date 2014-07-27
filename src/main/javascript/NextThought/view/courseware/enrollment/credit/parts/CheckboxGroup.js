Ext.define('NextThought.view.courseware.enrollment.credit.parts.CheckboxGroup', {
	extend: 'NextThought.view.courseware.enrollment.credit.parts.BaseInput',
	alias: 'widget.credit-checkbox-group',

	cls: 'credit-input-container',

	renderTpl: Ext.DomHelper.markup({
		 cls: 'credit-checkbox-group', cn: [
			{cls: 'credit-input dark full radio yes', cn: [
				{tag: 'input', id: '{id}-{name}-yes', type: 'radio', name: '{name}'},
				{tag: 'label', 'for': '{id}-{name}-yes', html: 'Yes.'},

				{cls: 'options disabled', cn: [
					{tag: 'tpl', 'for': 'options', cn: [
						{cls: 'credit-input dark full checkbox', cn: [
							{tag: 'input', id: '{parent.id}-{name}', type: 'checkbox', name: '{name}'},
							{tag: 'label', 'for': '{parent.id}-{name}', html: '{text}'}
						]}
					]}
				]}
			]},
			{cls: 'credit-input dark full radio no', cn: [
				{tag: 'input', id: '{id}-{name}-no', type: 'radio', name: '{name}'},
				{tag: 'label', 'for': '{id}-{name}-no', html: 'No.'}
			]}
	]}),


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			options: this.options,
			name: this.name
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		var options = this.el.down('.options'),
			label = this.el.down('.credit-input label');

		label.setHeight(options.getHeight() + 40);
	},


	changed: function() {
		this.callParent(arguments);

		var yes = this.el.down('.yes input'),
			options = this.el.down('.yes .options');

		if (yes.is(':checked')) {
			options.removeCls('disabled');
		} else {
			options.addCls('disabled');
		}
	},


	isEmpty: function() {
		var yes = this.el.down('.yes input'),
			no = this.el.down('.no input');

		return !yes.is(':checked') && !no.is(':checked');
	},


	addError: function() {
		this.addCls('error');
	},


	removeError: function() {
		this.removeCls('error');
	},


	getValue: function() {
		var el = this.el,
			yes = el.down('.yes input'),
			selected = yes && yes.is(':checked'),
			value = {};

		value[this.name] = selected ? 'Y' : 'N';

		function getOptionValue(name) {
			var input = el.down('input[name="' + name + '"]');

			return input.is(':checked') ? 'Y' : 'N';
		}

		(this.options || []).forEach(function(option) {
			value[option.name] = selected && getOptionValue(option.name);
		});

		return value;
	}
});
