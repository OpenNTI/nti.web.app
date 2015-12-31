Ext.define('NextThought.common.form.fields.DatePicker', {
	extend: 'Ext.Component',
	alias: 'widget.date-picker-field',

	cls: 'nti-date-picker',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'date-container'},
		{tag: 'tpl', 'if': 'timePicker', cn: [
			{cls: 'time-container', cn: [
				{ tag: 'input', cls: 'hour', value: '11'},
				{ tag: 'span', cls: 'divider', html: ':'},
				{ tag: 'input', cls: 'minute', value: '59'},
				{ tag: 'span', cls: 'meridiem', name: 'meridiem', html: 'PM', 'date-value': 'pm'}
			]}
		]}
	]),

	TimePicker: true,

	minDate: null,

	renderSelectors: {
		dateContainerEl: '.date-container',
		dateEl: '.date',
		hourEl: '.hour',
		minuteEl: '.minute',
		meridiemEl: '.meridiem'
	},

	beforeRender: function() {
		this.callParent(arguments);

		var today = Ext.Date.format(new Date(), 'F j, Y');
		this.renderData = Ext.apply(this.renderData || {}, {
			displayName: this.displayName,
			timePicker: this.TimePicker,
			date: today
		});
	},

	afterRender: function() {
		this.callParent(arguments);

		if (this.dateContainerEl) {
			this.datepicker = this.createDatePicker();
			this.datepicker.render(this.dateContainerEl);
		}

		if (this.meridiemEl) {
			this.mon(this.meridiemEl, {
				'click': this.showMeridiemPicker.bind(this)
			});
		}

		if (this.hourEl) {
			this.hourEl.dom.addEventListener('keyup', this.onDateChange.bind(this));
		}
		if (this.minuteEl) {
			this.minuteEl.dom.addEventListener('keyup', this.onDateChange.bind(this));
		}

		this.setValue(this.defaultValue);
	},


	createDatePicker: function() {
		var picker = Ext.widget({
			xtype: 'datepicker',
	        minDate: this.minDate,
	        handler: this.onDateChange.bind(this),
	        handleMouseWheel: function(){}	// Override ExtJS mousewheel callbacks. 
		});

		this.on('destroy', picker.destroy.bind(picker));
		return picker;
	},


	onDateChange: function(picker, date) {
		this.validateDate();
		// Broadcast the change.
		if (this.dateChanged) {
			this.dateChanged();
		}
	},


	showMeridiemPicker: function() {
		if (!this.meridiemMenu) {
			this.meridiemMenu = this.createMeridiemMenu();
		}

		if (this.meridiemMenu.isVisible()) {
			this.meridiemMenu.hide();
		}
		else {
			this.meridiemMenu.showBy(this.meridiemEl, 'tl-bl?');
		}
	},


	createMeridiemMenu: function() {
		var me = this,
			menu = Ext.widget('menu', {
					defaults: {
						ui: 'nt-menuitem',
						xtype: 'menucheckitem',
						plain: true,
						group: 'meridiem-group',
						handler: function(item) {
							me.handleMeridiemMenuClick(item, item.up('.menu'));
						}
					},
					width: 75,
					items: [
						{ text: 'AM', value: 'am'},
						{ text: 'PM', value: 'pm'}
					]
				});

		this.on('destroy', menu.destroy.bind(menu));
		return menu;
	},


	handleMeridiemMenuClick: function(item, menu) {
		var targetEl = this.meridiemEl;
		if (targetEl) {
			targetEl.setHTML(item.text);
			targetEl.dom.setAttribute('data-value', item.value);
		}

		// Broadcast the change.
		if (this.formChanged) {
			this.formChanged();
		}
	},

	setValue: function(value) {
		var date = new Date(value),
			me = this, dateString, hour, minute, m = 'am';

		if (isNaN(date)) { return; }

		dateString = Ext.Date.format(date, 'F j, Y');
		hour = date.getHours();
		minute = date.getMinutes();

		if (hour > 12) {
			hour = hour % 12;
			m = 'pm';
		}

		// Get two digit format
		hour = ('0' + hour).slice(-2);
		minute = ('0' + minute).slice(-2);

		this.onceRendered
			.then(function() {
				var b = Ext.Date.format(date, 'n/j/Y'),
					dateOnly = new Date(b);

				// Set date
				if (me.datepicker) {
					me.datepicker.setValue(dateOnly);
				}

				// TODO: Set Hour and Minute
				if (me.hourEl) {
					me.hourEl.dom.value = hour;
				}

				if (me.minuteEl) {
					me.minuteEl.dom.value = minute;
				}

				// Set AM/PM
				if (me.meridiemEl && m) {
					me.meridiemEl.dom.setAttribute('data-value', m);
					me.meridiemEl.setHTML(m.toUpperCase());
				}
			});

	},


	/**
	 * Get the timestamp in seconds.
	 * @return {Number} Timestamp in seconds.
	 */
	getValue: function() {
		var millis = this.getMilliseconds();
		return millis / 1000;
	},


	/**
	 * Display text for the selected date.
	 * @return {[type]} [description]
	 */
	getDisplayValue: function() {
		var p = this.datepicker,
			hour = this.hourEl && this.hourEl.dom.value,
			minutes = this.minuteEl && this.minuteEl.dom.value,
			meridiemVal = this.meridiemEl && this.meridiemEl.dom.getAttribute('data-value'),
			date;

		this.validateDate();
		hour = parseInt(hour);
		minutes = parseInt(minutes);
		meridiemVal = meridiemVal && meridiemVal.toUpperCase();

		date = Ext.Date.format(p.getValue(), 'F d');
		return date + ' at ' + hour + ':' + minutes + ' ' + meridiemVal;
	},


	validateDate: function(){
		var p = this.datepicker,
			hour = this.hourEl && this.hourEl.dom.value,
			minutes = this.minuteEl && this.minuteEl.dom.value,
			meridiemVal = this.meridiemEl && this.meridiemEl.dom.getAttribute('data-value'),
			date;

		if (!this.TimePicker) {
			return;
		}		

		hour = parseInt(hour);
		minutes = parseInt(minutes);

		if (isNaN(hour) || hour > 12 || hour < 1) {
			this.hourEl.addCls('error');
		}

		if (isNaN(minutes) || minutes > 59 || minutes < 0) {
			this.minuteEl.addCls('error');
		}
	},


	/**
	 * Get the timestamp value time.
	 * @return {Number} timestamp in milliseconds.
	 */
	getMilliseconds: function() {
		if (this.TimePicker) {
			return this.getDateMilliseconds() + this.getTimeMilliseconds();
		}

		return this.getDateMilliseconds();
	},


	getDateMilliseconds: function() {
		var v, date;
		if (this.datepicker) {
			return this.datepicker.getValue().getTime();
		}

		return 0;
	},


	getTimeMilliseconds: function() {
		var v, time,
			hour = this.hourEl && this.hourEl.dom.value,
			minutes = this.minuteEl && this.minuteEl.dom.value,
			meridiemVal = this.meridiemEl && this.meridiemEl.dom.getAttribute('data-value'),
			t;

		hour = parseInt(hour);
		minutes = parseInt(minutes);

		if (meridiemVal === 'pm') {
			hour = hour + 12;
		}

		t = hour * 3600 * 1000 + minutes * 60 * 1000;
		return isNaN(t) ? 0 : t;
	}

});
