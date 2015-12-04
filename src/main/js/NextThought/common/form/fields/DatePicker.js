Ext.define('NextThought.common.form.fields.DatePicker', {
	extend: 'Ext.Component',
	alias: 'widget.date-picker-field',

	cls: 'date-picker-field',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'date-container part', cn: [
			{ cls: 'date', html: '{date}', 'data-value': '{date}'}
		]},
		{tag: 'tpl', 'if': 'timePicker', cn: [
			{cls: 'hour-container part', cn: [
				{ cls: 'hour', name: 'hour', html: 'Hour'}
			]},
			{cls: 'minute-container part', cn: [
				{ cls: 'minute', name: 'minute', html: 'Min'}
			]},
			{cls: 'meridiem-container part', cn: [
				{ cls: 'meridiem', name: 'meridiem', html: 'AM', 'date-value': 'am'}
			]}
		]}
	]),

	TimePicker: true,

	renderSelectors: {
		dateContainerEl: '.date-container',
		dateEl: '.date',
		hourContainerEl: '.hour-container',
		minuteContainerEl: '.minute-container',
		meridiemContainerEl: '.meridiem-container',
		hourEl: '.hour-container .hour',
		minuteEl: '.minute-container .minute',
		meridiemEl: '.meridiem-container .meridiem'
	},

	beforeRender: function(){
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
			this.mon(this.dateContainerEl, {
				'click': this.showDatePicker.bind(this)
			});	
		}
		
		if ( this.hourContainerEl) {
			this.mon(this.hourContainerEl, {
				'click': this.showHourPicker.bind(this)
			});	
		}

		if (this.minuteContainerEl) {
			this.mon(this.minuteContainerEl, {
				'click': this.showMinutePicker.bind(this)
			});	
		}

		if (this.meridiemContainerEl) {
			this.mon(this.meridiemContainerEl, {
				'click': this.showMeridiemPicker.bind(this)
			});	
		}

		this.createDatePicker();
		if (this.TimePicker) {
			this.hourMenu = this.createHourMenu();	
			this.minuteMenu = this.createMinuteMenu();
		}

		this.setValue(this.defaultValue);
	},


	showDatePicker: function(){
		if (!this.datepicker) {
			this.createDatePicker();
		}
		
		if (!this.datepicker.isVisible()) {
			this.datepicker.showBy(this.dateEl, 'tl-bl?');
		}
		else {
			this.datepicker.hide();
		}
	},


	createDatePicker: function(){
		this.datepicker = Ext.widget({
			xtype: 'datepicker',
	        minDate: new Date(),
	        renderTo: Ext.getBody(),
	        handler: this.dateChanged.bind(this),
	        floating: true
		});

		this.on('destroy', this.datepicker.destroy.bind(this.datepicker));
		this.datepicker.hide();
	},


	dateChanged: function(picker, date){
		if (this.dateEl) {
			this.dateEl.setHTML(Ext.Date.format(date, 'F j, Y'));
			this.dateEl.dom.setAttribute('data-value', date);
		}

		// Broadcast the change.
		if (this.formChanged){
			this.formChanged();
		}
	},


	showHourPicker: function(){
		if (!this.hourMenu) {
			this.hourMenu = this.createHourMenu();
		}

		if (this.hourMenu.isVisible()) {
			this.hourMenu.hide();
		}
		else {
			this.hourMenu.showBy(this.hourContainerEl, 'tl-bl?');			
		}
	},


	createHourMenu: function(){
		var me = this,
			menu = 
				Ext.widget('menu', {
					defaults: {
						ui: 'nt-menuitem',
						xtype: 'menucheckitem',
						plain: true,
						group: 'hour-group',
						handler: function(item) {
							me.handleHourMenuClick(item, item.up('.menu'));
						}
					},
					width: 75,
					items: [
						{ text: '1', value: 1},
						{ text: '2', value: 2},
						{ text: '3', value: 3},
						{ text: '4', value: 4},
						{ text: '5', value: 5},
						{ text: '6', value: 6},
						{ text: '7', value: 7},
						{ text: '8', value: 8},
						{ text: '9', value: 9},
						{ text: '10', value: 10},
						{ text: '11', value: 11},
						{ text: '12', value: 12}
					]
				});

		this.on('destroy', menu.destroy.bind(menu));
		return menu;
	},

	
	handleHourMenuClick: function(item, menu) {
		var targetEl = this.hourEl, item;
		if (targetEl) {
			targetEl.setHTML(item.text);
			targetEl.dom.setAttribute('data-value', item.value);
			if (this.minuteMenu) {
				item = this.minuteMenu.items.getAt(0);
				// Set the first value of the first item of the minute (0 minutes)
				if (item) {
					item.setChecked(true);
					this.handleMinuteMenuClick(item);
				}
			}
		}

		// Broadcast the change.
		if (this.formChanged){
			this.formChanged();
		}
	},


	showMinutePicker: function(){
		if (!this.minuteMenu) {
			this.minuteMenu = this.createMinuteMenu();
		}

		if (this.minuteMenu.isVisible()) {
			this.minuteMenu.hide();
		}
		else {
			this.minuteMenu.showBy(this.minuteContainerEl, 'tl-bl?');			
		}
	},


	createMinuteMenu: function(){
		var me = this,
			menu = 
				Ext.widget('menu', {
					defaults: {
						ui: 'nt-menuitem',
						xtype: 'menucheckitem',
						plain: true,
						group: 'minute-group',
						handler: function(item) {
							me.handleMinuteMenuClick(item, item.up('.menu'));
						}
					},
					width: 75,
					items: [
						{ text: '00', value: 0},
						{ text: '05', value: 5},
						{ text: '10', value: 10},
						{ text: '15', value: 15},
						{ text: '20', value: 20},
						{ text: '25', value: 25},
						{ text: '30', value: 30},
						{ text: '35', value: 35},
						{ text: '40', value: 40},
						{ text: '45', value: 45},
						{ text: '50', value: 50},
						{ text: '55', value: 55}
					]
				});

		this.on('destroy', menu.destroy.bind(menu));
		return menu;
	},


	handleMinuteMenuClick: function(item, menu) {
		var targetEl = this.minuteEl;
		if (targetEl) {
			targetEl.setHTML(item.text);
			targetEl.dom.setAttribute('data-value', item.value);
		}

		// Broadcast the change.
		if (this.formChanged){
			this.formChanged();
		}
	},


	showMeridiemPicker: function(){
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


	createMeridiemMenu: function(){
		var me = this,
			menu = 
				Ext.widget('menu', {
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
		if (this.formChanged){
			this.formChanged();
		}
	},

	setValue: function(value){
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

		this.onceRendered
			.then(function() {
				var b = Ext.Date.format(date, "n/j/Y"), 
					dateOnly = new Date(b);

				me.dateEl.setHTML(dateString);
				me.dateEl.dom.setAttribute('data-value', dateOnly);
				if (me.datepicker) {
					me.datepicker.setValue(dateOnly);
				}

				if (hour !== undefined && me.hourEl) {
					me.hourEl.dom.setAttribute('data-value', hour);
					// We don't want to set the displayed hour to 0. 
					// Change what the user sees. 
					// FIXME: This is a short term fix.
					if (hour < 12 && hour === 0) {
						hour = 12;
					}
					me.hourEl.setHTML(hour);
				}
				if (minute !== undefined && me.minuteEl) {
					me.minuteEl.dom.setAttribute('data-value', minute);
					if (minute === 0) {
						minute = '00';
					}
					me.minuteEl.setHTML(minute);
				}

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
	getMilliseconds: function(){
		if (this.TimePicker) {
			return this.getDateMilliseconds() + this.getTimeMilliseconds();
		}

		return this.getDateMilliseconds();
	},


	getDateMilliseconds: function(){
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


	getTimeMilliseconds: function(){
		var v, time,
			hourVal = this.hourEl && this.hourEl.dom.getAttribute('data-value'),
			minuteVal = this.minuteEl && this.minuteEl.dom.getAttribute('data-value'),
			meridiemVal = this.meridiemEl && this.meridiemEl.dom.getAttribute('data-value'),
			hour = 0, minute = 0, t;

		if (hourVal !== undefined) {
			hour = parseInt(hourVal);
		}

		if (minuteVal !== undefined) {
			minute = parseInt(minuteVal);
		}

		if (meridiemVal === 'pm') {
			hour = hour + 12;
		}

		t = hour * 3600 * 1000 + minute * 60 * 1000;
		return isNaN(t) ? 0 : t;
	}


});