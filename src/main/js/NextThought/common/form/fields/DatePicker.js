Ext.define('NextThought.common.form.fields.DatePicker', {
	extend: 'Ext.Component',
	alias: 'widget.date-picker-field',

	cls: 'nti-date-picker',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'date-container'},
		{tag: 'tpl', 'if': 'timePicker', cn: [
			{cls: 'time-container', cn: [
				{cls: 'error'},
				{ tag: 'input', cls: 'hour', name: 'hour', value: '11', min: 0, max: 24},
				{ tag: 'span', cls: 'divider', html: ':'},
				{ tag: 'input', cls: 'minute', name: 'minute', value: '59', min: 0, max: 59},
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
		meridiemEl: '.meridiem',
		errorEl: '.error'
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
			this.hourEl.dom.addEventListener('blur', this.onDateChange.bind(this));
			this.hourEl.dom.addEventListener('focus', this.clearError.bind(this));
			this.hourEl.dom.addEventListener('mousewheel', function(e){ e.preventDefault(); });
			this.hourEl.dom.addEventListener('keydown', this.onKeyDown.bind(this));
		}

		if (this.minuteEl) {
			this.minuteEl.dom.addEventListener('blur', this.onDateChange.bind(this));
			this.minuteEl.dom.addEventListener('focus', this.clearError.bind(this));
			this.minuteEl.dom.addEventListener('mousewheel', function(e){ e.preventDefault(); });
		}

		this.setValue(this.defaultValue);
		this.errorEl.hide();
	},


	createDatePicker: function() {
		var picker = Ext.widget({
			xtype: 'datepicker',
	        minDate: this.minDate,
	        handler: this.onDateChange.bind(this),
	        monthYearText: '',
	        showMonthPicker: function() {}, //Override this to not show anything
	        handleMouseWheel: function() {}	// Override ExtJS mousewheel callbacks.
		});

		this.on('destroy', picker.destroy.bind(picker));
		return picker;
	},


	onKeyDown: function(e){
		var key = e.keyCode,
			target = e.target,
			el = Ext.get(target),
			name = target && target.getAttribute('name')
			nextEl = this.minuteEl;

		if (key === e.ENTER || key === e.TAB || this.isDelimiter(key)) {
			if (key !== e.TAB) {
				wait().then(nextEl.focus.bind(nextEl));
				e.preventDefault();
				e.stopPropagation();
				return false;
			}
		}
	},


	isDelimiter: function(key) {
		return key === 188 || key === 186;
	},


	onDateChange: function(picker, date) {

		if (this.isValid()) {
			if (this.TimePicker) {
				this.onTimeChange();
			}

			// Broadcast the change.
			if (this.dateChanged) {
				this.dateChanged();
			}	
		}
		else {
			this.showErrors();
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

		// 0 hour is equivalent to 12 when we have AM/PM.
		if (hour === 0) {
			hour = 12;
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
					
					// Fire a change event
					me.onDateChange(me.datepicker, me.datepicker.value);
				}

				// TODO: Set Hour and Minute
				if (me.hourEl) {
					me.hourEl.dom.value = hour;
				}

				if (me.minuteEl) {
					me.minuteEl.dom.value = minute;
				}

				// Set AM/PM
				me.setMeridiem(m);
			});
	},


	setMeridiem: function(value) {
		if (this.meridiemEl && value) {
			this.meridiemEl.dom.setAttribute('data-value', value);
			this.meridiemEl.setHTML(value.toUpperCase());	
		}
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

		// this.onTimeChange();
		hour = parseInt(hour);
		minutes = parseInt(minutes);
		meridiemVal = meridiemVal && meridiemVal.toUpperCase();

		date = Ext.Date.format(p.getValue(), 'F d');
		return date + ' at ' + hour + ':' + minutes + ' ' + meridiemVal;
	},


	onTimeChange: function() {
		var p = this.datepicker,
			hour = this.hourEl && this.hourEl.dom.value,
			minutes = this.minuteEl && this.minuteEl.dom.value,
			meridiemVal = this.meridiemEl && this.meridiemEl.dom.getAttribute('data-value'),
			date;

		hour = parseInt(hour);
		minutes = parseInt(minutes);

		if (hour > 12) {
			hour = hour % 12;
			this.setMeridiem('pm');
		}
		
		if (hour === 0) {
			hour = 12;
			this.setMeridiem('am');
		}

		// Get two digit format
		hour = ('0' + hour).slice(-2);
		minutes = ('0' + minutes).slice(-2);

		this.hourEl.dom.value = hour;
		this.minuteEl.dom.value = minutes;
	},


	isValid: function() {
		var fields = [this.hourEl.dom, this.minuteEl.dom],
			field, isValid = true, min, max, val;

		for (var i = 0; i < fields.length && isValid; i++) {
			field = fields[i];
			min = field.getAttribute('min');
			max = field.getAttribute('max');
			val = field.value;

			val = parseInt(val);
			if (isNaN(val) || val > max || val < min) {
				isValid = false;
			}
		}

		return isValid;
	},


	getErrors: function() {
		var fields = [this.hourEl.dom, this.minuteEl.dom],
			field, isValid = true, min, max, val,
			validity, errors = [], name, d;
			
		for (var i = 0; i < fields.length; i++) {
			field = fields[i];
			min = field.getAttribute('min');
			max = field.getAttribute('max');
			name = field.getAttribute('name');
			val = field.value;

			val = parseInt(val);
			if (isNaN(val)) {
				errors.push({name: name, error: 'Invalid number for ' + name});
			}
			if (val > max || val < min) {
				errors.push({name: name, error: 'The value for ' + name + ' is out of range'});
			}
		}

		return errors;
	},


	showErrors: function(){
		var errors = this.getErrors(), name, el;
		for (var i = 0; i < errors.length; i++) {
			name = errors[i].name;
			el = this.el.down('input[name='+name+']');
			if (el) {
				el.addCls('has-error');
			}

			if (errors[i].error) {
				this.errorEl.update(errors[i].error);
				this.errorEl.show();
			}
		}
	},


	clearError: function(e){
		var dom = e && e.target;
		if (Ext.fly(dom).hasCls('has-error')) {
			Ext.fly(dom).removeCls('has-error');
			this.errorEl.update('');
			this.errorEl.hide();
		}		
	},


	clearAllErrors: function(){
		this.hourEl.removeCls('has-error');
		this.minuteEl.removeCls('has-error');
		this.errorEl.update('');
		this.errorEl.hide();
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

		// Handling the am/pm intrication. 
		if (meridiemVal === 'pm' && hour < 12) {
			hour = hour + 12;
		}

		if (meridiemVal === 'am' && hour === 12) {
			hour = 0;
		} 

		t = hour * 3600 * 1000 + minutes * 60 * 1000;
		return isNaN(t) ? 0 : t;
	},

	setMaxDate: function(date){
		this.datepicker.setMaxDate(date);
	},

	setMinDate: function(date){
		this.datepicker.setMinDate(date);
	}

});
