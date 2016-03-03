Ext.define('NextThought.app.course.enrollment.components.parts.DropDown', {
	extend: 'NextThought.app.course.enrollment.components.parts.BaseInput',
	alias: 'widget.enrollment-dropdown',

	requires: ['NextThought.common.form.fields.LegacySearchComboBox'],

	renderTpl: Ext.DomHelper.markup({
		cls: 'enrollment-input select {required} {size}'
	}),


	editable: true,


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
			scrollParent = this.el.parent('.enrollment-container');

		me.combobox = Ext.widget('legacysearchcombobox', {
			options: me.options,
			emptyText: me.placeholder,
			renderTo: me.selectEl,
			editable: !!me.editable
		});

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
			'select': {fn: 'changed', scope: me, buffer: 1}
		});

		me.on('destroy', 'destroy', me.combobox);
	},


	addOptions: function(options) {
		this.options = options;

		if (this.combobox) {
			this.combobox.addOptions(options);
		}
	},


	addError: function() {
		this.selectEl.addCls('error');
	},


	removeError: function() {
		this.selectEl.removeCls('error');
	},


	isEmpty: function() {
		return !this.getValue()[this.name];
	},

	setValue: function(value) {
		var me = this;

		if (!me.rendered) {
			me.startingvalue = value;
			return;
		}

		//me.comobox is set in me.afterRender but we are called in parent.afterRender
		//so wait until the next event pump
		wait()
			.then(function() {
				me.combobox.setValue(value);
			});
	},


	getValue: function() {
		var value = {};

		value[this.name] = this.combobox.getValue();

		return value;
	}
});
