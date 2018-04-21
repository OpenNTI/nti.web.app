const Ext = require('@nti/extjs');
const {InlineEditor} = require('@nti/web-assignment-editor');

require('legacy/common/form/fields/DateTimeField');

module.exports = exports = Ext.define('NextThought.app.course.assessment.components.editing.InlineEditor', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-duedate-editor',
	cls: 'assignment-due-date-editor',
	layout: 'none',
	items: [],

	initComponent: function () {
		this.callParent(arguments);

		const {assignment} = this;

		assignment.getInterfaceInstance().then(assignmentModel => {
			this.add([
				{
					xtype: 'react',
					component: InlineEditor,
					assignment: assignmentModel,
					assignmentRef: {
						NTIID: assignment.get('NTIID')
					},
					onDismiss: async (savedData) => {
						if(savedData) {
							await this.assignment.updateFromServer();

							//this.setAssignment(this.assignment);

							if (this.onSave) {
								this.onSave();
							}
						}

						this.doCancel();
					}
				}
			]);
		});
	},


	afterRender () {
		this.callParent(arguments);
	},


	doCancel () {
		if (this.onCancel) {
			this.onCancel();
		}
	}
});
