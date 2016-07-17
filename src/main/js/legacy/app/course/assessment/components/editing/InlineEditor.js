const Ext = require('extjs');
const Globals = require('../../../../../util/Globals');
const PublishState = require('./components/PublishState');
const DueDate = require('./components/DueDate');

require('../../../../../common/form/fields/DateTimeField');
require('../../../editing/Actions');


module.exports = exports = Ext.define('NextThought.app.course.assessment.components.editing.InlineEditor', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-duedate-editor',
	cls: 'assignment-due-date-editor',
	layout: 'none',
	items: [],

	initComponent: function () {
		this.callParent(arguments);

		const {assignment} = this;
		const clearError = () => this.clearError();

		this.EditingActions = NextThought.app.course.editing.Actions.create();

		this.add([
			{xtype: 'container', isContents: true, layout: 'none', cls: 'contents', items: [
				new PublishState({assignment, clearError, isPublishEditor: true}),
				new DueDate({assignment, clearError, isDueDateEditor: true}),
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
						fn: (e) => {
							if (e.getTarget('.cancel')) {
								this.doCancel();
							} else if (e.getTarget('.save')) {
								this.doSave();
							}
						}
					}
				}
			}
		]);
	},


	afterRender () {
		this.callParent(arguments);
	},


	getPublishEditor () {
		return this.down('[isPublishEditor]');
	},


	getDueDateEditor () {
		return this.down('[isDueDateEditor]');
	},


	setAssignment (assignment) {
		this.assignment = assignment;

		const publishEditor = this.getPublishEditor();
		const dueDateEditor = this.getDueDateEditor();

		publishEditor.setAssignment(assignment);
		dueDateEditor.setAssignment(assignment);
	},


	doCancel () {
		const {assignment} = this;
		const publishEditor = this.getPublishEditor();
		const dueDateEditor = this.getDueDateEditor();

		if (this.onCancel) {
			this.onCancel();
		}

		publishEditor.setAssignment(assignment);
		dueDateEditor.setAssignment(assignment);
	},

	showError: function (msg) {
		var cmp = this.down('[isError]');

		if (cmp && cmp.el) {
			cmp.el.update(msg || 'Unable to update dates');
		}
	},

	clearError: function () {
		var cmp = this.down('[isError]');

		if (cmp && cmp.el) {
			cmp.el.update('');
		}
	},

	addSavingMask: function () {
		if (this.el) {
			this.el.mask('Saving...');
		}
	},

	removeSavingMask: function () {
		if (this.el) {
			this.el.unmask();
		}
	},

	doSave: function () {
		const publishEditor = this.getPublishEditor();
		const dueDateEditor = this.getDueDateEditor();
		const publishValid = publishEditor.validate();
		const dueDateValid = dueDateEditor.validate();

		if (!publishValid || !dueDateValid) {
			return;
		}

		const publishValues = publishEditor.getValues();
		const dueDateValues = dueDateEditor.getValues();

		this.addSavingMask();

		this.EditingActions.updateAssignment(this.assignment, publishValues, dueDateValues)
			.then(Promise.minWait(Globals.WAIT_TIMES.SHORT))
			.then(() => {
				this.setAssignment(this.assignment);

				if (this.onSave) {
					this.onSave();
				}
			})
			.catch((reason) => {
				var error = Globals.parseError(reason);

				this.showError(error && error.message);
			})
			.always(() => this.removeSavingMask());

	// 	var me = this,
	// 		available = me.getAvailableEditor(),
	// 		due = me.getDueEditor(),
	// 		availableValid = available.validate(),
	// 		dueValid = due.validate(),
	// 		availableDate = null, dueDate = null,
	// 		isValid = true;

	// 	if (!availableValid || !dueValid) {
	// 		return;
	// 	}

	// 	if (this.startOnRadio.checked) {
	// 		availableDate = available.getSelectedDate();

	// 		if (!availableDate) {
	// 			available.showDateError('Please enter a date.');
	// 			isValid = false;
	// 		}
	// 	}

	// 	if (this.endCheckbox.checked) {
	// 		dueDate = due.getSelectedDate();

	// 		if (!dueDate) {
	// 			due.showDateError('Please enter a date.');
	// 			isValid = false;
	// 		}
	// 	}

	// 	if (!isValid) { return; }

	// 	me.addSavingMask();

	// 	me.EditingActions.updateAssignmentDates(me.assignment, availableDate, dueDate)
	// 		.then(Promise.minWait(Globals.WAIT_TIMES.SHORT))
	// 		.then(function (response) {
	// 			// Keep everythign in sync.
	// 			availableDate = me.assignment.get('availableBeginning'),
	// 			dueDate = me.assignment.get('availableEnding');
	// 			me.selectAvailableDate(availableDate);
	// 			me.selectDueDate(dueDate);

	// 			if (response && me.onSave) {
	// 				me.onSave();
	// 			}
	// 		})
	// 		.catch(function (response) {
	// 			//Show an error
	// 			var error = Globals.parseError(response);

	// 			me.showError(error && error.message);

	// 		})
	// 		.always(me.removeSavingMask.bind(me));
	}
});
