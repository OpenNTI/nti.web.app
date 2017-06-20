const Ext = require('extjs');

require('legacy/common/form/fields/DateField');
require('./BaseInput');


module.exports = exports = Ext.define('NextThought.app.course.enrollment.components.parts.DateInput', {
	extend: 'NextThought.app.course.enrollment.components.parts.BaseInput',
	alias: 'widget.enrollment-dateinput',

	renderTpl: Ext.DomHelper.markup({
		cls: 'enrollment-input date-input full {required}'
	}),

	renderSelectors: {
		dateEl: '.date-input'
	},

	beforeRender: function () {
		this.callParent(arguments);
		Ext.apply(this.renderData, {
			required: this.required ? 'required' : ''
		});
	},

	afterRender: function () {
		this.callParent(arguments);

		var me = this,
			scrollParent = me.el.parent('.enrollment-container');

		me.dateInput = Ext.widget('datefield', {
			renderTo: me.dateEl,
			date: me.startingDate
		});

		me.on('destroy', 'destroy', me.dateInput);

		me.mon(scrollParent, 'scroll', function () {
			me.dateInput.monthInput.hideOptions();
		});

		me.mon(me.dateInput, 'changed', 'changed');
	},

	setUpChangeMonitors: function () {},

	//Uh...not rendered yet.


	isEmpty: function () {
		return this.dateInput ? this.dateInput.isEmpty() : true;
	},

	addError: function () {
		this.addCls('error');
	},

	removeError: function () {
		this.removeCls('error');
	},

	isValid: function () {
		var c = this.isCorrect();

		if (!c) {
			this.addError();
		}

		return c;
	},

	isCorrect: function () {
		if (!this.rendered) {
			return true;
		}

		if (this.isValueCorrect) {
			return this.isValueCorrect(this.dateInput.getValue());
		}

		return !!this.getValue()[this.name];
	},

	//value looks like YYYYMMDD
	setValue: function (value) {
		var year, month, day, date;

		if (!this.rendered) {
			this.startingvalue = value;
			return;
		}

		year = value.substring(0, 4);
		month = value.substring(4, 6);
		day = value.substring(6, 8);

		year = parseInt(year, 10);
		month = parseInt(month, 10) - 1;
		day = parseInt(day, 10);

		date = new Date(year, month, day);

		if (this.dateInput) {
			this.dateInput.setValue(date);
		} else {
			this.startingDate = date;
		}
	},

	getValue: function () {
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
