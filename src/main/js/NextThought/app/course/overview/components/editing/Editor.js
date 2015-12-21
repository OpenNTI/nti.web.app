Ext.define('NextThought.app.course.overview.components.editing.Editor', {
	extend: 'Ext.container.Container',
	//this is only extended, never should need to be instantiated

	requires: [
		'NextThought.common.form.Form',
		'NextThought.app.course.overview.components.editing.Actions'
	],

	saveText: 'Save',
	headerTitle: 'Edit',

	cls: 'content-editor',


	inheritableStatics: {
		/**
		 * Return a list of mimeTypes that this editor can
		 * handle editing or creating.
		 *
		 * @override
		 * @return {[String]} list of mimeTypes
		 */
		getHandledMimeTypes: function() { return []; },


		handlesMimeType: function(mimeType) {
			var handled = this.getHandledMimeTypes();

			return handled.indexOf(mimeType) >= 0;
		},


		/**
		 * Returns the type this editor handles
		 *
		 * A type looks like:
		 *
		 * {
		 * 	title: String, //The name of the type
		 * 	description: String, // A short description
		 * 	iconCls: String, // A class to apply so css can pick an icon
		 * 	editor: Class //The component to instantiate to create the editor
		 * }
		 *
		 * @override
		 * @return {[Object]} the types this editor handles
		 */
		getTypes: function() {},


		/**
		 * Get the editor to instantiate for a record.
		 *
		 * @override
		 * @param  {Object} record the record to edit
		 * @return {Object}       	Null or the Class for the editor
		 */
		getEditorForRecord: function(record) {
			if (this.handlesMimeType(record.mimeType)) {
				return this;
			}
		}
	},

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


		this.EditingActions = NextThought.app.course.overview.components.editing.Actions.create();

		this.parentSelection = this.addParentSelection(this.record, this.parentRecord, this.rootRecord, this.onFormChange.bind(this));

		if (this.setSaveText) {
			this.setSaveText(this.getSaveText());
		}

		if (this.setTitle) {
			this.setTitle(this.getHeaderTitle());
		}

		this.formCmp = this.addFormCmp();
	},


	getSaveText: function() {
		return this.saveText;
	},


	getHeaderTitle: function() {
		var types = this.self.getTypes(),
			type = types && types[0];

		return type ? type.title : this.headerTitle;
	},


	getFormSchema: function() {
		return this.FORM_SCHEMA;
	},

	addPreview: function() {},
	addParentSelection: function(record, parent, root) {},


	addFormCmp: function() {
		var value = this.getDefaultValues();

		return this.add({
			xtype: 'common-form',
			schema: this.getFormSchema(),
			defaultValues: values,
			action: this.getFormAction(),
			method: this.getFormMethod(),
			onChange: this.onFormChange.bind(this)
		});
	},


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


	isValid: function() {
		var valid = true;

		//If we have a parent selection menu, it has to have a selection to be valid
		if (this.parentSelection && !this.parentSelection.getCurrentSelection()) {
			valid = false;
		}

		//Make sure the form is valid
		if (valid && this.formCmp && !this.formCmp.isValid()) {
			valid = false;
		}

		return valid;
	},


	isEmpty: function() {
		return this.formCmp && this.formCmp.isEmpty();
	},


	onFormChange: function(values) {
		if (!this.isEmpty()) {
			this.enableSubmission();
		} else {
			this.disableSubmission();
		}

		if (this.activeErrors) {
			this.maybeClearErrors();
		}
	},


	enableSubmission: function() {
		if (this.enableSave) {
			this.enableSave();
		}
	},


	disableSubmission: function() {
		if (this.disableSave) {
			this.disableSave();
		}
	},


	allowCancel: function() {
		//TODO: fill this out
		return Promise.resolve();
	},


	getFormErrors: function() {
		var errors = this.formCmp && this.formCmp.getErrors(),
			fields = Object.keys(errors),
			msgs = [], required;

		fields.forEach(function(field) {
			var error = errors[field];

			if (error.missing) {
				if (required) {
					required.fields.push(field);
				} else {
					required = {
						msg: NextThought.common.form.Form.getMessageForError(error),
						error: error,
						fields: [field]
					};

					msgs.push(required);
				}
			} else {
				msgs.push({
					msg: NextThought.common.form.Form.getMessageForError(error),
					error: error,
					key: field,
					fields: [field]
				});
			}
		});

		return msgs;
	},


	getErrors: function() {
		return this.getFormErrors();
	},


	maybeClearErrors: function() {
		var form = this.formCmp;


		this.activeErrors = (this.activeErrors || []).reduce(function(acc, error) {
			error.fields = error.fields.reduce(function(acc, field) {
				var error = form.getErrorsFor(field);

				if (!form.getErrorsFor(field)) {
					form.removeErrorOn(field);
				} else {
					acc.push(field);
				}

				return acc;
			}, []);

			if (error.fields.length > 0) {
				acc.push(error);
			}

			if (error.headerBar && error.headerBar.remove) {
				error.headerBar.remove();
			}

			return acc;
		}, []);
	},


	doValidation: function() {
		var me = this,
			form = me.formCmp,
			errors = me.getErrors();

		if (!form) { return Promise.reject(); }

		me.activeErrors = errors.map(function(error) {
			error.fields.forEach(form.showErrorOn.bind(form));
			error.headerBar = me.showError(error.msg);

			return error;
		});

		return errors.length > 0 ? Promise.reject() : Promise.resolve();
	},


	doSave: function() {
		var parentSelection = this.parentSelection,
			originalParent = parentSelection && parentSelection.getOriginalSelection(),
			currentParent = parentSelection && parentSelection.getCurrentSelection();

		return this.EditingActions.saveEditorForm(this.formCmp, this.record, originalParent, currentParent, this.rootRecord);
	}
});
