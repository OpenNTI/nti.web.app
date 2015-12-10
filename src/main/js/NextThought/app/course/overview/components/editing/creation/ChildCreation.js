Ext.define('NextThought.app.course.overview.components.editing.creation.ChildCreation', {
	extend: 'Ext.container.Container',
	//this shouldn't be instantiated, only extended

	requires: [
		'NextThought.app.course.overview.components.editing.creation.TypeList'
	],

	title: 'Create New Item',

	cls: 'child-creation',

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

		this.hasSingleType = types.length === 1;

		if (types.length === 0) {
			//TODO: show some empty state? Don't know how you could get here...
		} else if (this.hasSingleType) {
			this.showEditorForType(types[0]);
		} else {
			this.showTypeList(types);
		}
	},


	showTypeList: function(types) {
		this.activeTypeList = this.add({
			xtype: 'overview-editing-typelist',
			types: types,
			parentRecord: this.parentRecord,
			rootRecord: this.rootRecord,
			showEditorForType: this.showEditorForType.bind(this)
		});

		this.disableBack();
		this.setTitle(this.title);
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
			disableSave: this.enableSave.bind(this)
		}));

		if (!this.hasSingleType) {
			this.enableBack();
		}

		this.setTitle(type.title);
	},


	doSave: function() {
		if (this.activeEditor.doSave) {
			return this.activeEditor.doSave();
		}

		return Promise.reject();
	}
});
