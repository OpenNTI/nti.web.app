Ext.define('NextThought.common.form.fields.DatePicker', {
	extend: 'Ext.Component',
	alias: 'widget.date-picker-field',

	cls: 'date-picker-field',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'date-container part', cn: [
			{ tag: 'input', type: 'text', name: 'date'}
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
		dateEl: 'input[name=date]'
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
		this.picker = Ext.widget({
			xtype: 'datepicker',
	        minDate: new Date(),
	        renderTo: Ext.getBody(),
	        handler: this.dateChanged.bind(this),
	        floating: true
		});

		this.on('destroy', this.picker.destroy.bind(this));

		this.picker.hide();

		this.addInputListeners();
	},


	addInputListeners: function() {
		if (!this.dateEl) { return; }
		this.mon(this.dateEl, {
			'keydown': this.onKeyDown.bind(this),
			'click': this.showPicker.bind(this),
			'blur': this.onInputBlur.bind(this)
		});
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

	},


	onKeyDown: function(e) {
		this.showPicker();
	},


	onInputBlur: function(e) {
		//
	},


	showPicker: function(){
		if (this.picker) {
			this.picker.showBy(this.dateEl, 'tl-bl?');
		}
	},

	dateChanged: function(picker, date){
		if (this.dateEl) {
			this.dateEl.dom.value = date;
		}
	}
});