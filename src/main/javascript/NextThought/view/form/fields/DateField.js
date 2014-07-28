Ext.define('NextThought.view.form.fields.DateField', {
	extend: 'Ext.Component',
	alias: 'widget.datefield',

	requires: ['NextThought.view.form.fields.SearchComboBox'],

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


	afterRender: function() {
		this.callParent(arguments);


		this.monthInput = Ext.widget('searchcombobox', {
			options: [
				{value: '01', text: 'January'},
				{value: '02', text: 'February'},
				{value: '03', text: 'March'},
				{value: '04', text: 'April'},
				{value: '05', text: 'May'},
				{value: '06', text: 'June'},
				{value: '07', text: 'July'},
				{value: '08', text: 'August'},
				{value: '09', text: 'September'},
				{value: '10', text: 'October'},
				{value: '11', text: 'November'},
				{value: '12', text: 'December'}
			],
			emptyText: 'Month',
			renderTo: this.monthEl
		});

		this.on('destroy', 'destroy', this.monthInput);

		this.mon(this.dayEl, 'keydown', 'enforceNumber');
		this.mon(this.yearEl, 'keydown', 'enforceNumber');

		this.maybeChanged = Ext.Function.createBuffered(this.maybeChanged, 1, this);
		this.mon(this.monthInput, 'select', 'maybeChanged');
		this.mon(this.dayEl, 'keyup', 'maybeChanged');
		this.mon(this.yearEl, 'keyup', 'maybeChanged');
	},


	enforceNumber: function(e) {
		function between(key, lower, upper) {
			return lower <= key && key <= upper;
		}

		var input = e.getTarget('input'),
			maxLength = parseInt(input.getAttribute('size'), 10) || -1,
			tooLong = (input.value || '').length + 1 > maxLength,
			letter = e.getCharCode() || 13,
			isArrow = between(letter, 37, 40),//left arrow, and down arrow
			isNumber = between(letter, 48, 57) || between(letter, 95, 105),//numbers across the top and num pad
			isAllowedCtrl = between(letter, 8, 9) || letter === 13, //backspace, tab, or enter
			hasSelection = Math.abs(input.selectionStart - input.selectionEnd) !== 0,
			ctrlPressed = e.ctrlKey; //ext maps the metaKey to ctrlKey

		/*
			if the character entered is
				1.) pushing the size of the input value over the limit, there is a size limit, and the character is a number, and there is no selection
			or	2.) not an arrow, number, or allowed control key
			and 3.) the ctrl or meta key is not pressed
			then stop the event and do not put the character in the input
		 */
		if (!ctrlPressed && ((maxLength >= 0 && tooLong && isNumber && !hasSelection) || !(isArrow || isNumber || isAllowedCtrl))) {
			e.stopEvent();
			return false;
		}
	},


	isEmpty: function() {
		return Ext.isEmpty(this.yearEl.getValue() +
						   this.dayEl.getValue() +
						   this.monthInput.getValue());
	},


	isFullyAnswered: function() {
		var q = this.hasBeenAnswered || (!Ext.isEmpty(this.yearEl.getValue()) &&
										 !Ext.isEmpty(this.dayEl.getValue()) &&
										 !Ext.isEmpty(this.monthInput.getValue()));

		this.hasBeenAnswered = q;
		return q;
	},


	maybeChanged: function onChange() {
		var last = onChange.lastValue,
			current = this.getValue();
		if (last !== current && this.isFullyAnswered()) {
			this.fireEvent('changed', current, last);
		}
	},


	getValue: function() {
		var year = parseInt(this.yearEl.getValue(), 10),
			day = parseInt(this.dayEl.getValue(), 10),
			month = parseInt(this.monthInput.getValue(), 10) - 1,
			value = new Date(year, month, day);

		if (day !== value.getDate() || month !== value.getMonth() || year !== value.getFullYear()) {
			value = null;
		}

		return value;
	}
});
