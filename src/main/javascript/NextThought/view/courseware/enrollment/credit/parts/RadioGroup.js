Ext.define('NextThought.view.courseware.enrollment.credit.parts.RadioGroup', {
	extend: 'NextThought.view.courseware.enrollment.credit.parts.BaseInput',
	alias: 'widget.credit-radiogroup',

	renderTpl: Ext.DomHelper.markup({tag: 'tpl', 'for': 'options', cn: [
		{tag: 'label', cls: 'credit-input dark full radio', cn: [
			{tag: 'input', type: 'radio', name: '{name}', value: '{value}'},
			{html: '{text}'}
		]}
	]}),


	beforeRender: function() {
		this.callParent(arguments);

		var name = this.name;

		(this.options || []).forEach(function(option) {
			var width = (option.inputWidth && option.inputWidth) + 'px' || 'auto';
			option.name = name;
			if (option.value === 'input') {
				option.text = option.text.replace('{input}', Ext.DomHelper.markup({
					cls: 'input-container disabled',
					cn: {tag: 'input', type: 'text', style: {width: width}}
				}));
			}
		});

		this.renderData = Ext.apply(this.renderData || {}, {
			options: this.options
		});
	},


	setUpChangeMonitors: function() {
		this.mon(this.el, 'click', 'changed');
	},


	changed: function(e) {
		this.callParent(arguments);

		var inputFields = this.el.dom.querySelectorAll('label.credit-input .input-container');

		if (!inputFields || Ext.isEmpty(inputFields)) { return; }

		wait()
			.then(function() {
				Ext.each(inputFields, function(input) {
					var span = input.parentNode,
						label = span && span.parentNode,
						checkedRadio = label && label.querySelector('input[type=radio]:checked');

					Ext.fly(input)[checkedRadio ? 'removeCls' : 'addCls']('disabled');
				});
			});
	},

	getValue: function() {
		if (!this.el) { return; }

		var active = this.el.down('input[type=radio]:checked'),
			label, input;

		if (!active) { return; }

		label = active.up('label');

		if (label) {
			input = label.down('input[type=text]');
		}

		if (input) {
			return input.dom.value;
		}

		return active.dom.value;
	},

	isEmpty: function() {
		if (!this.el) { return true; }

		var active = this.el.down('input[type=radio]:checked');

		return !active;
	}
});
