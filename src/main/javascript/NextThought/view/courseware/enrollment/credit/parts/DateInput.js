Ext.define('NextThought.view.courseware.enrollment.credit.parts.DateInput', {
	extend: 'NextThought.view.courseware.enrollment.credit.parts.BaseInput',
	alias: 'widget.credit-dateinput',

	requires: ['NextThought.view.form.fields.DateField'],

	renderTpl: Ext.DomHelper.markup({
		cls: 'credit-input date-input full'
	}),

	renderSelectors: {
		dateEl: '.date-input'
	},


	afterRender: function() {
		this.callParent(arguments);

		var me = this,
			scrollParent = me.el.parent('.credit-container');

		me.dateInput = Ext.widget('datefield', {
			renderTo: me.dateEl
		});

		me.on('destroy', 'destroy', me.dateInput);

		me.mon(scrollParent, 'scroll', function() {
			me.dateInput.monthInput.hideOptions();
		});
	},


	setUpChangeMonitors: function() {},//ignore base class's event listener


	isEmpty: function() {
		return this.getValue();
	},


	addError: function() {
		this.addCls('error');
	},


	removeError: function() {
		this.removeCls('error');
	},


	getValue: function() {
		var value = {},
			date = this.dateInput.getValue(),
			year = date.getFullYear(),
			day = date.getDate(),
			month = date.getMonth() + 1;

		if (day < 10) {
			day = '0' + day;
		}

		if (month < 10) {
			month = '0' + month;
		}

		value[this.name] = year.toString() + month.toString() + day.toString();
		this.changed();//There is no good way to validate on input the date ...so lets just do it when we request the value.
		return value;
	}
});
