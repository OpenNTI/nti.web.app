const Ext = require('extjs');
const {wait} = require('nti-commons');

const Globals = require('legacy/util/Globals');
const Form = require('legacy/common/form/Form');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.parentselection.NewItem', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-parentselection-newitem',

	cls: 'over-editit-parentselection-newitem',
	layout: 'none',
	items: [],


	initComponent: function () {
		this.callParent(arguments);

		if (!this.editor) {
			this.onBackClick();
			return;
		}

		var items = [];

		items.push({
			xtype: 'box',
			autoEl: {
				cls: 'error-msg'
			}
		});

		items.push(this.editor.create({isEditor: true, parentRecord: this.parentRecord, onChange: this.onChange.bind(this)}));

		if (this.hasOtherItems) {
			items.push({
				xtype: 'box',
				autoEl: {
					cls: 'back',
					html: 'Cancel'
				},
				listeners: {
					click: {
						element: 'el',
						fn: this.onBackClick.bind(this)
					}
				}
			});
		}

		items.push({
			xtype: 'box',
			autoEl: {
				cls: 'save',
				html: 'Create'
			},
			listeners: {
				click: {
					element: 'el',
					fn: this.onSave.bind(this)
				}
			}
		});

		this.add(items);

		this.editorCmp = this.down('[isEditor]');
	},


	renderSelectors: {
		errorEl: '.error-msg'
	},


	onBackClick: function () {
		if (this.onBack) {
			this.onBack();
		}
	},


	addMask: function () {
		this.el.mask('Saving...');
	},


	unMask: function () {
		this.el.unmask();
	},


	getErrors () {
		let errors = this.editorCmp && this.editorCmp.getErrors();
		let fields = errors && Object.keys(errors);
		let msgs = [], required;

		(fields || []).forEach(function (field) {
			var error = errors[field];

			if (error.missing) {
				if (required) {
					required.fields.push(field);
				} else {
					required = {
						msg: Form.getMessageForError(error),
						error: error,
						fields: [field]
					};

					msgs.push(required);
				}
			} else {
				msgs.push({
					msg: Form.getMessageForError(error),
					error: error,
					key: field,
					fields: [field]
				});
			}
		});

		return msgs;
	},


	maybeClearErrors () {
		let editorCmp = this.editorCmp;

		this.errorEl.setHTML('');

		this.activeErrors = (this.activeErrors || []).reduce((acc, error) => {
			error.fields = error.fields.reduce((ac, field) => {
				if (!editorCmp.getErrorsFor(field)) {
					editorCmp.removeErrorOn(field);
				} else {
					ac.push(field);
				}

				return ac;
			}, []);

			if (error.fields.length > 0) {
				acc.push(error);
			}

			return acc;
		}, []);
	},


	clearErrors () {
		let editorCmp = this.editorCmp;

		this.errorEl.setHTML('');

		this.activeErrors = (this.activeErrors || []).reduce((acc, error) => {
			error.fields = error.fields.reduce((ac, field) => {
				editorCmp.removeErrorOn(field);

				return ac;
			}, []);

			return acc;
		}, []);
	},


	doValidation () {
		let editorCmp = this.editorCmp;
		let errors = this.getErrors();

		if (errors.length > 1) {
			console.warn('More errors than we know how to show');
		}

		this.activeErrors = errors.reduce((acc, error) => {
			error.fields.forEach((field) => {
				editorCmp.showErrorOn(field);
			});

			acc.push(error);

			return acc;
		}, this.activeErrors || []);

		if (this.activeErrors[0]) {
			this.errorEl.setHTML(this.activeErrors[0].msg);
		}

		return this.activeErrors.length ? Promise.reject() : Promise.resolve();
	},


	onChange () {
		this.maybeClearErrors();
	},


	onSave: function () {
		var value = this.editorCmp.getValue(),
			minWait = Globals.WAIT_TIMES.SHORT,
			start = new Date(),
			me = this;

		if (!this.parentRecord || !this.parentRecord.appendContent) { return; }

		this.clearErrors();

		this.doValidation()
			.then(() => {
				this.addMask();

				return this.parentRecord.appendContent(value)
					.then(function (result) {
						var end = new Date(),
							duration = end - start;

						if (duration < minWait) {
							return wait(minWait - duration)
								.then(function () {
									return result;
								});
						}

						return result;
					})
					.then(this.addNewItem.bind(this))
					.then(this.unMask.bind(this))
					.catch(function (error) {
						me.unMask();
						me.errorEl.setHTML('Unable to create section');
						if (error) {
							console.error('Unable to create section because: ' + error);
						}
					});
			});
	},


	addNewItem: function (record) {
		if (this.afterCreation) {
			this.afterCreation(record);
		}
	}
});
