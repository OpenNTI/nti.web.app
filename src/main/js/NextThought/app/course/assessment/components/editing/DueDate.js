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
			{xtype: 'container', isContents: true, layout: 'none', cls: 'contents', items: [
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
					currentDate: available,
					onChange: this.clearError.bind(this)
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
					onChange: this.clearError.bind(this)
				},
				{
					xtype: 'box',
					isError: true,
					autoEl: {
						cls: 'error'
					}
				}
			]},
			{
				xtype: 'box',
				autoEl: {
					cls: 'footer',
					cn: [
						{cls: 'save', html: 'Save'},
						{cls: 'cancel', html: 'Cancel'}
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
		var assignment = this.assignment,
			available = assignment.get('availableBeginning'),
			due = assignment.get('availableEnding'),
			availableEditor = this.getAvailableEditor(),
			dueEditor = this.getDueEditor();

		availableEditor.selectDate(available);
		dueEditor.selectDate(due);

		if (this.onCancel) {
			this.onCancel();
		}
	},


	showError: function(msg) {
		var cmp = this.down('[isError]');

		if (cmp && cmp.el) {
			cmp.el.update(msg || 'Unable to update dates');
		}
	},


	clearError: function() {
		var cmp = this.down('[isError]');

		if (cmp && cmp.el) {
			cmp.el.update('');
		}
	},


	addSavingMask: function() {
		if (this.el) {
			this.el.mask('Saving...');
		}
	},


	removeSavingMask: function() {
		if (this.el) {
			this.el.unmask();
		}
	},


	doSave: function() {
		var me = this,
			available = me.getAvailableEditor(),
			due = me.getDueEditor(),
			availableValid = available.validate(),
			dueValid = due.validate(),
			success;

		if (!availableValid || !dueValid) {
			return;
		}

		me.addSavingMask();

		me.EditingActions.updateAssignmentDates(me.assignment, available.getSelectedDate(), due.getSelectedDate())
			.then(Promise.minWait(Globals.WAIT_TIMES.SHORT))
			.then(function(response) {
				if (response && me.onSave) {
					me.onSave();
				}
			})
			.fail(function(response) {
				//Show an error
				var error = Globals.parseError(response);

				me.showError(error);

			})
			.always(me.removeSavingMask.bind(me));
	}
});
