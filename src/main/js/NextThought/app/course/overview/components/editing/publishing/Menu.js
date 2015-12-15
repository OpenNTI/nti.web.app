Ext.define('NextThought.app.course.overview.components.editing.publishing.Menu', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-publishing-menu',

	requires: [
		'NextThought.common.form.fields.DatePicker',
		'NextThought.app.course.overview.components.editing.Actions'
	],

	cls: 'editing-publishing-menu',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'option publish', cn: [
			{cls: 'text', html: 'Publish'},
			{cls: 'subtext', html: 'Lesson contents are visible to students.'}
		]},
		{cls: 'option publish-on-date', cn: [
			{cls: 'text', html: 'Publish on Date'},
			{cls: 'subtext', cn: [
				{tag: 'span', cls: 'description', html: 'When do you want students to have access to this lesson?'},
				{cls: 'date-picker-container'},
				{cls: 'save', html: 'Save'}
			]}
		]},
		{cls: 'option unpublish selected', cn: [
			{cls: 'text', html: 'Unpublish'},
			{cls: 'subtext', html: 'Currently not visible to any students'}
		]}
	]),


	renderSelectors: {
		publishEl: '.publish',
		publishOnDateEl: '.publish-on-date',
		unpublishEl: '.unpublish',
		publishOnDateSaveEl: '.publish-on-date .save'
	},


	initComponent: function() {
		this.callParent(arguments);
		this.EditingActions = new NextThought.app.course.overview.components.editing.Actions();
	},


	afterRender: function(){
		this.callParent(arguments);

		this.mon(this.publishEl, 'click', this.onPublishClick.bind(this));
		this.mon(this.publishOnDateEl, 'click', this.onPublishOnDateClick.bind(this));
		this.mon(this.unpublishEl, 'click', this.onUnpublishClick.bind(this));
		this.mon(this.publishOnDateSaveEl, 'click', this.onPublishOnDateSave.bind(this));
	},


	onPublishClick: function(e) {
		var el = Ext.get(e.target),
			me = this;

		e.stopEvent();
		this.toggleOptionSelection(el);
		if (this.record) {
			this.EditingActions.publish(this.record)
				.then(function(rec) {
					// TODO: should we change the record?
					if (me.setPublished) {
						me.setPublished(rec);
					}
				})
				.fail(function(){
					console.log(arguments);
				});
		}
	},


	onPublishOnDateClick: function(e){
		var el = Ext.get(e.target);

		e.stopEvent();
		this.toggleOptionSelection(el);
		if (!this.datepicker) {
			this.createDatePicker(this.publishOnDateEl.down('.date-picker-container'));
		}

		this.datepicker.show();
	},


	onPublishOnDateSave: function(){
		var dateValue = this.datepicker && this.datepicker.getValue()
			me = this;
		if (dateValue && this.record) {
			this.EditingActions.publishOnDate(this.record, dateValue)
				.then(function(rec) {
					if (me.setWillPublishOn) {
						me.setWillPublishOn(rec);
					}
				});
		}	
	},


	createDatePicker: function(dateContainer){
		var parentEl = dateContainer || Ext.getBody();
		this.datepicker = Ext.widget({
			xtype: 'date-picker-field',
	        defaultValue: new Date(),
	        renderTo: parentEl,
	        dateChanged: this.dateChanged.bind(this)
		});

		this.on('destroy', this.datepicker.destroy.bind(this.datepicker));
		this.datepicker.hide();
	},


	dateChanged: function(){
		var time  = this.datepicker.getValue(),
			date = new Date(time * 1000),
			targetEl = this.publishOnDateEl.down('.description');

		time  = this.getDisplayDateValue(date);
		if (targetEl) {
			targetEl.update('Lesson contents will be visible to students on ' + time);
		}
	},


	getDisplayDateValue: function(date) {
		var hour, minutes,
			meridiemVal, date;

		if (date instanceof Date) {
			hour = date.getHours();
			minutes = date.getMinutes();
			meridiemVal = hour > 12 ? 'PM' : 'AM';
			hour = hour > 12 ? hour - 12 : hour;

			date = Ext.Date.format(date, 'F d');
			return date + ' at ' + hour + ':' + minutes + ' ' + meridiemVal;	
		}

		return null;
	},


	onUnpublishClick: function(e){
		var el = Ext.get(e.target),
			me = this;

		e.stopEvent();
		this.toggleOptionSelection(el);
		if (this.record) {
			this.EditingActions.unpublish(this.record)
				.then(function(rec) {
					if (me.setNotPublished) {
						me.setNotPublished(rec);
					}
				})
				.fail(function(){
					console.log(arguments);
				});
		}
	},


	toggleOptionSelection: function(el){
		var t = el && el.hasCls('option') ? el : el && el.up('.option'),
			selectedEl = this.el.down('.selected');

		if (!t || !selectedEl) { return; }

		selectedEl.removeCls('selected');
		t.addCls('selected'); 	
	}
});
