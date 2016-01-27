Ext.define('NextThought.app.course.overview.components.editing.controls.Calendar', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-controls-calendar',

	requires: [
		'NextThought.app.course.overview.components.editing.controls.AvailableDateMenu'
	],

	cls: 'button calendar',

	placeholder: 'When should students begin this lesson?',

	enableText: true,

	renderTpl: Ext.DomHelper.markup([
		{cls: 'date-calendar', cn: [
			{cls: 'date', cn: [
				{cls: 'month'},
				{cls: 'day'}
			]}
		]},
		{tag: 'tpl', 'if': 'enableText', cn: [
			{cls: 'main', cn: [
				{cls: 'text', html: '{placeholder}'},
				{cls: 'clear', html: 'clear'}
			]}
		]},
		{cls: 'menu-container'}
	]),


	renderSelectors: {
		monthEl: '.month',
		dayEl: '.day',
		dateEl: '.date',
		menuContainerEl: '.menu-container',
		mainEl: '.main',
		textEl: '.main .text',
		dateContainerEl: '.date-calendar',
		clearEl: '.clear'
	},


	beforeRender: function () {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, {
			placeholder: this.placeholder,
			enableText: this.enableText
		});
	},

	afterRender: function () {
		this.callParent(arguments);
		var me = this;
		
		this.setDefaultDate();

		if (this.dateContainerEl) {
			this.mon(this.dateContainerEl, 'click', this.dateClicked.bind(this));			
		}
		if (this.textEl) {
			this.mon(this.textEl, 'click', this.textLabelClicked.bind(this));			
		}
		if (this.clearEl) {
			this.mon(this.clearEl, 'click', this.clearDates.bind(this));	
		}

		this.el.addCls('closed');
	},


	setDefaultDate: function () {
		var startDate = this.record && this.record.get('AvailableBeginning'),
			date  = startDate ? new Date(startDate) : null, m;

		this.setDayAndMonth(date);
		if (this.enableText) {
			this.updateDateText();
		}
	},


	setDayAndMonth: function(date){
		var parts, m;
		if (date) {
			this.dateEl.removeCls('empty');

			// Format i.e. Dec 12
			date = Ext.Date.format(date, 'M j');
			parts = date.split(' ');
			m = parts[0];
			
			if (this.monthEl) {
				this.monthEl.update(m);				
			}

			this.dayEl.update(parts[1]);
		}
		else {
			this.monthEl.update("");
			this.dayEl.update("");
			this.dateEl.addCls('empty');
		}	
	},


	createPicker: function () {
		this.picker = Ext.widget('overview-editing-available-date-menu', {
			record: this.record,
			defaultValue: this.defaultValue,
			renderTo: this.menuContainerEl,
			onSave: this.saveClicked.bind(this)
		});

		this.on('destroy', this.picker.destroy.bind(this.picker));
	},


	alignCalendarMenu: function(){
		if (this.picker) {
			this.picker.alignTo(this.el.dom);
		}
	},


	updateDateText: function(){
		var startDate = this.record && this.record.get('AvailableBeginning'),
			endDate = this.record && this.record.get('AvailableEnding'), 
			date;

		if (startDate) {
			date = new Date(startDate);
			// Set the start date;
			this.setDayAndMonth(date);
		}

		if (endDate) {
			date = new Date(endDate);
		}

		if (startDate && endDate) {
			date = new Date(startDate);
			startDate = Ext.Date.format(date, 'F d');

			date = new Date(endDate);
			endDate = Ext.Date.format(date, 'F d');

			this.textEl.update(startDate + ' - ' + endDate);
			this.mainEl.addCls('has-date');
		}
		else if (startDate && !endDate) {
			startDate = Ext.Date.format(date, 'l, F d, Y');
			this.textEl.update(startDate);
			this.mainEl.addCls('has-date');
		}
		else if (!startDate && endDate) {
			endDate = Ext.Date.format(date, 'l, F d, Y');
			this.textEl.update(endDate);
			this.mainEl.addCls('has-date');
		}
		else {
			this.mainEl.removeCls('has-date');
			this.textEl.update(this.placeholder);
		}
	},


	dateClicked: function(){
		if (!this.picker) {
			this.createPicker();
		}

		if (this.el.hasCls('closed') && this.beforeShowMenu) {
			this.beforeShowMenu(this, this.picker, 'calendar');
		}

		if (this.el.hasCls('closed')){
			this.showMenu();
		} else {
			this.hideMenu();
		}
	},


	hideMenu: function(){
		this.el.addCls('closed');
		Ext.destroy(this.bodyListeners);
		this.picker.close();
	},


	showMenu: function() {
		this.el.removeCls('closed');
		this.bodyListeners = this.mon(Ext.getBody(), {
			destroyable: true,
			click: this.onBodyClick.bind(this)
		});
		this.resetMenu();
		this.alignCalendarMenu();
		this.picker.open();
	},


	resetMenu: function(){
		if (this.picker.endEl && this.picker.endEl.hasCls('selected')) {
			this.picker.toggleTab();
		}
		this.picker.setInitialState();
	},


	textLabelClicked: function(){
		if (!this.picker) {
			this.createPicker();
		}

		if (this.el.hasCls('closed')){
			this.showMenu();
		} else {
			this.hideMenu();
		}
	},


	saveClicked: function(e){
		var me = this,
			link = this.record && this.record.getLink('edit'),
			values = this.picker && this.picker.getValue();

		if (values && link) {
			Service.put(link, values)
				.then(function(response){
					me.record.syncWithResponse(response);
					me.setDefaultDate();
					me.el.addCls('closed');
				});
		}
	},


	clearDates: function(e){
		var link = this.record && this.record.getLink('edit'),
			me = this;

		e.stopEvent();

		if (link) {
			Service.put(link, {AvailableBeginning: null, AvailableEnding: null})
				.then(function(response){
					me.record.syncWithResponse(response);
					me.setDefaultDate();
					me.el.addCls('closed');
					me.picker.setMaxDate(null);
					me.picker.setMinDate(null);
				});
		}
	},

	onBodyClick: function(e) {
		if (e.getTarget('.calendar')) { return; }
		if(!this.el.hasCls('closed')){
			this.hideMenu();
		}
	}

});
