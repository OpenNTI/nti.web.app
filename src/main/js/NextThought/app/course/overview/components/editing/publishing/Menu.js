Ext.define('NextThought.app.course.overview.components.editing.publishing.Menu', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-publishing-menu',

	requires: [
		'NextThought.common.form.fields.DatePicker'
	],

	cls: 'editing-publishing-menu',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'option publish', cn: [
			{cls: 'text', html: 'Publish'},
			{cls: 'subtext', html: ''}
		]},
		{cls: 'option publish-on-date', cn: [
			{cls: 'text', html: 'Publish on Date'},
			{cls: 'subtext', html: ''}
		]},
		{cls: 'option unpublish selected', cn: [
			{cls: 'text', html: 'Unpublish'},
			{cls: 'subtext', html: 'Currently not visible to any students'}
		]}
	]),


	renderSelectors: {
		publishEl: '.publish',
		publishOnDateEl: '.publish-on-date',
		unpublishEl: '.unpublish'
	},


	initComponent: function() {
		this.callParent(arguments);
	},


	afterRender: function(){
		this.callParent(arguments);

		this.mon(this.publishEl, 'click', this.onPublishClick.bind(this));
		this.mon(this.publishOnDateEl, 'click', this.onPublishOnDateClick.bind(this));
		this.mon(this.unpublishEl, 'click', this.onUnpublishClick.bind(this));
	},


	onPublishClick: function(e) {
		var el = Ext.get(e.target);

		e.stopEvent();
		this.toggleOptionSelection(el);
	},


	onPublishOnDateClick: function(e){
		var el = Ext.get(e.target);

		e.stopEvent();
		this.toggleOptionSelection(el);
		if (!this.datepicker) {
			this.createDatePicker(this.publishOnDateEl);
		}

		this.datepicker.show();
	},


	createDatePicker: function(dateContainer){
		var parentEl = dateContainer || Ext.getBody();
		this.datepicker = Ext.widget({
			xtype: 'date-picker-field',
	        defaultValue: new Date(),
	        renderTo: parentEl,
	        handler: this.dateChanged.bind(this)
		});

		this.on('destroy', this.datepicker.destroy.bind(this.datepicker));
		this.datepicker.hide();
	},


	dateChanged: function(){

	},


	onUnpublishClick: function(e){
		var el = Ext.get(e.target);

		e.stopEvent();
		this.toggleOptionSelection(el);

	},


	toggleOptionSelection: function(el){
		if (!el) { return;}

		if (el.hasCls('selected')) {
			el.removeCls('selected');
		} else {
			el.addCls('selected');
		}
	}
});
