Ext.define('NextThought.app.course.overview.components.editing.controls.AvailableDateMenu', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-available-date-menu',

	requires: [
		'NextThought.common.form.fields.DatePicker'
	],

	cls: 'editing-available-date-menu',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'option available-beginning', 'data-action': 'available-beginning', cn: [
			{cls: 'text', html: 'Available Beginning'},
			{cls: 'subtext', cn: [
				{tag: 'span', cls: 'description', html: 'When should students start this lesson?'},
				{cls: 'date-picker-container'}
			]}
		]},
		{cls: 'option available-ending', 'data-action': 'available-ending', cn: [
			{cls: 'text', html: 'Available Ending'},
			{cls: 'subtext', cn: [
				{tag: 'span', cls: 'description', html: 'When should students end this lesson?'},
				{cls: 'date-picker-container'}
			]}
		]},
		{cls: 'save disabled', html: 'Save'}
	]),


	renderSelectors: {
		startPickerEl: '.available-beginning .date-picker-container',
		endPickerEl: '.available-ending .date-picker-container',
		startEl: '.available-beginning',
		endEl: '.available-ending',
		saveEl: '.save'
	},

	initComponent: function() {
		this.callParent(arguments);
		this.EditingActions = new NextThought.app.course.overview.components.editing.Actions();
	},

	afterRender: function(){
		this.callParent(arguments);
		this.startPicker = this.createDatePicker(this.startPickerEl);
		this.endPicker = this.createDatePicker(this.endPickerEl);
		this.mon(this.startEl, 'click', this.handleSelectionClick.bind(this));
		this.mon(this.endEl, 'click', this.handleSelectionClick.bind(this));
		this.mon(this.saveEl, 'click', this.doSave.bind(this));
		this.setInitialState();
	},


	setInitialState: function(){
		var startDate = this.record && this.record.get('AvailableBeginning'),
			endDate = this.record && this.record.get('AvailableEnding');

		if (this.startPicker) {
			startDate = startDate ? new Date(startDate) : new Date();
			this.startPicker.setValue(startDate);
		}

		if (this.endPicker) {
			// Default to tomorrow.
			if (!endDate) {
				endDate = new Date();
				endDate.setDate(endDate.getDate() + 1);
			}
			else {
				endDate = new Date(endDate);
			}

			this.endPicker.setValue(endDate);
		}
	},


	createDatePicker: function(dateContainer){
		var defaultValue = new Date();
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
		var time  = datepicker && datepicker.getValue(),
			date = new Date(time * 1000);

		this.setAvailableDateText(date);
	},


	setAvailableDateText: function(date){

	},


	handleSelectionClick: function(e) {
		var el = Ext.get(e.target),
			me = this;

		e.stopEvent();
		this.select(el);

		// Update the parent node
		if (this.dateChanged) {
			this.dateChanged();
		}

		this.saveEl.removeCls('disabled');
	},


	select: function(el){
		var t = el && el.hasCls('option') ? el : el && el.up('.option');

		if (t) { 
			t.toggleCls('selected');
		}
	},


	getValue: function(){
		var isStartChecked = this.startEl.hasCls('selected') || null,
			isEndChecked = this.endEl.hasCls('selected') || null;

		return {
			AvailableBeginning: isStartChecked && this.startPicker && this.startPicker.getValue(),
			AvailableEnding: isEndChecked && this.endPicker && this.endPicker.getValue()
		}
	},


	doSave: function(){
		if (this.onSave) {
			this.onSave();
		}
	}

});
