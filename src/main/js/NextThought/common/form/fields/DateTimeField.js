Ext.define('NextThought.common.form.fields.DateTimeField', {
	extend: 'Ext.Component',
	alias: 'widget.date-time-field',

	statics: {
		//http://stackoverflow.com/questions/16353211/check-if-year-is-leap-year-in-javascript
		isLeapYear: function(year) {
			return ((year % 4 === 0) && (year % 100 != 0)) || (year % 400 === 0);
		}
	},

	requires: [
		'NextThought.common.form.fields.SearchComboBox',
		'NextThought.common.form.Utils'
	],

	AM: 'AM',
	PM: 'PM',

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
				{tag: 'input', type: 'text', cls: 'hour-input'},
				{tag: 'span', cls: 'seperator', html: ':'},
				{tag: 'input', type: 'test', cls: 'minute-input'},
				{cls: 'meridiem-input'}
			]},
			{tag: 'span', cls: 'error'}
		]}
	]),


	renderSelectors: {
		monthContainer: '.month-input',
		dayContainer: '.day-input',
		yearContainer: '.year-input',
		hourInput: '.hour-input',
		minuteInput: '.minute-input',
		meridiemContainer: '.meridiem-input',
		dateError: '.date .error',
		timeError: '.time .error'
	},


	initComponent: function() {
		this.callParent(arguments);

		var upperBound;

		upperBound = new Date();
		upperBound.setFullYear(upperBound.getFullYear() + 5);

		this.currentDate = this.currentDate || new Date();
		this.lowerBound = this.lowerBound || new Date(0);
		this.upperBound = this.upperBound || upperBound;

		this.FormUtils = new NextThought.common.form.Utils();
	},


	afterRender: function() {
		this.callParent(arguments);

		var selectedDate = this.getSelectedDate();

		this.yearSelect = new NextThought.common.form.fields.SearchComboBox({
			onSelect: this.onYearChanged.bind(this),
			renderTo: this.yearContainer
		});

		this.monthSelect = new NextThought.common.form.fields.SearchComboBox({
			onSelect: this.onMonthChanged.bind(this),
			renderTo: this.monthContainer
		});

		this.daySelect = new NextThought.common.form.fields.SearchComboBox({
			onSelect: this.onDayChanged.bind(this),
			renderTo: this.dayContainer
		});

		this.meridiemSelect = new NextThought.common.form.fields.SearchComboBox({
			options: this.getMeridiemRange(),
			onSelect: this.onMeridiemChanged.bind(this),
			renderTo: this.meridiemContainer
		});

		this.FormUtils.limitInputToNumeric(this.hourInput.dom);
		this.FormUtils.limitInputToNumeric(this.minuteInput.dom);

		this.mon(this.hourInput, {
			change: this.onHourChanged.bind(this)
		});

		this.mon(this.minuteInput, {
			change: this.onMinuteChanged.bind(this)
		});

		this.selectDate(selectedDate);
	},


	maybeShowDateError: function() {

	},


	maybeShowTimeError: function() {
		var hour = this.hourInput.dom.value,
			minute = this.minuteInput.dom.value,
			error;

		hour = parseInt(hour, 10);
		minute = parseInt(minute, 10);

		if (hour < 0 || hour > 24) {
			error = 'Invalid Hour';
			this.hourInput.addCls('error');
		} else {
			this.hourInput.removeCls('error');
		}

		if (minute < 0 || minute > 59) {
			error = 'Invalid Minute';
			this.minuteInput.addCls('error');
		} else {
			this.minuteInput.removeCls('error');
		}

		if (error) {
			this.timeError.update(error);
		} else {
			this.timeError.update('');
		}

		return !!error;
	},


	validate: function() {
		var timeError = this.maybeShowTimeError(),
			dateError = this.maybeShoeDateError();

		return timeError || dateError;
	},


	getSelectedDate: function() {
		return new Date(this.currentDate.getTime());
	},


	getYearRange: function() {
		var lower = this.lowerBound.getFullYear(),
			upper = this.upperBound.getFullYear(),
			years = [], i;

		for (i = lower; i <= upper; i++) {
			years.push(i);
		}

		return years;
	},


	getMonthRange: function(year) {
		var useShort = this.shortDates,
			lower = 0, upper = 11;

		//If the year is on the boundary, don't let the month go past it
		if (this.lowerBound.getFullYear() === year) {
			lower = this.lowerBound.getMonth();
		} else if (this.upperBound.getFullYear() === year) {
			upper = this.upperBound.getMonth();
		}

		return this.MONTHS.slice(lower, upper + 1).map(function(month) {
			return {
				value: month.value,
				text: useShort ? month.shortLabel : month.longLabel
			};
		});
	},


	getDayRange: function(month, year) {
		month = this.MONTHS[month];

		var lower = 1,
			upper = this.self.isLeapYear(year) && month.leapDays ? month.leapDays : month.days,
			days = [], i;

		if (this.lowerBound.getFullYear() === year && this.lowerBound.getMonth() === month.value) {
			lower = this.lowerBound.getDate();
		} else if (this.upperBound.getFullYear() === year && thhis.upperBound.getMonth() === month.value) {
			upper = this.upperBound.getDate();
		}

		for (i = lower; i <= upper; i++) {
			days.push(i);
		}

		return days;
	},


	getMeridiemRange: function() {
		return [this.AM, this.PM];
	},


	selectDate: function(date) {
		if (date < this.lowerBound) {
			date = this.lowerBound;
		} else if (date > this.upperBound) {
			date = this.upperBound;
		}

		var year = date.getFullYear(),
			month = date.getMonth(),
			day = date.getDate();

		this.currentDate = date;

		this.updateYearRange();
		this.updateMonthRange(year);
		this.updateDayRange(month, year);

		this.selectYear(year);
		this.selectMonth(month);
		this.selectDay(day);

		this.selectHour(date.getHours());
		this.selectMinute(date.getMinutes());
	},


	updateYearRange: function() {
		var range = this.getYearRange(),
			current = this.yearSelect.getValue();

		this.yearSelect.setOptions(range);

		if (current) {
			this.selectYear(current);
		}
	},


	updateMonthRange: function(year) {
		var range = this.getMonthRange(year),
			current = this.monthSelect.getValue();

		this.monthSelect.setOptions(range);

		if (current) {
			this.selectMonth(current);
		}
	},


	updateDayRange: function(month, year) {
		var range = this.getDayRange(month, year),
			current = this.daySelect.getValue();

		this.daySelect.setOptions(range);

		if (current) {
			this.selectDay(current);
		}
	},


	selectYear: function(year) {
		var options = this.yearSelect.getOptions();

		if (!year) {
			year = options[0];
		} else if (options.indexOf(year) >= 0) {
			year = year;
		} else if (year < options[0]) {
			year = options[0];
		} else if (year > options.last()) {
			year = options.last();
		}

		this.yearSelect.setValue(year);
	},


	selectMonth: function(month) {
		var options = this.monthSelect.getOptions();

		if (!month) {
			month = options[0];
		} else if (options.indexOf(month) >= 0) {
			month = month;
		} else if (month < options[0]) {
			month = options[0];
		} else if (month > options.last()) {
			year = options.last();
		}

		this.monthSelect.setValue(month);
	},


	selectDay: function(day) {
		var options = this.daySelect.getOptions();

		if (!day) {
			day = options[0];
		} else if (options.indexOf(day) >= 0) {
			day = day;
		} else if (day < options[0]) {
			day = options[0];
		} else if (day > options.last()) {
			day = options.last();
		}

		this.daySelect.setValue(day);
	},


	selectHour: function(hour) {
		if (hour < 12) {
			this.meridiemSelect.setValue(this.AM);
		} else {
			hour = hour - 12;
			this.meridiemSelect.setValue(this.PM);
		}

		this.hourInput.dom.value = hour === 0 ? '12' : hour;
	},


	selectMinute: function(minute) {
		this.minuteInput.dom.value = minute;
	},


	__selectMeridiem: function(date) {

	},


	onYearChanged: function(year) {
		var currentDate = this.getSelectedDate(),
			newDate = new Date(currentDate.getTime());

		//If the year hasn't changed don't do anything
		if (newDate.getFullYear() !== year) {
			newDate.setFullYear(year, 0, 1);
			this.currentDate = newDate;
			this.updateMonthRange(newDate.getFullYear());
			// this.updateDayRange(newDate.getMonth(), newDate.getFullYear());
		}
	},

	onMonthChanged: function(month) {
		var currentDate = this.getSelectedDate(),
			newDate = new Date(currentDate.getTime());

		//If the month hasn't changed don't do anything
		if (newDate.getMonth() !== month) {
			newDate.setMonth(month, 1);
			this.currentDate = newDate;
			this.updateDayRange(newDate.getMonth(), newDate.getFullYear());
		}
	},


	onDayChanged: function(day) {
		var currentDate = this.getSelectedDate(),
			newDate = new Date(currentDate.getTime());

		//If the month hasn't changed dont' do anything
		if (newDate.getDate() !== day) {
			newDate.setDate(day);
			this.currentDate = newDate;
		}
	},


	onHourChanged: function() {
		var value = this.hourInput.dom.value,
			currentDate = this.getSelectedDate(),
			newDate = new Date(currentDate.getTime()),
			meridiem = this.meridiemSelect.getValue();

		value = parseInt(value, 10);

		if (!value) { return; }

		if (this.maybeShowTimeError()) {
			return;
		}

		if (!meridiem) {
			meridiem.setValue(this.AM);
			meridiem = this.AM;
		}


		if (value > 12) {
			this.meridiemSelect.setValue(this.PM, true);
			this.meridiemSelect.disable();
		} else if (value === 0) {
			this.meridiemSelect.setValue(this.AM, true);
			this.meridiemSelect.disable();
		} else {
			if (meridiem === this.PM) {
				value = value + 12;
			} else if (value === 12) {
				value = 0;
			}

			this.meridiemSelect.enable();
		}

		newDate.setHours(value);
		this.currentDate = newDate;
	},


	onMinuteChanged: function() {
		var value = this.minuteInput.dom.value,
			currentDate = this.getSelectedDate(),
			newDate = new Date(currentDate.getTime());

		value = parseInt(value, 10);

		if (this.maybeShowTimeError()) {
			return;
		}

		newDate.setMinutes(value);
		this.currentDate = newDate;
	},


	onMeridiemChanged: function() {
		this.onHourChanged();
	}
});
