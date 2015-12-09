Ext.define('NextThought.app.course.overview.components.editing.Editor', {
	extend: 'Ext.container.Container',
	//this is only extended, never should need to be instantiated

	requires: [
		'NextThought.common.form.Form',
		'NextThought.app.course.overview.components.editing.Actions'
	],

	cls: 'content-editor',

	/**
	 * The Schema used to set up the fields
	 * @override
	 * @type {Array}
	 */
	FORM_SCHEMA: [],

	layout: 'none',
	items: [],


	initComponent: function() {
		this.callParent(arguments);

		var values = this.getDefaultValues();

		this.EditingActions = NextThought.app.course.overview.components.editing.Actions.create();

		this.parentSelection = this.addParentSelection(this.record, this.parentRecord, this.rootRecord);

		// this.preview = this.addPreview(values);

		this.formCmp = this.add({
			xtype: 'common-form',
			schema: this.getFormSchema(),
			defaultValues: values,
			action: this.getFormAction(),
			method: this.getFormMethod(),
			onChange: this.onFormChange.bind(this),
			onSuccess: this.onSaveSuccess.bind(this),
			onFailure: this.onSaveFailure.bind(this)
		});
	},


	getFormSchema: function() {
		return this.FORM_SCHEMA;
	},

	addPreview: function() {},
	addParentSelection: function(record, parent, root) {},

	getDefaultValues: function() {},


	getFormAction: function() {
		if (this.record) {
			return this.record.getLink('edit');
		} else if (this.parentRecord && this.parentRecord.getAppendLink) {
			return this.parentRecord.getAppendLink();
		}
		return null;
	},

	//TODO: once the parent selection stuff is up, we'll need to
	//figure out how to get the href for creating, or moving to a new spot
	updateFormAction: function() {},


	getFormMethod: function() {
		return this.record ? 'PUT' : 'POST';
	},


	onFormChange: function(values) {
		if (this.preview && this.preview.update) {
			this.preview.update(values);
		}

		if (this.formCmp.isValid()) {
			this.allowSubmission();
		} else {
			this.disallowSumbission();
		}
	},


	allowSubmission: function() {
		if (this.enableSave) {
			this.enableSave();
		}
	},


	disallowsubmission: function() {
		if (this.disableSave) {
			this.disableSave();
		}
	},


	onClose: function() {
		if (this.doClose) {
			this.doClose();
		}
	},


	doSave: function() {
		var parentSelection = this.parentSelection,
			originalParent = parentSelection && parentSelection.getOriginalSelection(),
			currentParent = parentSelection && parentSelection.getCurrentSelection();

		return this.EditingActions.saveEditorForm(this.formCmp, this.record, originalParent, currentParent, this.rootRecord);
	},


	onSaveSuccess: function(response) {
		if (this.record) {
			this.record.syncWithResponse(response);
		}

		this.onClose();
	},


	onSaveFailure: function(reason) {
		//TODO: show the error to the use
		console.log('Failed to save form: ' + reason);
	},


	createNewRecord: function(data) {}
});
