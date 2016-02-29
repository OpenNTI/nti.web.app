Ext.define('NextThought.app.course.assessment.components.editing.DueDate', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-duedate-editor',

	requires: [
		'NextThought.common.form.fields.InlineDateField',
		'NextThought.app.course.editing.Actions'
	],


	cls: 'assignment-due-date-editor',
	layout: 'none',

	items: [],


	initComponent: function() {
		this.callParent(arguments);

		var me = this,
			available = me.assignment.get('availableBeginning'),
			due = me.assignment.get('availableEnding'),
			now = new Date();

		this.EditingActions = NextThought.app.course.editing.Actions.create();

		me.add([
			{
				xtype: 'box',
				autoEl: {
					cls: 'label',
					html: 'When should this assignment be available?'
				}
			},
			{
				xtype: 'inline-date-field',
				isAvailableEditor: true,
				currentDate: available,
				lowerBound: now
			},
			{
				xtype: 'box',
				autoEl: {
					cls: 'label',
					html: 'When should this assignment be due?'
				}
			},
			{
				xtype: 'inline-date-field',
				isDueEditor: true,
				currentDate: due,
				lowerBound: now
			},
			{
				xtype: 'box',
				autoEl: {
					cls: 'footer',
					cn: [
						{cls: 'cancel', html: 'Cancel'},
						{cls: 'save', html: 'Save'}
					]
				},
				listeners: {
					click: {
						element: 'el',
						fn: function(e) {
							if (e.getTarget('.cancel')) {
								me.doCancel();
							} else if (e.getTarget('.save')) {
								me.doSave();
							}
						}
					}
				}
			}
		]);
	},

	getAvailable: function() {
		var editor = this.down('[isAvailableEditor]');

		return editor.getSelectedDate();
	},


	getDue: function() {
		var editor = this.down('[isDueEditor]');

		return editor.getSelectedDate();
	},


	doCancel: function() {

	},


	doSave: function() {
		this.EditingActions.updateAssignmentDates(this.assignment, this.getAvailable(), this.getDue())
			.then(function() {
				//TODO: update stuff
			})
			.fail(function() {
				//Show an error
			});
	},


	onAvailableChange: function() {

	},


	onDueChange: function() {

	}
});
