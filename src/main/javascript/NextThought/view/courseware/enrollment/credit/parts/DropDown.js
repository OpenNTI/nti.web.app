Ext.define('NextThought.view.courseware.enrollment.credit.parts.DropDown', {
	extend: 'NextThought.view.courseware.enrollment.credit.parts.BaseInput',
	alias: 'widget.credit-dropdown',

	requires: ['NextThought.view.form.fields.SearchComboBox'],

	renderTpl: Ext.DomHelper.markup({
		cls: 'credit-input select {required} {size}'
	}),


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			required: this.required ? 'required' : '',
			size: this.size
		});
	},

	renderSelectors: {
		selectEl: '.select'
	},


	afterRender: function() {
		this.callParent(arguments);

		var me = this,
			scrollParent = this.el.parent('.credit-container');

		me.combobox = Ext.widget('searchcombobox', {
			options: me.options,
			emptyText: me.placeholder,
			renderTo: me.selectEl
		});

		me.addOptions = me.combobox.addOptions.bind(me.combobox);

		me.mon(scrollParent, 'scroll', function() {
			me.combobox.hideOptions();
		});

		me.mon(me.combobox, {
			'invalid-selection': function() {
				me.selectEl.addCls('error');
			},
			'input-focused': function() {
				me.selectEl.removeCls('error');
			},
			'changed': {fn: 'changed', scope: me, buffer: 1}
		});

		me.on('destroy', 'destroy', me.combobox);
	},


	setUpChangeMonitors: function() {},


	addError: function() {
		this.selectEl.addCls('error');
	},


	removeError: function() {
		this.selectEl.removeCls('error');
	},


	isEmpty: function() {
		return !this.getValue();
	},


	getValue: function() {
		var value = {};

		value[this.name] = this.combobox.getValue();

		return value;
	}
});
