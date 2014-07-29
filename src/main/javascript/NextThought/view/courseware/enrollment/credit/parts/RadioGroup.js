Ext.define('NextThought.view.courseware.enrollment.credit.parts.RadioGroup', {
	extend: 'NextThought.view.courseware.enrollment.credit.parts.BaseInput',
	alias: 'widget.credit-radiogroup',

	cls: 'credit-input-container',

	renderTpl: Ext.DomHelper.markup({tag: 'tpl', 'for': 'options', cn: {
		cls: 'credit-input dark full radio', cn: [
			{tag: 'input', id: '{parent.id}-{value}', type: 'radio', name: '{name}', value: '{value}'},
			{tag: 'label', cls: '{cls}', 'for': '{parent.id}-{value}', cn: [
				{html: '{text}'},
				{tag: 'tpl', 'if': 'content', cn: [
					{cls: 'content hidden', html: '{content}'}
				]}
			]}
		]
	}}),


	beforeRender: function() {
		this.callParent(arguments);

		var name = this.name;

		(this.options || []).forEach(function(option) {
			var width = (option.inputWidth && (option.inputWidth + 'px')) || 'auto';
			option.name = name;
			if (option.value === 'input') {
				option.cls = 'input';
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


	afterRender: function() {
		this.callParent(arguments);
		var me = this;

		function stop(e) {
			e.stopEvent();
			var t = e.getTarget('input');
			if (t) {
				t.focus();
			}
		}

		this.el.query('label input').forEach(function(n) {
			me.mon(Ext.get(n), 'click', stop);
		});
	},


	setUpChangeMonitors: function() {
		this.mon(this.el, 'click', 'changed');
	},


	changed: function(e) {
		this.callParent(arguments);

		var me = this,
			inputFields = this.el.dom.querySelectorAll('.credit-input .input-container'),
			contents = this.el.select('.content');

		if (!Ext.isEmpty(contents)) {
			contents.addCls('hidden');
		}

		if (!inputFields || Ext.isEmpty(inputFields)) { return; }

		wait()
			.then(function() {
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

				if (!me.isCorrect() && container) {
					container.addCls('error');
				}

				Ext.each(inputFields, function(input) {
					var credit = Ext.fly(input).up('.credit-input'),
						checkedRadio = credit && credit.el.dom.querySelector('input[type=radio]:checked');

					Ext.fly(input)[checkedRadio ? 'removeCls' : 'addCls']('disabled');
				});
			});
	},


	addError: function() {
		this.addCls('error');
	},


	removeError: function() {
		this.removeCls('error');
	},


	getValue: function(force) {
		if (!this.el || (!force && this.doNotSend)) { return; }

		var active = this.el.down('input[type=radio]:checked'),
			label, input, value = {},
			val;

		if (!active) { return; }

		label = active.up('.radio');

		if (label) {
			input = label.down('input[type=text]');
		}

		if (input) {
			val = input.dom.value;
		} else {
			val = active.dom.value;
		}

		if (this.valType === 'number') {
			val = parseInt(val, 10);
		}

		if ((Ext.isEmpty(val) || val === 'N' || !val) && !force && this.omitIfBlank) {
			return value;
		}

		value[this.name] = val.toString();

		return value;
	},

	isEmpty: function() {
		if (!this.rendered) { return true; }

		var active = this.el.down('input[type=radio]:checked');

		return !active;
	}
});
