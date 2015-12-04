Ext.define('NextThought.app.course.overview.components.editing.Editor', {
	extend: 'Ext.container.Container',
	//this is only extended, never should need to be instantiated

	requires: [
		'NextThought.common.form.Form'
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


	getDefaultValues: function() {},


	getFormAction: function() {
		if (this.record) { return this.record.getLink('edit'); }
		return null;
	},


	getFormMethod: function() {
		return this.record ? 'PUT' : 'POST';
	},


	onFormChange: function(values) {
		if (this.preview && this.preview.update) {
			this.preview.update(values);
		}
	},


	onClose: function() {
		if (this.doClose) {
			this.doClose();
		}
	},


	onSave: function() {},


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
