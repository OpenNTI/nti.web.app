Ext.define('NextThought.app.course.overview.components.editing.controls.AvailableDateMenu', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-available-date-menu',

	requires: [
		'NextThought.common.form.fields.DatePicker'
	],

	cls: 'editing-available-date-menu',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'toggle', cn: [
			{cls: 'part selected beginning', 'data-action': 'AvailableBeginning', html: 'Begin Date'},
			{cls: 'part ending', 'data-action': 'AvailableEnding', html: 'Finish Date'}
		]},
		{cls: 'date-picker-container'},
		{cls: 'save disabled', html: 'Save Changes'}
	]),


	renderSelectors: {
		pickerEl: '.date-picker-container',
		saveEl: '.save',
		toggleEl: '.toggle',
		beginEl: '.beginning',
		endEl: '.ending'
	},

	initComponent: function() {
		this.callParent(arguments);
		this.EditingActions = new NextThought.app.course.overview.components.editing.Actions();
	},

	afterRender: function(){
		this.callParent(arguments);
		this.picker = this.createDatePicker(this.pickerEl);
		this.mon(this.toggleEl, 'click', this.handleSelectionClick.bind(this));
		this.mon(this.saveEl, 'click', this.doSave.bind(this));
		this.setInitialState();
	},


	setInitialState: function(){
		var startDate = this.record && this.record.get('AvailableBeginning'),
			endDate = this.record && this.record.get('AvailableEnding');

		// the available beginning and ending are in seconds.
		this.values = {
			AvailableBeginning: startDate ? startDate.getTime && (startDate.getTime()/1000) : null,
			AvailableEnding: endDate ? endDate.getTime && (endDate.getTime()/1000) : null
		};

		this.updateDates();
	},


	updateDates: function(){
		var selectedEl = this.toggleEl.down('.selected'),
			field = selectedEl && selectedEl.dom && selectedEl.dom.getAttribute('data-action'),
			value = this.values && this.values[field], date,
			availableEnding = this.values['AvailableEnding'] ? new Date(this.values['AvailableEnding']* 1000) : null;
			availableBeginning = this.values['AvailableBeginning'] ? new Date(this.values['AvailableBeginning']* 1000) : null;

		if (this.picker && field) {
			date = value ? new Date(value * 1000) : new Date();
			this.picker.setValue(date);

			if (field === 'AvailableBeginning') {
				this.picker.setMaxDate(availableEnding);
				this.picker.setMinDate(null);
			} else if (field === 'AvailableEnding'){
				this.picker.setMinDate(availableBeginning);
				this.picker.setMaxDate(null);
			}
		}
	},


	createDatePicker: function(dateContainer){
		var defaultValue = new Date(),
			datepicker = Ext.widget({
				xtype: 'date-picker-field',
		        defaultValue: defaultValue,
		        renderTo: dateContainer,
		        TimePicker: false
			});

		datepicker.dateChanged = this.dateChanged.bind(this, datepicker);
		this.on('destroy', datepicker.destroy.bind(datepicker));
		return datepicker;
	},


	dateChanged: function(datepicker){
		var seconds  = datepicker && datepicker.getValue(),
			selected = this.toggleEl.down('.selected'),
			key = selected && selected.dom && selected.dom.getAttribute('data-action');

		if (key) {
			this.values[key] = seconds; 
		}
		if (this.saveEl.hasCls('disabled')) {
			this.saveEl.removeCls('disabled');
		}
	},


	handleSelectionClick: function(e) {
		var el = Ext.get(e.target),
			me = this;

		e.stopEvent();

		this.select(el);
		this.updateDates();
		
		if (this.saveEl.hasCls('disabled')) {
			this.saveEl.removeCls('disabled');
		}
	},


	select: function(el){
		var t = el && el.hasCls('part') ? el : el && el.up('.part'),
			selectedEl = this.el.down('.selected');

		if (t && selectedEl && t !== selectedEl) { 
			selectedEl.removeCls('selected');
			t.addCls('selected');
		}
	},


	getValue: function(){
		return {
			AvailableBeginning: this.values && this.values.AvailableBeginning,
			AvailableEnding: this.values && this.values.AvailableEnding
		};
	},


	doSave: function(e){
		var target = Ext.get(e.target);

		if (target && target.hasCls('disabled')) { return; }

		if (this.onSave) {
			this.onSave();
		}
	},

	toggleTab: function(){
		if(this.beginEl.hasCls('selected')){
			this.select(this.endEl);
		}else {
			this.select(this.beginEl);
		}
	},

	setMaxDate: function(date){
		this.picker.setMaxDate(date);
	},

	setMinDate: function(date){
		this.picker.setMinDate(date);
	}

});
