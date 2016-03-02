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

	YEARS_IN_PAST: 5,
	YEARS_IN_FUTURE: 5,


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

		var upperBound,
			lowerBound;

		lowerBound = new Date();
		lowerBound.setFullYear(lowerBound.getFullYear() - this.YEARS_IN_PAST);

		upperBound = new Date();
		upperBound.setFullYear(upperBound.getFullYear() + this.YEARS_IN_FUTURE);

		this.currentDate = this.currentDate;
		this.lowerBound = this.lowerBound || lowerBound;
		this.upperBound = this.upperBound || upperBound;

		this.FormUtils = new NextThought.common.form.Utils();
	},


	afterRender: function() {
		this.callParent(arguments);

		var me = this;

		me.yearSelect = new NextThought.common.form.fields.SearchComboBox({
			onSelect: me.onYearChanged.bind(me),
			renderTo: me.yearContainer
		});

		me.monthSelect = new NextThought.common.form.fields.SearchComboBox({
			onSelect: me.onMonthChanged.bind(me),
			renderTo: me.monthContainer
		});

		me.daySelect = new NextThought.common.form.fields.SearchComboBox({
			onSelect: me.onDayChanged.bind(me),
			renderTo: me.dayContainer
		});

		me.meridiemSelect = new NextThought.common.form.fields.SearchComboBox({
			options: [this.AM, this.PM],
			onSelect: me.onMeridiemChanged.bind(me),
			renderTo: me.meridiemContainer
		});

		me.FormUtils.limitInputToNumeric(me.hourInput.dom);
		me.FormUtils.limitInputToNumeric(me.minuteInput.dom);

		me.mon(me.hourInput, {
			change: me.onHourChanged.bind(me)
		});

		me.mon(me.minuteInput, {
			change: me.onMinuteChanged.bind(me)
		});

		me.on('destroy', function() {
			me.yearSelect.destroy();
			me.monthSelect.destroy();
			me.daySelect.destroy();
			me.meridiemSelect.destroy();
		});

		me.selectDate(me.currentDate);
	},


	getSelectedDate: function() {
		var year = this.getYear(),
			month = this.getMonth(),
			day = this.getDay(),
			hour = this.getHour(),
			minutes = this.getMinutes();

		function isDefined(v) {
			return v !== undefined && v !== null;
		}

		if (isDefined(year) && isDefined(month) && isDefined(day)) {
			return new Date(year, month, day, hour || 0, minutes || 0);
		}

		return null;
	},


	getYear: function() {
		return this.yearSelect && this.yearSelect.getValue();
	},


	getMonth: function() {
		return this.monthSelect && this.monthSelect.getValue();
	},


	getDay: function() {
		return this.daySelect && this.daySelect.getValue();
	},


	getHour: function() {
		var value = this.hourInput && this.hourInput.dom && this.hourInput.dom.value,
			meridiem = this.meridiemSelect.getValue() || this.AM;

		if (value === undefined || value === null) {
			return null;
		}

		if (meridiem === this.AM && value === 12) {
			value = 0;
		} else if (value > 12) {
			value = value + 12;
		}

		return value;
	},


	getMinutes: function() {
		return this.minuteInput && this.minuteInput.dom && this.minuteInput.dom.value;
	},


	selectDate: function(date) {
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


	setValues: function(year, month, day, hour, minute) {
		year = year === undefined || year === null ? this.getYear() : year;
		month = month === undefined || month === null ? this.getMonth() : month;
		day = day === undefined || day === null ? this.getDay() : day;
		hour = hour === undefined || hour === null ? this.getHour() : hour;
		minute = minute === undefined || minute === null ? this.getMinutes() : minute;

		this.updateYearRange(year, month, day);
		this.updateMonthRange(year, month, day);
		this.updateDayRange(year, month, day);

		this.setMinute(minute);
		this.setHour(hour);
		this.setDay(day);
		this.setMonth(month);
		this.setYear(year);
	},


	updateYearRange: function(year, month, day) {
		var lower = this.lowerBound.getFullYear(),
			upper = this.upperBound.getFullYear(),
			i, years = [];

		for (i = lower; i <= upper; i++) {
			years.push(i);
		}

		this.yearSelect.setOptions(years);
	},


	updateMonthRange: function(year, month, day) {
		var useShort = this.useShortDates,
			months;

		months = this.MONTHS.map(function(month) {
			return {
				value: month.value,
				text: useShort ? month.shortLabel : month.longLabel
			};
		});

		this.monthSelect.setOptions(months);
	},


	updateDayRange: function(year, month, day) {
		month = this.MONTHS[month || 0];

		var lower = 1,
			upper = this.self.isLeapYear(year) && month.leapDays ? month.leapDays : month.days,
			days = [], i;

		for (i = lower; i <= upper; i++) {
			days.push(i);
		}

		this.daySelect.setOptions(days);
	},


	setYear: function(year) {
		if (!year) {
			this.yearSelect.setValue('');
			return;
		}

		var range = this.yearSelect.getOptions();

		if (range.indexOf(year)) {
			year = year;
		} else if (range[0] > year) {
			year = range[0];
		} else if (range.last() < year) {
			year = range.last();
		}

		this.yearSelect.setValue(year);
	},


	setMonth: function(month) {
		if (month === undefined) {
			this.monthSelect.setValue('');
			return;
		}

		var range = this.monthSelect.getOptions();

		if (range.indexOf(month)) {
			month = month;
		} else if (range[0] > month) {
			month = range[0];
		} else if (range.last() < month) {
			month = range.last();
		}

		this.monthSelect.setValue(month);
	},


	setDay: function(day) {
		if (!day) {
			this.daySelect.setValue('');
			return;
		}

		var range = this.daySelect.getOptions();

		if (range.indexOf(day)) {
			day = day;
		} else if (range[0] > day) {
			day = range[0];
		} else if (range.last() < day) {
			day = range.last();
		}

		this.daySelect.setValue(day);
	},


	setHour: function(hour) {
		if (hour < 12) {
			this.meridiemSelect.setValue(this.AM);
		} else {
			hour = hour - 12;
			this.meridiemSelect.setValue(this.PM);
		}

		this.hourInput.dom.value = hour === 0 ? '12' : hour;
	},


	setMinute: function(minute) {
		this.minuteInput.dom.value = minute;
	},


	onYearChanged: function(year) {
		this.setMonth(this.getMonth());
		this.setDay(this.getDay());
	},


	onMonthChanged: function(month) {
		this.setDay(this.getDay());
	},


	onDayChanged: function(day) {},


	onHourChanged: function(hour) {
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
	},


	onMinuteChanged: function(minute) {},


	onMeridiemChanged: function(meridiem) {}
});
