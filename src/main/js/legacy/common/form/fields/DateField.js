var Ext = require('extjs');
var FieldsLegacySearchComboBox = require('./LegacySearchComboBox');


module.exports = exports = Ext.define('NextThought.common.form.fields.DateField', {
	extend: 'Ext.Component',
	alias: 'widget.datefield',
	cls: 'datefield',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'month'},
		{tag: 'input', cls: 'day date-field-input', placeholder: 'Day', size: 2},
		{tag: 'input', cls: 'year date-field-input', placeholder: 'Year', size: 4}
	]),

	renderSelectors: {
		monthEl: '.month',
		dayEl: '.day',
		yearEl: '.year'
	},

	afterRender: function () {
		this.callParent(arguments);


		this.monthInput = Ext.widget('legacysearchcombobox', {
			options: [
				{value: '0', text: 'January'},
				{value: '1', text: 'February'},
				{value: '2', text: 'March'},
				{value: '3', text: 'April'},
				{value: '4', text: 'May'},
				{value: '5', text: 'June'},
				{value: '6', text: 'July'},
				{value: '7', text: 'August'},
				{value: '8', text: 'September'},
				{value: '9', text: 'October'},
				{value: '10', text: 'November'},
				{value: '11', text: 'December'}
			],
			emptyText: 'Month',
			editable: false,
			renderTo: this.monthEl
		});

		this.on('destroy', 'destroy', this.monthInput);

		this.mon(this.dayEl, 'keydown', 'enforceNumber', DomUtils);
		this.mon(this.yearEl, 'keydown', 'enforceNumber', DomUtils);

		this.maybeChanged = Ext.Function.createBuffered(this.maybeChanged, 1, this);
		this.mon(this.monthInput, 'select', 'maybeChanged');
		this.mon(this.dayEl, 'keyup', 'maybeChanged');
		this.mon(this.yearEl, 'keyup', 'maybeChanged');

		if (this.date) {
			this.setValue(this.date);
		}
	},

	isEmpty: function () {
		return Ext.isEmpty(this.yearEl.getValue() +
							this.dayEl.getValue() +
							this.monthInput.getValue());
	},

	isFullyAnswered: function () {
		var q = this.hasBeenAnswered || (!Ext.isEmpty(this.yearEl.getValue()) &&
										 !Ext.isEmpty(this.dayEl.getValue()) &&
										 !Ext.isEmpty(this.monthInput.getValue()));

		this.hasBeenAnswered = q;
		return q;
	},

	maybeChanged: function onChange () {
		var last = onChange.lastValue,
			current = this.getValue();
		if (last !== current && this.isFullyAnswered()) {
			this.fireEvent('changed', current, last);
		}
	},

	setValue: function (date) {
		if (!this.rendered) {
			this.date = date;
			return;
		}

		var year = date && date.getFullYear(),
			month = date && date.getMonth(),
			day = date && date.getDate();

		this.yearEl.dom.value = year;
		this.dayEl.dom.value = day;

		this.monthInput.setValue(month);
	},

	getValue: function () {
		var year = parseInt(this.yearEl.getValue(), 10),
			day = parseInt(this.dayEl.getValue(), 10),
			month = parseInt(this.monthInput.getValue(), 10),
			value = new Date(year, month, day);

		if (day !== value.getDate() || month !== value.getMonth() || year !== value.getFullYear()) {
			value = null;
		}

		return value;
	}
});
