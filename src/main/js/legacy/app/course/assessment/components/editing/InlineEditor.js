const Ext = require('extjs');
const Globals = require('../../../../../util/Globals');
const PublishState = require('./components/PublishState');
const DueDate = require('./components/DueDate');
const ResetMenu = require('./components/Reset');

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
				new ResetMenu({assignment, isResetMenu: true, onReset: () => this.onReset(), beforeReset: () => this.beforeReset()}),
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


	getResetMenu () {
		return this.down('[isResetMenu]');
	},


	setAssignment (assignment) {
		this.assignment = assignment;

		const publishEditor = this.getPublishEditor();
		const dueDateEditor = this.getDueDateEditor();
		const resetMenu = this.getResetMenu();

		resetMenu.setAssignment(assignment);
		publishEditor.setAssignment(assignment);
		dueDateEditor.setAssignment(assignment);
	},


	beforeReset () {
		this.addSavingMask();
	},


	onReset () {
		this.setAssignment(this.assignment);
		this.removeSavingMask();
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

		this.EditingActions.updateAssignment(this.assignment, publishValues, dueDateValues, this.bundle)
			.then(Promise.minWait(Globals.WAIT_TIMES.SHORT))
			.then(() => {
				this.setAssignment(this.assignment);

				if (this.onSave) {
					this.onSave();
				}
			})
			.catch((reason) => {
				var error = Globals.parseError(reason);

				this.setAssignment(this.assignment);
				this.showError(error && error.message);
			})
			.always(() => this.removeSavingMask());
	}
});
