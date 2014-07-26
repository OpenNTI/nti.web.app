Ext.define('NextThought.view.courseware.enrollment.credit.parts.CheckboxGroup', {
	extend: 'NextThought.view.courseware.enrollment.credit.parts.BaseInput',
	alias: 'widget.credit-checkbox-group',

	renderTpl: Ext.DomHelper.markup({
		 cls: 'credit-checkbox-group', cn: [
			{tag: 'label', cls: 'credit-input dark full radio yes', cn: [
				{tag: 'input', type: 'radio', name: '{name}'},
				{tag: 'span', html: 'Yes.'},

				{cls: 'options disabled', cn: [
					{tag: 'tpl', 'for': 'options', cn: [
						{tag: 'label', cls: 'credit-input dark full checkbox', cn: [
							{tag: 'input', type: 'checkbox', name: '{name}'},
							{tag: 'span', html: '{text}'}
						]}
					]}
				]}
			]},
			{tag: 'label', cls: 'credit-input dark full radio no', cn: [
				{tag: 'input', type: 'radio', name: '{name}'},
				{tag: 'span', html: 'No.'}
			]}
	]}),


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			options: this.options,
			name: this.name
		});
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


	getValue: function() {
		var el = this.el,
			yes = el.down('.yes input'),
			selected = yes && yes.is(':checked'),
			value = {};

		value[this.name] = selected;

		function getOptionValue(name) {
			var input = el.down('input[name="' + name + '"]');

			return input.is(':checked');
		}

		(this.options || []).forEach(function(option) {
			value[option.name] = selected && getOptionValue(option.name);
		});

		return value;
	}
});
