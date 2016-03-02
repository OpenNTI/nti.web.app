Ext.define('NextThought.app.course.assessment.components.editing.DueDate', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-duedate-editor',

	requires: [
		'NextThought.common.form.fields.DateTimeField',
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
			now = new Date(), later = new Date();

		later.setFullYear(later.getFullYear() + 1);

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
				xtype: 'date-time-field',
				isAvailableEditor: true,
				// currentDate: available,
				lowerBound: now,
				upperBound: later
			},
			{
				xtype: 'box',
				autoEl: {
					cls: 'label',
					html: 'When should this assignment be due?'
				}
			},
			{
				xtype: 'date-time-field',
				isDueEditor: true,
				currentDate: due,
				lowerBound: now,
				upperBound: later
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


	getAvailableEditor: function() {
		return this.down('[isAvailableEditor]');
	},


	getDueEditor: function() {
		return this.down('[isDueEditor]');
	},


	doCancel: function() {

	},


	doSave: function() {
		var available = this.getAvailableEditor(),
			due = this.getDueEditor(),
			availableValid = available.validate(),
			dueValid = due.validate();

		if (!availableValid || !dueValid) {
			return;
		}

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
