Ext.define('NextThought.app.course.overview.components.editing.controls.Calendar', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-controls-calendar',

	requires: [
		'NextThought.app.course.overview.components.editing.controls.AvailableDateMenu'
	],

	cls: 'button calendar',

	placeholder: 'When should students begin this lesson?',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'date-calendar', cn: [
			{cls: 'date', cn: [
				{cls: 'month'},
				{cls: 'day'}
			]}
		]},
		{cls: 'main', cn: [
			{cls: 'text', html: '{placeholder}'},
			{cls: 'clear', html: 'clear'}
		]},
		{cls: 'menu-container'}
	]),


	renderSelectors: {
		monthEl: '.month',
		dayEl: '.day',
		menuContainerEl: '.menu-container',
		mainEl: '.main',
		textEl: '.main .text',
		dateEl: '.date',
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
		this.setDefaultDate();
		this.createPicker();

		this.mon(this.dateEl, 'click', this.dateClicked.bind(this));
		this.mon(this.textEl, 'click', this.textLabelClicked.bind(this));
		this.mon(this.clearEl, 'click', this.clearDates.bind(this));

		this.el.addCls('closed');
		this.onWindowResizeBuffer = Ext.Function.createBuffered(this.alignCalendarMenu, 5, this);
   		Ext.EventManager.onWindowResize(this.onWindowResizeBuffer, this);
   		window.addEventListener('scroll', this.onWindowResizeBuffer.bind(this));

   		this.on('destroy', function(){
   			Ext.EventManager.removeResizeListener(me.onWindowResizeBuffer, me);
   			window.removeEventListener(me.onWindowResizeBuffer, me);
   		});
	},


	setDefaultDate: function () {
		var startDate = this.record && this.record.get('AvailableBeginning'),
			date  = startDate ? new Date(startDate) : new Date(), m;

		this.setDayAndMonth(date);
		this.updateDateText();
	},


	setDayAndMonth: function(date){
		var parts, m;
		if (date) {
			// Format i.e. December 12
			date = Ext.Date.format(date, 'F d');
			parts = date.split(' ');
			m = parts[0].substring(0,3);
			
			this.monthEl.update(m);
			this.dayEl.update(parts[1]);
		}	
	},


	createPicker: function () {
		this.picker = Ext.widget('overview-editing-available-date-menu', {
			record: this.record,
			defaultValue: this.defaultValue,
			renderTo: this.menuContainerEl,
			onSave: this.saveClicked.bind(this)
		});

		this.on('destroy', this.picker.destroy.bind(this));
	},


	alignCalendarMenu: function(){
		var box = this.el && this.el.dom.getBoundingClientRect() || {},
			me = this,
			menu = this.picker,
			top = box.bottom + 10,
			vh = Ext.Element.getViewportHeight(),
			vw = Ext.Element.getViewportWidth(),
			maxHeight = vh - top - 20;

		if (menu.el) {
			menu.el.setStyle('top', top + 'px');
			menu.el.setStyle('maxHeight', maxHeight + 'px');	
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
		if (this.menuContainerEl.hasCls('text-clicked')) {
			this.menuContainerEl.removeCls('text-clicked');
		}

		this.el.toggleCls('closed');
	},


	textLabelClicked: function(){
		if (!this.menuContainerEl.hasCls('text-clicked')) {
			this.menuContainerEl.addCls('text-clicked');
		}

		this.el.toggleCls('closed');
	},


	saveClicked: function(e){
		var me = this,
			link = this.record && this.record.getLink('edit'),
			values = this.picker && this.picker.getValue();

		if (values && link) {
			Service.put(link, values)
				.then(function(response){
					me.record.syncWithResponse(response);
					me.updateDateText();
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
					me.updateDateText();
					me.el.addCls('closed');
				});
		}
	}

});
