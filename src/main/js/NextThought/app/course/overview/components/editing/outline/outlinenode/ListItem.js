Ext.define('NextThought.app.course.overview.components.editing.outline.outlinenode.ListItem', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-outlinenode-listitem',

	requires: [
		'NextThought.model.app.MoveInfo',
		'NextThought.app.course.overview.components.editing.controls.Publish'
	],

	mixins: {
		OrderingItem: 'NextThought.mixins.dnd.OrderingItem'
	},

	cls: 'outline-node-listitem',

	layout: 'none',


	renderTpl: Ext.DomHelper.markup([
		{cls: 'date-container', cn: [
			{cls: 'date-calendar', cn: [
				{cls: 'date', cn: [
					{cls: 'month'},
					{cls: 'day'}
				]}
			]}
		]},
		{cls: 'title'},
		{cls: 'controls'}
	]),


	renderSelectors: {
		titleEl: '.title',
		controlsEl: '.controls',
		monthEl: '.date .month',
		dayEl: '.date .day'
	},


	initComponent: function() {
		this.callParent(arguments);

		var move = new NextThought.model.app.MoveInfo({
			OriginContainer: this.record.parent && this.record.parent.getId && this.record.parent.getId(),
			OriginIndex: this.record.listIndex
		});

		this.setDataTransfer(move);
		this.setDataTransfer(this.record);

		this.loadContents = Promise.all([
				this.getPreview(this.record, this.bundle),
				this.getControls(this.record, this.bundle)
			]).then(this.addParts.bind(this));
	},


	onceLoaded: function() {
		return this.loadContents || Promise.resolve();
	},


	addParts: function(o) {
		var me = this, 
			controls = o[1] || [];

		if (!(controls instanceof Array)) {
			controls = [controls];
		}

		this.onceRendered
			.then(function() {
				var start = me.record && me.record.get('AvailableBeginning'),
				 	config;
				
				// Set dates	
				me.setDayAndMonth(start);

				// Set title
				me.titleEl.update(me.record.getTitle());

				// Add the controls
				for (var i=0; i < controls.length; i++) {
					config = controls[i];
					config.renderTo = me.controlsEl;
					Ext.widget(config);
				}
			});
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


	getPreview: function(record) {
		return Promise.resolve({
			xtype: 'box',
			autoEl: {
				cls: 'title', html: record.getTitle()
			}
		});
	},


	getControls: function(record, bundle) {
		return record.getContents()
			.then(function(contents) {
				return {
					xtype: 'overview-editing-controls-publish',
					contents: contents,
					record: record,
					bundle: bundle
				};
			});
	}
});
