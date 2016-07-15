const Ext = require('extjs');

require('legacy/common/form/fields/DateTimeField');

module.exports = exports = Ext.define('NextThought.app.assessment.components.editing.components.DueDate', {
	extend: 'Ext.container.Container',
	alias: 'widget.assignment-inline-due-date-editor',

	layout: 'none',
	items: [],
	cls: 'inline-due-date-editor',


	initComponent () {
		this.callParent(arguments);

		this.onCheckChanged = this.onCheckChanged.bind(this);

		this.add([
			{
				xtype: 'box',
				isDueLabel: true,
				autoEl: {
					cls: 'label',
					cn: [
						{cls: 'nti-checkbox', cn: [
							{tag: 'input', type: 'checkbox', name: 'end-date', id: 'end-date-checkbox-' + this.id},
							{tag: 'label', 'for': 'end-date-checkbox-' + this.id, html: 'Due Date'}
						]}
					]
				}
			},
			{
				xtype: 'date-time-field',
				isDueEditor: true,
				onChange: () => this.clearError()
			}
		]);
	},


	afterRender () {
		this.callParent(arguments);

		const {assignment} = this;

		this.checkbox = this.el.dom.querySelector('input[name="end-date"]');

		this.checkbox.addEventListener('change', this.onCheckChanged);

		this.on('destroy', () => {
			if (this.checkbox && this.checkbox.removeEventListener) {
				this.checkbox.removeEventListener('change', this.onCheckChanged);
			}
		});

		this.setAssignment(assignment);
	},


	getEditor () {
		return this.down('[isDueEditor]');
	},


	setAssignment (assignment) {
		this.assignment = assignment;

		if (!this.rendered) { return; }

		const editor = this.getEditor();
		const due = assignment.get('availableEnding');

		editor.selectDate(due);

		this.checkbox.checked = !!due;

		this.onCheckChanged();
	},


	onCheckChanged () {
		var editor = this.getEditor();

		if (this.checkbox.checked) {
			editor.enable();
		} else {
			editor.disable();
		}
	},


	validate () {
		const editor = this.getEditor();
		const date = editor.getSelectedDate();
		let valid = true;

		if (this.checkbox.checked && !date) {
			editor.showDateError('Please enter a date.');
			valid = false;
		}

		return valid;
	},


	getValue () {
		const editor = this.getEditor();

		return this.checkbox.checked && editor.getSelectedDate();
	}
});
