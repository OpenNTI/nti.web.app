var Ext = require('extjs');

require('./LegacySearchComboBox');
require('../../../util/Scrolling');


module.exports = exports = Ext.define('NextThought.common.form.fields.DateTimeField', {
	extend: 'Ext.Component',
	alias: 'widget.date-time-field',

	statics: {
		//http://stackoverflow.com/questions/16353211/check-if-year-is-leap-year-in-javascript
		isLeapYear: function (year) {
			return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
		}
	},

	INVALID_DATE: 'Please enter a valid date.',
	INVALID_TIME: 'Please enter a valid time.',
	YEARS_IN_PAST: 5,
	YEARS_IN_FUTURE: 5,
	AM: 'AM',
	PM: 'PM',
	showCurrentDateSelect: true,

	MONTHS: [
		{longLabel: 'January', shortLabel: 'JAN', value: 0, days: 31},
		{longLabel: 'February', shortLabel: 'FEB', value: 1, days: 28, leapDays: 29},
		{longLabel: 'March', shortLabel: 'MAR', value: 2, days: 31},
		{longLabel: 'April', shortLabel: 'APR', value: 3, days: 30},
		{longLabel: 'May', shortLabel: 'MAY', value: 4, days: 31},
		{longLabel: 'June', shortLabel: 'JUN', value: 5, days: 30},
		{longLabel: 'July', shortLabel: 'JUL', value: 6, days: 31},
		{longLabel: 'August', shortLabel: 'AUG', value: 7, days: 31},
		{longLabel: 'September', shortLabel: 'SEP', value: 8, days: 30},
		{longLabel: 'October', shortLabel: 'OCT', value: 9, days: 31},
		{longLabel: 'November', shortLabel: 'NOV', value: 10, days: 30},
		{longLabel: 'December', shortLabel: 'DEC', value: 11, days: 31}
	],

	cls: 'date-time-field',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'date', cn: [
			{cls: 'container', cn: [
				{cls: 'month', cn: [
					{tag: 'span', cls: 'label', html: 'Month'},
					{cls: 'month-input'}
				]},
				{cls: 'day', cn: [
					{tag: 'span', cls: 'label', html: 'Day'},
					{cls: 'day-input'}
				]},
				{cls: 'year', cn: [
					{tag: 'span', cls: 'label', html: 'Year'},
					{cls: 'year-input'}
				]}
			]},
			{tag: 'span', cls: 'error'}
		]},
		{cls: 'time', cn: [
			{tag: 'span', cls: 'label', html: 'Local Time'},
			{cls: 'container', cn: [
				{tag: 'input', type: 'number', cls: 'hour-input', min: '0', max: '24'},
				{tag: 'span', cls: 'seperator', html: ':'},
				{tag: 'input', type: 'number', cls: 'minute-input', min: '0', max: '59'},
				{cls: 'meridiem-input'}
			]},
			{tag: 'span', cls: 'error'}
		]},
		{tag: 'tpl', 'if': 'currentDate', cn: [
			{cls: 'select-current-date', cn: [
				{tag: 'span', html: 'or '},
				{tag: 'span', cls: 'link', html: 'Current Date/Time'}
			]}
		]}
	]),

	renderSelectors: {
		monthLabel: '.month .label',
		monthContainer: '.month-input',
		dayLabel: '.day .label',
		dayContainer: '.day-input',
		yearLabel: '.year .label',
		yearContainer: '.year-input',
		timeLabel: '.time .label',
		hourInput: '.hour-input',
		minuteInput: '.minute-input',
		meridiemContainer: '.meridiem-input',
		dateError: '.date .error',
		timeError: '.time .error',
		selectCurrentEl: '.select-current-date .link'
	},

	initComponent: function () {
		this.callParent(arguments);

		var upperBound,
			lowerBound;

		lowerBound = new Date();
		lowerBound.setFullYear(lowerBound.getFullYear() - this.YEARS_IN_PAST, 0, 1);

		upperBound = new Date();
		upperBound.setFullYear(upperBound.getFullYear() + this.YEARS_IN_FUTURE, 0, 1);

		this.currentDate = this.currentDate;
		this.lowerBound = this.lowerBound || lowerBound;
		this.upperBound = this.upperBound || upperBound;

		this.invalidDateMsg = this.invalidDateMsg || this.INVALID_DATE;
		this.invalidTimeMsg = this.invalidTimeMsg || this.INVALID_TIME;

		this.onParentScroll = this.closeSelects.bind(this);
		this.onResize = this.closeSelects.bind(this);
	},

	beforeRender: function () {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			currentDate: this.showCurrentDateSelect
		});
	},

	afterRender: function () {
		this.callParent(arguments);

		var me = this;

		me.yearSelect = new NextThought.common.form.fields.LegacySearchComboBox({
			editable: false,
			onSelect: me.onYearChanged.bind(me),
			renderTo: me.yearContainer,
			onError: function () {
				me.yearLabel.addCls('error');
			},
			onRemoveError: function () {
				me.yearLabel.removeCls('error');
			}
		});

		me.monthSelect = new NextThought.common.form.fields.LegacySearchComboBox({
			editable: false,
			onSelect: me.onMonthChanged.bind(me),
			renderTo: me.monthContainer,
			onError: function () {
				me.monthLabel.addCls('error');
			},
			onRemoveError: function () {
				me.monthLabel.removeCls('error');
			}
		});

		me.daySelect = new NextThought.common.form.fields.LegacySearchComboBox({
			editable: false,
			onSelect: me.onDayChanged.bind(me),
			renderTo: me.dayContainer,
			onError: function () {
				me.dayLabel.addCls('error');
			},
			onRemoveError: function () {
				me.dayLabel.removeCls('error');
			}
		});

		me.meridiemSelect = new NextThought.common.form.fields.LegacySearchComboBox({
			editable: false,
			options: [this.AM, this.PM],
			onSelect: me.onMeridiemChanged.bind(me),
			renderTo: me.meridiemContainer
		});

		me.mon(me.hourInput, {
			keydown: function () {
				me.hourInput.removeCls('error');
				me.clearTimeError();

				if (me.onChange) {
					me.onChange();
				}
			},
			change: me.onHourChanged.bind(me)
		});

		me.mon(me.minuteInput, {
			keydown: function () {
				me.minuteInput.removeCls('error');
				me.clearTimeError();

				if (me.onChange) {
					me.onChange();
				}
			},
			blur: function () {
				me.setMinute(me.getMinutes());
			},
			change: me.onMinuteChanged.bind(me)
		});

		if (me.selectCurrentEl) {
			me.mon(me.selectCurrentEl, 'click', me.selectCurrentDate.bind(me));
		}

		me.on('destroy', function () {
			me.yearSelect.destroy();
			me.monthSelect.destroy();
			me.daySelect.destroy();
			me.meridiemSelect.destroy();

			me.removeScrollListener();
			me.removeResizeListener();
		});

		me.addScrollListener();
		me.addResizeListener();

		me.selectDate(me.currentDate);
	},

	disable: function () {
		this.hasBeenDisabled = true;

		if (this.rendered) {
			this.addCls('disabled');
			// this.yearSelect.disable();
			// this.monthSelect.disable();
			// this.daySelect.disable();
			// this.meridiemSelect.disable();
			// this.hourInput.addCls('disabled');
			// this.minuteInput.addCls('disabled');
		}
	},

	enable: function () {
		this.hasBeenDisabled = null;

		if (this.rendered) {
			this.removeCls('disabled');
			// this.yearSelect.enable();
			// this.monthSelect.enable();
			// this.daySelect.enable();
			// this.meridiemSelect.enable();
			// this.hourInput.removeCls('disabled');
			// this.minuteInput.removeCls('disabled');
		}
	},

	closeSelects: function () {
		this.yearSelect.hideOptions();
		this.monthSelect.hideOptions();
		this.daySelect.hideOptions();
		this.meridiemSelect.hideOptions();
	},

	addScrollListener: function () {
		var parent = this.scrollParent || window;

		parent.addEventListener('scroll', this.onParentScroll);
	},

	addResizeListener: function () {
		Ext.EventManager.onWindowResize(this.onResize);
	},

	removeScrollListener: function () {
		var parent = this.scrollParent || window;

		parent.removeEventListener('scroll', this.onParentScroll);
	},

	removeResizeListener: function () {
		Ext.EventManager.removeResizeListener(this.onResize);
	},

	getSelectedDate: function () {
		var year = this.getYear(),
			month = this.getMonth(),
			day = this.getDay(),
			hour = this.getHours() || 0,
			minutes = this.getMinutes() || 0;

		if (year != null && month != null && day != null && hour <= 24 && minutes < 60) {
			return new Date(year, month, day, hour, minutes);
		}

		return null;
	},

	getYear: function () {
		return this.yearSelect && this.yearSelect.getValue();
	},

	getMonth: function () {
		return this.monthSelect && this.monthSelect.getValue();
	},

	getDay: function () {
		return this.daySelect && this.daySelect.getValue();
	},

	getHours: function () {
		var value = this.hourInput && this.hourInput.dom && this.hourInput.dom.value,
			meridiem = this.meridiemSelect.getValue() || this.AM;

		if (value == null || value === '') {
			return null;
		}

		value = parseInt(value, 10);

		if (this.meridiemSelect.isDisabled()) {
			value = value;
		} else if (meridiem === this.AM && value === 12) {
			value = 0;
		} else if (meridiem === this.PM && value < 12) {
			value = value + 12;
		}

		return value;
	},

	getMinutes: function () {
		var value = this.minuteInput && this.minuteInput.dom && this.minuteInput.dom.value;

		if (value == null || value === '') {
			return null;
		}

		value = parseInt(value, 10);

		return value;
	},

	selectCurrentDate: function (date) {
		this.selectDate(new Date());
	},

	selectDate: function (date) {
		if (date && date < this.lowerBound) {
			date = this.lowerBound;
		} else if (date && date > this.upperBound) {
			date = this.upperBound;
		}

		var year = date && date.getFullYear(),
			month = date && date.getMonth(),
			day = date && date.getDate(),
			hour = date && date.getHours(),
			minute = date && date.getMinutes();

		this.setValues(year, month, day, hour, minute);
	},

	setValues: function (year, month, day, hour, minute) {
		this.updateYearRange(year, month, day);
		this.updateMonthRange(year, month, day);
		this.updateDayRange(year, month, day);

		this.setMinute(minute);
		this.setHour(hour);
		this.setDay(day);
		this.setMonth(month);
		this.setYear(year);
	},

	updateYearRange: function (year, month, day) {
		var lower = this.lowerBound.getFullYear(),
			upper = this.upperBound.getFullYear(),
			i, years = [];

		for (i = lower; i <= upper; i++) {
			years.push(i);
		}

		this.yearSelect.addOptions(years);
	},

	updateMonthRange: function (year, month, day) {
		var useShort = this.useShortDates,
			months;

		months = this.MONTHS.map(function (month) {
			return {
				value: month.value,
				text: useShort ? month.shortLabel : month.longLabel
			};
		});

		this.monthSelect.addOptions(months);
	},

	updateDayRange: function (year, month, day) {
		month = this.MONTHS[month || 0];

		var lower = 1,
			upper = this.self.isLeapYear(year) && month.leapDays ? month.leapDays : month.days,
			days = [], i;

		for (i = lower; i <= upper; i++) {
			days.push(i);
		}

		this.daySelect.addOptions(days);
	},

	setYear: function (year) {
		this.yearSelect.removeError();
		this.clearDateError();

		if (!year) {
			this.yearSelect.setValue('');
			return;
		}

		var range = this.yearSelect.getOptions();

		if (range.indexOf(year) >= 0) {
			year = year;
		} else if (range[0] > year) {
			year = range[0];
		} else if (range.last() < year) {
			year = range.last();
		}

		this.yearSelect.setValue(year);
	},

	setMonth: function (month) {
		this.monthSelect.removeError();
		this.clearDateError();

		if (month === undefined) {
			this.monthSelect.setValue('');
			return;
		}

		var range = this.monthSelect.getOptions();

		if (range.indexOf(month) >= 0) {
			month = month;
		} else if (range[0] > month) {
			month = range[0];
		} else if (range.last() < month) {
			month = range.last();
		}

		this.monthSelect.setValue(month);
	},

	setDay: function (day) {
		this.daySelect.removeError();
		this.clearDateError();

		if (!day) {
			this.daySelect.setValue('');
			return;
		}

		var range = this.daySelect.getOptions();

		if (range.indexOf(day) >= 0) {
			day = day;
		} else if (range[0] > day) {
			day = range[0];
		} else if (range.last() < day) {
			day = range.last();
		}

		this.daySelect.setValue(day);
	},

	setHour: function (hour) {
		this.hourInput.removeCls('error');
		this.clearTimeError();

		if (hour < 12) {
			this.meridiemSelect.setValue(this.AM);
		} else {
			hour = hour - 12;
			this.meridiemSelect.setValue(this.PM);
		}

		this.meridiemSelect.enable();

		this.hourInput.dom.value = hour === 0 ? '12' : hour;
	},

	setMinute: function (minute) {
		this.minuteInput.removeCls('error');
		this.clearTimeError();

		if (minute < 10) {
			minute = '0' + minute;
		}

		this.minuteInput.dom.value = minute;
	},

	onYearChanged: function (year) {


		this.setMonth(this.getMonth());
		this.setDay(this.getDay());

		this.clearDateError();

		if (this.onChange) {
			this.onChange();
		}
	},

	onMonthChanged: function (month) {
		this.updateDayRange(this.getYear(), month, this.getDay());

		this.setDay(this.getDay());

		this.clearDateError();

		if (this.onChange) {
			this.onChange();
		}
	},

	onDayChanged: function (day) {
		this.clearDateError();

		if (this.onChange) {
			this.onChange();
		}
	},

	onHourChanged: function (hour) {
		var hour = this.hourInput.dom.value,
			meridiem = this.meridiemSelect.getValue();

		if (!meridiem) {
			this.meridiemSelect.setValue(this.AM);
			meridiem = this.AM;
		}

		if (hour > 12) {
			this.meridiemSelect.setValue(this.PM);
			this.meridiemSelect.disable();
		} else if (hour === 0) {
			this.meridiemSelect.setValue(this.AM);
			this.meridiemSelect.disable();
		} else {
			this.meridiemSelect.enable();
		}

		if (this.onChange) {
			this.onChange();
		}
	},

	onMinuteChanged: function (minute) {
		if (this.onChange) {
			this.onChange();
		}
	},


	onMeridiemChanged: function (meridiem) {
		if (this.onChange) {
			this.onChange();
		}
	},

	showDateError: function (error) {
		this.dateError.update(error);
	},

	clearDateError: function () {
		this.dateError.update('');
	},

	showTimeError: function (error) {
		this.timeError.update(error);
		this.timeLabel.addCls('error');
	},

	clearTimeError: function () {
		this.timeError.update('');
		this.timeLabel.removeCls('error');
	},

	onInvalidDate: function () {
		this.showDateError(this.invalidDateMsg);
	},

	onInvalidTime: function () {
		this.showTimeError(this.invalidTimeMsg);
	},

	onDateToLow: function () {
		this.showDateError(this.dateToLowMsg || 'Please enter a date after ' + Ext.Date.format(this.lowerBound, 'F n, Y g:i A'));
	},

	onDateToHigh: function () {
		this.showDateError(this.dateToHighMsg || 'Please enter a date before ' + Ext.Date.format(this.upperBound, 'F n, Y g:i A'));
	},

	__validateValue: function (value) {
		var isValid = true;

		if (this.lowerBound && value < this.lowerBound) {
			isValid = false;
			this.onDateToLow();
		} else if (this.upperBound && value > this.upperBound) {
			isValid = false;
			this.onDateToHigh();
		}

		return isValid;
	},

	__validateNoValue: function (year, month, day, hour, minute) {
		//If all the values are null, then the value is null and its valid
		if (year == null && month == null && day == null && hour == null && minute == null) {
			return true;
		}

		if (year == null || month == null || day == null) {
			this.onInvalidDate();
		}

		if (year == null) {
			this.yearSelect.showError();
		}

		if (month == null) {
			this.monthSelect.showError();
		}

		if (day == null) {
			this.daySelect.showError();
		}

		if (hour > 24 || minute > 59) {
			this.onInvalidTime();
		}

		if (hour > 24) {
			this.hourInput.addCls('error');
		}

		if (minute > 59) {
			this.minuteInput.addCls('error');
		}


		return false;
	},

	validate: function () {
		var year = this.getYear(),
			month = this.getMonth(),
			day = this.getDay(),
			hour = this.getHours(),
			minute = this.getMinutes(),
			value = this.getSelectedDate(),
			isValid;

		if (value) {
			isValid = this.__validateValue(value);
		} else {
			isValid = this.__validateNoValue(year, month, day, hour, minute);
		}

		return isValid;
	}
});
