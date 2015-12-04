Ext.define('NextThought.common.form.fields.DatePicker', {
	extend: 'Ext.Component',
	alias: 'widget.date-picker-field',

	cls: 'date-picker-field',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'date-container part', cn: [
			{ cls: 'date', html: '{date}', 'data-value': '{date}'}
		]},
		{tag: 'tpl', 'if': 'timePicker', cn: [
			{cls: 'time-container', cn: [
				{ tag: 'input', cls: 'time', html: '12 : 00'}
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
		timeContainerEl: '.time-container',
		timeEl: '.time',
		meridiemContainerEl: '.meridiem-container',
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

		if (this.meridiemContainerEl) {
			this.mon(this.meridiemContainerEl, {
				'click': this.showMeridiemPicker.bind(this)
			});	
		}

		this.createDatePicker();
		if (this.timeEl) {
			this.timeEl.dom.addEventListener('keyup', this.timeChanged.bind(this));
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


	timeChanged: function(){
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

		// Get two digit format
		hour = ("0" + hour).slice(-2);
		minute = ("0" + minute).slice(-2);

		this.onceRendered
			.then(function() {
				var b = Ext.Date.format(date, "n/j/Y"), 
					dateOnly = new Date(b);

				// Set date
				me.dateEl.setHTML(dateString);
				me.dateEl.dom.setAttribute('data-value', dateOnly);
				if (me.datepicker) {
					me.datepicker.setValue(dateOnly);
				}

				// Set time
				me.timeEl.dom.value = hour + ':' + minute;

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
			timeVal = this.timeEl && this.timeEl.dom.value,
			meridiemVal = this.meridiemEl && this.meridiemEl.dom.getAttribute('data-value'),
			hour = 0, minute = 0, t, parts;

		parts = (timeVal || "").split(':');
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