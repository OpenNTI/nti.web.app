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

	renderSelectors: {
		dateContainerEl: '.date-container',
		dateEl: '.date',
		hourEL: 'input.hour',
		minuteEl: 'input.minute',
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

		if (this.meridiemContainerEl) {
			this.mon(this.meridiemContainerEl, {
				'click': this.showMeridiemPicker.bind(this)
			});
		}

		if (this.hourEl) {
			this.hourEl.dom.addEventListener('keyup', this.timeChanged.bind(this));
		}
		if (this.minuteEl) {
			this.minuteEl.dom.addEventListener('keyup', this.timeChanged.bind(this));
		}

		this.setValue(this.defaultValue);
	},


	createDatePicker: function() {
		var picker = Ext.widget({
			xtype: 'datepicker',
	        minDate: new Date(),
	        handler: this.onDateChange.bind(this),
	        handleMouseWheel: function(){}	// Override ExtJS mousewheel callbacks. 
		});

		this.on('destroy', picker.destroy.bind(picker));
		return picker;
	},


	onDateChange: function(picker, date) {
		// Broadcast the change.
		if (this.dateChanged) {
			this.dateChanged();
		}
	},


	timeChanged: function() {
		// Broadcast the change.
		if (this.formChanged) {
			this.formChanged();
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
		if (this.dateEl) {
			v = this.dateEl.dom.getAttribute('data-value');
			date = v && new Date(v);
			if (date) {
				return date.getTime();
			}
		}

		return 0;
	},


	getTimeMilliseconds: function() {
		var v, time,
			timeVal = this.timeEl && this.timeEl.dom.value,
			meridiemVal = this.meridiemEl && this.meridiemEl.dom.getAttribute('data-value'),
			hour = 0, minute = 0, t, parts;

		parts = (timeVal || '').split(':');
		hour = parts[0];
		hour = parseInt(hour);

		minute = parts[1];
		minute = parseInt(minute);

		if (meridiemVal === 'pm') {
			hour = hour + 12;
		}

		t = hour * 3600 * 1000 + minute * 60 * 1000;
		return isNaN(t) ? 0 : t;
	}


});
