Ext.define('NextThought.common.form.fields.DatePicker', {
	extend: 'Ext.Component',
	alias: 'widget.date-picker-field',

	cls: 'date-picker-field',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'date-container part', cn: [
			{ cls: 'date', html: 'date'}
		]},
		{tag: 'tpl', 'if': 'timePicker', cn: [
			{cls: 'hour-container part', cn: [
				{ cls: 'hour', name: 'hour', html: 'Hour'}
			]},
			{cls: 'minute-container part', cn: [
				{ cls: 'minute', name: 'minute', html: 'Min'}
			]},
			{cls: 'meridiem-container part', cn: [
				{ cls: 'meridiem', name: 'meridiem', html: 'AM'}
			]}
		]}
	]),

	TimePicker: true,

	renderSelectors: {
		dateContainerEl: '.date-container',
		dateEl: '.date',
		hourEl: '.part .hour',
		minuteEl: '.part .minute',
		meridiemEl: '.part .meridiem'
	},

	beforeRender: function(){
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			displayName: this.displayName,
			timePicker: this.TimePicker
		})
	},

	afterRender: function() {
		this.callParent(arguments);
		
		if (this.dateEl) {
			this.mon(this.dateEl, {
				'click': this.showDatePicker.bind(this)
			});	
		}
		
		if ( this.hourEl) {
			this.mon(this.hourEl, {
				'click': this.showHourPicker.bind(this)
			});	
		}

		if (this.minuteEl) {
			this.mon(this.minuteEl, {
				'click': this.showMinutePicker.bind(this)
			});	
		}

		if (this.meridiemEl) {
			this.mon(this.meridiemEl, {
				'click': this.showMeridiemPicker.bind(this)
			});	
		}
	},


	showDatePicker: function(){
		if (!this.datepicker) {
			this.datepicker = Ext.widget({
				xtype: 'datepicker',
		        minDate: new Date(),
		        renderTo: Ext.getBody(),
		        handler: this.dateChanged.bind(this),
		        floating: true
			});

			this.on('destroy', this.datepicker.destroy.bind(this));
			this.datepicker.hide();
		}
		
		if (!this.datepicker.isVisible()) {
			this.datepicker.showBy(this.dateEl, 'tl-bl?');
		}
		else {
			this.datepicker.hide();
		}
	},


	dateChanged: function(picker, date){
		if (this.dateEl) {
			this.dateEl.dom.value = date;
		}
	},


	showHourPicker: function(){
		if (!this.hourMenu) {
			this.hourMenu = this.createHourMenu();
			this.on('destroy', this.hourMenu.destroy.bind(this));
		}

		if (this.hourMenu.isVisible()) {
			this.hourMenu.hide();
		}
		else {
			this.hourMenu.showBy(this.hourEl, 'tl-bl?');			
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
		return menu;
	},

	
	handleHourMenuClick: function(item, menu) {

	},


	showMinutePicker: function(){
		if (!this.minuteMenu) {
			this.minuteMenu = this.createMinuteMenu();
			this.on('destroy', this.minuteMenu.destroy.bind(this));
		}

		if (this.minuteMenu.isVisible()) {
			this.minuteMenu.hide();
		}
		else {
			this.minuteMenu.showBy(this.minuteEl, 'tl-bl?');			
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
		return menu;
	},


	handleMinuteMenuClick: function(item, menu) {

	},


	showMeridiemPicker: function(){
		if (!this.meridiemMenu) {
			this.meridiemMenu = this.createMeridiemMenu();
			this.on('destroy', this.meridiemMenu.destroy.bind(this));
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
		return menu;
	},


	handleMeridiemMenuClick: function(item, menu) {

	}
});