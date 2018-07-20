const Ext = require('@nti/extjs');

require('./TypeList');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.creation.ChildCreation', {
	extend: 'Ext.container.Container',
	title: 'Create New Item',
	saveText: 'Save',
	cls: 'overview-editing child-creation',
	layout: 'none',
	items: [],

	inheritableStatics: {
		getHandledMimeTypes: function () {},

		getEditors: function () {},

		getChildCreatorForRecord: function (record) {
			return this;
		},


		getTypes: function (bundle) {
			var editors = this.getEditors(bundle);

			return editors.reduce(function (acc, editor) {
				var types = editor.getTypes ? editor.getTypes() : [];

				if (!Array.isArray(types)) {
					types = [types];
				}

				types.forEach(function (type) {
					acc.push(type);
				});

				return acc;
			}, []);
		}
	},

	initComponent: function () {
		this.callParent(arguments);

		var types = this.getTypes();

		this.types = types;

		this.hasSingleType = types.length === 1;

		if (types.length === 0) {
			//TODO: show some empty state? Don't know how you could get here...
		} else if (this.hasSingleType) {
			this.showEditorForType(types[0]);
		} else {
			this.showTypeList(types);
		}
	},


	getTypes: function () {
		return this.self.getTypes(this.bundle);
	},


	setUpTypeList: function () {
		if (this.disableBack) {
			this.disableBack();
		}

		if (this.setTitle) {
			this.setTitle(this.title);
		}

		if (this.setSaveText) {
			this.setSaveText('');
		}
	},

	setUpTypeEditor: function (type) {
		if (!this.hasSingleType && this.enableBack) {
			this.enableBack(this.backText || this.title);
		}

		if (this.setTitle) {
			this.setTitle(type.editorTitle || type.title);
		}

		if (this.setSaveText) {
			this.setSaveText(this.saveText);
		}
	},

	switchToTypeList: function () {
		if (this.activeEditor) {
			this.activeEditor.destroy();
			delete this.activeEditor;
		}

		if (this.activeTypeList) {
			this.activeTypeList.show();
		}

		if (this.showFooter) {
			this.showFooter();
		}

		this.setUpTypeList();
	},

	showTypeList: function (types) {
		types = types || this.types;

		this.activeTypeList = this.add({
			xtype: 'overview-editing-typelist',
			types: types,
			parentRecord: this.parentRecord,
			rootRecord: this.rootRecord,
			showEditorForType: this.showEditorForType.bind(this)
		});

		this.setUpTypeList();
	},

	showEditorForType: function (type, params) {
		if (this.activeEditor) {
			//TODO: if we have an existing editor, do we want to prefill
			//the values that where there?
			this.activeEditor.destroy();
		}

		if (this.activeTypeList) {
			this.activeTypeList.hide();
		}

		this.setUpTypeEditor(type);

		if(type.hideFooter && this.hideFooter) {
			this.hideFooter();
		}

		this.activeEditor = this.add(type.editor.create({
			copyValues: this.copyValues,
			copyVisibility: this.copyVisibility,
			parentRecord: this.parentRecord,
			lockedPosition: this.lockedPosition,
			rootRecord: this.rootRecord,
			bundle: this.bundle,
			outlineNode: this.outlineNode,
			scrollingParent: this.scrollingParent,
			enableBack: this.enableBack.bind(this),
			enableSave: this.enableSave.bind(this),
			disableSave: this.disableSave.bind(this),
			setSaveText: this.setSaveText.bind(this),
			showError: this.showError.bind(this),
			showWarning: this.showWarning.bind(this),
			showMessage: this.showMessage.bind(this),
			doClose: this.doClose.bind(this),
			doSave: this.doSave.bind(this),
			backText: this.backText || this.title,
			doBack: this.switchToTypeList.bind(this),
			lockBodyHeight: this.lockBodyHeight,
			unlockBodyHeight: this.unlockBodyHeight,
			switchType: this.switchType.bind(this),
			hideFooter: this.hideFooter.bind(this),
			showFooter: this.showFooter.bind(this),
			params
		}));

	},

	switchType: function (newType, params) {
		this.showEditorForType(newType, params);
	},

	onBack: function () {
		if (this.activeEditor && this.activeEditor.onBack) {
			this.activeEditor.onBack();
		} else {
			this.switchToTypeList();
		}
	},

	doValidation: function () {
		if (this.activeEditor && this.activeEditor.doValidation) {
			return this.activeEditor.doValidation();
		}

		return Promise.resolve();
	},

	onSaveFailure: function (reason) {
		if (this.activeEditor && this.activeEditor.onSaveFailure) {
			return this.activeEditor.onSaveFailure(reason);
		}

		return Promise.reject();
	},

	onSave: function () {
		if (this.activeEditor && this.activeEditor.onSave) {
			return this.activeEditor.onSave();
		}

		return Promise.reject();
	},

	allowCancel: function () {
		if (this.activeEditor && this.activeEditor.isVisible() && this.activeEditor.allowCancel()) {
			return this.activeEditor.allowCancel();
		}

		return Promise.resolve();
	}
});
