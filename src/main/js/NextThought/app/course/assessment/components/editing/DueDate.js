Ext.define('NextThought.app.course.assessment.components.editing.DueDate', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-duedate-editor',

	requires: [
		'NextThought.common.form.fields.InlineDateField'
	],


	layout: 'none',

	items: [],


	initComponent: function() {
		this.callParent(arguments);

		this.add([
			{xtype: 'box', autoEl: {cls: 'label', html: 'When should this assignment be available?'}},
			{xtype: 'inline-date-field', isAvailableEditor: true, onDateChange: this.onAvailableChange.bind(this)},
			{xtype: 'box', autoEl: {cls: 'label', html: 'When should this assignment be due?'}},
			{xtype: 'inline-date-field', isDueEditor: true, onDateChange: this.onDueChange.bind(this)}
		]);
	},


	onAvailableChange: function() {

	},


	onDueChange: function() {

	}
});
