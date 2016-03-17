export default Ext.define('NextThought.app.course.assessment.components.editing.DueDate', {
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

		this.onStartCheckChanged = this.onStartCheckChanged.bind(this);
		this.onEndCheckChanged = this.onEndCheckChanged.bind(this);

		me.add([
			{xtype: 'container', isContents: true, layout: 'none', cls: 'contents', items: [
				{
					xtype: 'box',
					isAvailableNow: true,
					autoEl: {
						cls: 'label available-now',
						cn: [
							{cls: 'nti-radio', cn: [
								{
									tag: 'input',
									type: 'radio',
									cls: 'start-now',
									name: 'start-date-' + me.id,
									'id': 'start-now-radio-' + me.id
								},
								{tag: 'label', 'for': 'start-now-radio-' + me.id, html: 'Available Now'}
							]}
						]
					}
				},
				{
					xtype: 'box',
					isStartLabel: true,
					autoEl: {
						cls: 'label',
						cn: [
							{cls: 'nti-radio', cn: [
								{
									tag: 'input',
									type: 'radio',
									cls: 'start-on',
									name: 'start-date-' + me.id,
									id: 'start-date-radio-' + me.id
								},
								{tag: 'label', 'for': 'start-date-radio-' + me.id, html: 'Schedule to be available on:'}
							]}
						]
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
					isDueLabel: true,
					autoEl: {
						cls: 'label',
						cn: [
							{cls: 'nti-checkbox', cn: [
								{tag: 'input', type: 'checkbox', name: 'end-date', id: 'end-date-checkbox-' + me.id},
								{tag: 'label', 'for': 'end-date-checkbox-' + me.id, html: 'Due Date'}
							]}
						]
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


	afterRender: function() {
		this.callParent(arguments);

		this.startNowRadio = this.el.dom.querySelector('input.start-now');
		this.startOnRadio = this.el.dom.querySelector('input.start-on');
		this.endCheckbox = this.el.dom.querySelector('input[name="end-date"]');

		var me = this,
			assignment = me.assignment,
			available = assignment && assignment.get('availableBeginning'),
			due = assignment && assignment.get('availableEnding');

		me.startNowRadio.addEventListener('change', me.onStartCheckChanged);
		me.startOnRadio.addEventListener('change', me.onStartCheckChanged);
		me.endCheckbox.addEventListener('change', me.onEndCheckChanged);


		me.startNowRadio.checked = !available;
		me.startOnRadio.checked = !!available;
		me.endCheckbox.checked = !!due;

		me.on('destroy', function() {
			if (me.startCheckbox && me.startCheckbox.removeEventListener) {
				me.startCheckbox.removeEventListener('change', me.onStartCheckChanged);
			}

			if (me.endCheckbox && me.endCheckbox.removeEventListener) {
				me.endCheckbox.removeEventListener('change', me.onEndCheckChanged);
			}
		});


		me.onStartCheckChanged();
		me.onEndCheckChanged();
	},


	onStartCheckChanged: function(e) {
		var editor = this.getAvailableEditor();

		if (this.startOnRadio.checked) {
			editor.enable();
		} else {
			editor.disable();
		}
	},


	onEndCheckChanged: function(e) {
		var editor = this.getDueEditor();

		if (this.endCheckbox.checked) {
			editor.enable();
		} else {
			editor.disable();
		}
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
			availableDate = null, dueDate = null,
			success;

		if (!availableValid || !dueValid) {
			return;
		}

		if (this.startOnRadio.checked) {
			availableDate = available.getSelectedDate();
		}

		if (this.endCheckbox.checked) {
			dueDate = due.getSelectedDate();
		}

		me.addSavingMask();

		me.EditingActions.updateAssignmentDates(me.assignment, availableDate, dueDate)
			.then(Promise.minWait(Globals.WAIT_TIMES.SHORT))
			.then(function(response) {
				if (response && me.onSave) {
					me.onSave();
				}
			})
			.fail(function(response) {
				//Show an error
				var error = Globals.parseError(response);

				me.showError(error && error.message);

			})
			.always(me.removeSavingMask.bind(me));
	}
});
