Ext.define('NextThought.app.course.overview.components.editing.creation.ChildCreation', {
	extend: 'Ext.container.Container',
	//this shouldn't be instantiated, only extended

	requires: [
		'NextThought.app.course.overview.components.editing.creation.TypeList'
	],

	title: 'Create New Item',
	saveText: 'Save',

	cls: 'overview-editing child-creation',

	layout: 'none',
	items: [],


	inheritableStatics: {
		getHandledMimeTypes: function() {},

		getEditors: function() {},

		getChildCreatorForRecord: function(record) {
			return this;
		},


		getTypes: function() {
			var editors = this.getEditors();

			return editors.reduce(function(acc, editor) {
				var types = editor.getTypes ? editor.getTypes() : [];

				if (!Array.isArray(types)) {
					types = [types];
				}

				types.forEach(function(type) {
					acc.push(type);
				});

				return acc;
			}, []);
		}
	},


	initComponent: function() {
		this.callParent(arguments);

		var types = this.self.getTypes();

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


	setUpTypeList: function() {
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


	setUpTypeEditor: function(type) {
		if (!this.hasSingleType && this.enableBack) {
			this.enableBack(this.backText || this.title);
		}

		if (this.setTitle) {
			this.setTitle(type.title);
		}

		if (this.setSaveText) {
			this.setSaveText(this.saveText);
		}
	},


	switchToTypeList: function() {
		if (this.activeEditor) {
			this.activeEditor.hide();
		}

		if (this.activeTypeList) {
			this.activeTypeList.show();
		}

		this.setUpTypeList();
	},


	showTypeList: function(types) {
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


	showEditorForType: function(type) {
		if (this.activeEditor) {
			//TODO: if we have an existing editor, do we want to prefill
			//the values that where there?
			this.activeEditor.destroy();
		}

		if (this.activeTypeList) {
			this.activeTypeList.hide();
		}

		this.activeEditor = this.add(type.editor.create({
			parentRecord: this.parentRecord,
			rootRecord: this.rootRecord,
			scrollingParent: this.scrollingParent,
			enableSave: this.enableSave.bind(this),
			disableSave: this.disableSave.bind(this),
			showError: this.showError.bind(this),
			showWarning: this.showWarning.bind(this),
			showMessage: this.showMessage.bind(this),
			doClose: this.doClose.bind(this),
			doSave: this.doSave.bind(this)
		}));

		this.setUpTypeEditor(type);
	},


	onBack: function() {
		this.switchToTypeList();
	},


	doValidation: function() {
		if (this.activeEditor && this.activeEditor.doValidation) {
			return this.activeEditor.doValidation();
		}

		return Promise.resolve();
	},


	onSaveFailure: function(reason) {
		if (this.activeEditor && this.activeEditor.onSaveFailure) {
			return this.activeEditor.onSaveFailure(reason);
		}

		return Promise.reject();
	},



	onSave: function() {
		if (this.activeEditor && this.activeEditor.onSave) {
			return this.activeEditor.onSave();
		}

		return Promise.reject();
	},


	allowCancel: function() {
		if (this.activeEditor && this.activeEditor.isVisible() && this.activeEditor.allowCancel()) {
			return this.activeEditor.allowCancel();
		}

		return Promise.resolve();
	}
});
