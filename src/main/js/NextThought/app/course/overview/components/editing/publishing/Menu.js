Ext.define('NextThought.app.course.overview.components.editing.publishing.Menu', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-publishing-menu',

	requires: [
		'NextThought.common.form.fields.DatePicker',
		'NextThought.app.course.overview.components.editing.Actions'
	],

	cls: 'editing-publishing-menu',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'option publish', 'data-action': 'publish', cn: [
			{cls: 'text', html: 'Publish'},
			{cls: 'subtext', html: 'Lesson contents are visible to students.'}
		]},
		{cls: 'option publish-on-date', 'data-action': 'publish-date', cn: [
			{cls: 'text', html: 'Publish on Date'},
			{cls: 'subtext', cn: [
				{tag: 'span', cls: 'description', html: 'When do you want students to have access to this lesson?'},
				{cls: 'date-picker-container'}
			]}
		]},
		{cls: 'option unpublish selected', 'data-action': 'unpublish', cn: [
			{cls: 'text', html: 'Unpublish'},
			{cls: 'subtext', html: 'Currently not visible to any students'}
		]},
		{cls: 'save', html: 'Save'}
	]),


	renderSelectors: {
		publishEl: '.publish',
		publishOnDateEl: '.publish-on-date',
		unpublishEl: '.unpublish',
		publishOnDateSaveEl: '.save'
	},


	initComponent: function() {
		this.callParent(arguments);
		this.EditingActions = new NextThought.app.course.overview.components.editing.Actions();
	},


	afterRender: function(){
		this.callParent(arguments);

		this.mon(this.publishEl, 'click', this.handleSelectionClick.bind(this));
		this.mon(this.publishOnDateEl, 'click', this.onPublishOnDateClick.bind(this));
		this.mon(this.unpublishEl, 'click', this.handleSelectionClick.bind(this));
		this.mon(this.publishOnDateSaveEl, 'click', this.onSave.bind(this));

		this.setInitialState();
	},


	setInitialState: function(){
		var node = this.record,
			isNodePublished = node && node.isPublished && node.isPublished(),
			lesson = this.contents,
			isLessonPublished = lesson && lesson.isPublished && lesson.isPublished(),
			date;


		if (isNodePublished && isLessonPublished) {
			this.select(this.publishEl);
		}
		else if (!isNodePublished && !isLessonPublished) {
			this.select(this.unpublishEl);
		}
		else if (isNodePublished && !isLessonPublished) {
			if (isLessonPublished === false) {
				date = lesson && lesson.get('publishBeginning');
				if (date) {
					date = new Date(date);
					this.setPublishOnDateText(date);
				}

				this.select(this.publishOnDateEl);	
				this.createDatePicker(this.publishOnDateEl.down('.date-picker-container'));
			}
		}
		else {
			this.select(this.unpublishEl);
		}
	},


	handleSelectionClick: function(e) {
		var el = Ext.get(e.target),
			me = this;

		e.stopEvent();
		this.select(el);
	},


	onPublishOnDateClick: function(e){
		var el = Ext.get(e.target);

		e.stopEvent();
		this.select(el);
		if (!this.datepicker) {
			this.createDatePicker(this.publishOnDateEl.down('.date-picker-container'));
		}
	},


	onSave: function(){
		var selectedEl = this.el.down('.option.selected');
			action = selectedEl && selectedEl.getAttribute('data-action');

		if (action === 'publish') {
			this.publishSave();
		}
		else if (action === 'publish-date') {
			this.publishOnDateSave();
		}
		else {
			this.unpublishSave();
		}
	},


	publishSave: function(){
		var me = this;

		Promise.all([
			me.EditingActions.publish(me.record),
			me.EditingActions.publish(me.contents)
		])
		.then(function(o) {
			var node = o[0], lesson = o[1];
			if (me.setPublished) {
				me.setPublished(lesson);
			}
		});
	},


	publishOnDateSave: function(){
		var dateValue = this.datepicker && this.datepicker.getValue()
			me = this;
		
		if (!dateValue) { return; }

		Promise.all([
			me.EditingActions.publish(me.record),
			me.EditingActions.publishOnDate(me.contents, dateValue)
		])
		.then(function(o) {
			var node = o[0], lesson = o[1];

			if (me.setWillPublishOn) {
				me.setWillPublishOn(lesson);
			}
		});
	},


	unpublishSave: function() {
		var me = this;

		Promise.all([
			me.EditingActions.unpublish(me.record),
			me.EditingActions.unpublish(me.contents)
		])
		.then(function(o) {
			var node = o[0], lesson = o[1];
			if (me.setNotPublished) {
				me.setNotPublished(lesson);
			}
		});
	},


	createDatePicker: function(dateContainer){
		var parentEl = dateContainer || Ext.getBody(),
			begin = this.contents && this.contents.get('publishBeginning'),
			defaultValue = begin && new Date(begin);

		if (!defaultValue) {
			defaultValue = new Date();
		}

		this.datepicker = Ext.widget({
			xtype: 'date-picker-field',
	        defaultValue: defaultValue,
	        renderTo: parentEl,
	        dateChanged: this.dateChanged.bind(this)
		});

		this.on('destroy', this.datepicker.destroy.bind(this.datepicker));
	},


	dateChanged: function(){
		var time  = this.datepicker.getValue(),
			date = new Date(time * 1000);

		this.setPublishOnDateText(date);
	},


	setPublishOnDateText: function(date){
		var	targetEl = this.publishOnDateEl.down('.description'),
			time = this.getDisplayDateValue(date);

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


	select: function(el){
		var t = el && el.hasCls('option') ? el : el && el.up('.option'),
			selectedEl = this.el.down('.selected');

		if (!t || !selectedEl) { return; }

		selectedEl.removeCls('selected');
		t.addCls('selected'); 	
	}
});
