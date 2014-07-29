Ext.define('NextThought.view.courseware.enrollment.credit.parts.DateInput', {
	extend: 'NextThought.view.courseware.enrollment.credit.parts.BaseInput',
	alias: 'widget.credit-dateinput',

	requires: ['NextThought.view.form.fields.DateField'],

	renderTpl: Ext.DomHelper.markup({
		cls: 'credit-input date-input full {required}'
	}),

	renderSelectors: {
		dateEl: '.date-input'
	},


	beforeRender: function() {
		this.callParent(arguments);
		Ext.apply(this.renderData, {
			required: this.required ? 'required' : ''
		});
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

		me.mon(me.dateInput, 'changed', 'changed');
	},


	setUpChangeMonitors: function() {},//Uh...not rendered yet.


	isEmpty: function() {
		return this.dateInput.isEmpty();
	},


	addError: function() {
		this.addCls('error');
	},


	removeError: function() {
		this.removeCls('error');
	},


	isValid: function() {
		var c = this.isCorrect();

		if (!c) {
			this.addError();
		}

		return c;
	},


	isCorrect: function() {
		return !this.rendered || (this.isEmpty() || !!this.getValue()[this.name]);
	},

	getValue: function() {
		var value = {},
			date = this.dateInput.getValue(),
			year = date && date.getFullYear(),
			day = date && date.getDate(),
			month = date && date.getMonth() + 1;

		if (date) {
			if (day < 10) {
				day = '0' + day;
			}

			if (month < 10) {
				month = '0' + month;
			}

			value[this.name] = year.toString() + month.toString() + day.toString();
		}

		return value;
	}
});
