Ext.define('NextThought.app.course.overview.components.editing.controls.Calendar', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-controls-calendar',

	requires: [
		'NextThought.common.form.fields.DatePicker'
	],

	cls: 'button calendar',

	placeholder: 'When should students start this lesson?',

	enableText: true,

	renderTpl: Ext.DomHelper.markup([
		{cls: 'date-selected', cn: [
			{cls: 'date', cn: [
				{cls: 'month'},
				{cls: 'day'}
			]}
		]},
		{cls: 'main', cn: [
			{tag: 'tpl', 'if': 'enableText', cn: [
				{cls: 'text', html: '{placeholder}'}
			]},
			{cls: 'save', html: 'Save'}
		]},
		{cls: 'menu-container', cn: [
			{cls: 'calendar-menu'}
		]}
	]),


	renderSelectors: {
		monthEl: '.month',
		dayEl: '.day',
		calendarMenuEl: '.calendar-menu',
		menuContainerEl: '.menu-container',
		textEl: '.text',
		dateEl: '.date',
		saveEl: '.save'
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
		this.mon(this.saveEl, 'click', this.saveClicked.bind(this));
		if (this.textEl) {
			this.mon(this.textEl, 'click', this.textLabelClicked.bind(this));
		}

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
		this.datepicker = Ext.widget('date-picker-field', {
			record: this.record,
			defaultValue: this.defaultValue,
			renderTo: this.calendarMenuEl,
			TimePicker: false,
			dateChanged: this.onDateChange.bind(this)
		});

		this.on('destroy', this.datepicker.destroy.bind(this));
	},


	alignCalendarMenu: function(){
		var box = this.el && this.el.dom.getBoundingClientRect() || {},
			me = this,
			menu = this.calendarMenuEl,
			top = box.bottom + 10,
			vh = Ext.Element.getViewportHeight(),
			vw = Ext.Element.getViewportWidth(),
			maxHeight = vh - top - 20;

		if (menu.el) {
			menu.el.setStyle('top', top + 'px');
			menu.el.setStyle('maxHeight', maxHeight + 'px');	
		}
	},


	onDateChange: function(){
		var value = this.datepicker && this.datepicker.getValue(),
			date;

		if (value) {
			date = new Date(value * 1000);
			this.textEl.update(Ext.Date.format(date, 'l, F d, Y'));
			this.setDayAndMonth(date);
		}
		this.saveEl.addCls('active');
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
			value = this.datepicker && this.datepicker.getValue();

		if (value && link) {
			Service.put(link, {'AvailableBeginning': value})
				.then(function(response){
					me.record.syncWithResponse(response);
					me.saveEl.removeCls('active');
					me.el.toggleCls('closed');
				});
		}
	}

});
