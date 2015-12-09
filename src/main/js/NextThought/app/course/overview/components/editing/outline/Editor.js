Ext.define('NextThought.app.course.overview.components.editing.outline.Editor', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-outline-editor',

	requires: [
		'NextThought.app.course.overview.components.editing.outline.outlinenode.Editor',
		'NextThought.app.course.overview.components.editing.outline.calendarnode.Editor',
		'NextThought.app.course.overview.components.editing.outline.contentnode.Editor',
		'NextThought.app.course.overview.components.editing.creation.TypeList',
		'NextThought.model.courses.CourseOutline',
		'NextThought.app.course.overview.components.editing.outline.InlineEditor'
	],


	inheritableStatics: {
		canAddChildren: function(mimeType) {
			return !!this.PARENTS[mimeType];
		},


		canEdit: function(mimeType) {
			return !!this.EDITORS[mimeType];
		},


		getParent: function(mimeType) {
			return this.PARENTS[mimeType];
		},


		getEditor: function(mimeType) {
			return this.EDITORS[mimeType];
		},


		getInlineEditor: function(mimeType) {
			return this.INLINE_EDITORS[mimeType];
		},


		getParents: function() {
			return [
				NextThought.model.courses.CourseOutline.mimeType
			];
		},


		getTypeEditors: function() {
			var base = NextThought.app.course.overview.components.editing.outline;

			return [
				base.calendarnode.Editor,
				base.contentnode.Editor,
				base.outlinenode.Editor
			];
		},


		getInlineEditors: function(){
			return [
				NextThought.app.course.overview.components.editing.outline.InlineEditor
			];
		},


		initRegistry: function() {
			this.setUpParents();
			this.setUpEditors();
			this.setUpInlineEditors();
		},


		setUpParents: function() {
			var parents = this.getParents() || [];

			this.PARENTS = parents.reduce(function(acc, item) {
				acc[item] = true;

				return acc;
			}, {});
		},


		setUpEditors: function() {
			var editors = this.getTypeEditors() || [];

			this.EDITORS = editors.reduce(function(acc, item) {
				var type = item.getTypes ? item.getTypes() : null;

				if (type) {
					type.editor = item;

					acc[type.mimeType] = type;
				}

				return acc;
			}, {});
		},


		setUpInlineEditors: function() {
			var editors = this.getInlineEditors() || [];

			this.INLINE_EDITORS = editors.reduce(function(acc, item) {
				var type = item.getTypes ? item.getTypes() : null;

				if (type) {
					type.editor = item;

					acc[type.mimeType] = type;
				}

				return acc;
			}, {});
		}
	},


	layout: 'none',
	items: [],


	initComponent: function() {
		this.callParent(arguments);

		this.add([
			{xtype: 'container', cls: 'new-child', newChildContainer: true, layout: 'none', items: []},
			{xtype: 'container', cls: 'edit-record', editRecordContainer: true, layout: 'none', items: []}
		]);

		this.newChildContainer = this.down('[newChildContainer]');
		this.editRecordContainer = this.down('[editRecordContainer]');

		if (this.record) {
			this.editRecord(this.record, this.parentRecord);
		} else if (this.parentRecord) {
			this.addRecord(this.parentRecord);
		}
	},


	editRecord: function(record, parentRecord) {
		var type = this.self.getEditor(record.mimeType),
			editor = type && type.editor;

		if (!editor) {
			console.error('No editor for type: ', record);
			return;
		}

		this.showEditor(editor.create({
			record: record,
			parentRecord: parentRecord,
			rootRecord: this.rootRecord,
			enableSave: this.enableSave.bind(this),
			disableSave: this.disableSave.bind(this),
			scrollingParent: this.scrollingParent
		}));
	},


	showEditor: function(editor) {
		this.editRecordContainer.removeAll(true);

		delete this.activeTypeList;
		this.activeEditor = this.editRecordContainer.add(editor);

		this.newChildContainer.hide();
		this.editRecordContainer.show();
	},


	showTypes: function(typelist) {
		this.newChildContainer.removeAll(true);

		delete this.activeEditor;
		this.activeTypeList = this.newChildContainer.add(typelist);

		this.editRecordContainer.hide();
		this.newChildContainer.show();
	},


	getTypes: function() {
		var editors = this.self.EDITORS,
			keys = Object.keys(editors);

		return keys.reduce(function(acc, key) {
			var editor = editors[key];

			editor.types.forEach(function(type) {
				type.editor = editor.editor;

				acc.push(type);
			});

			return acc;
		}, []);
	},


	addRecord: function(parentRecord) {
		var types = this.getTypes();

		this.showTypes({
			xtype: 'overview-editing-typelist',
			types: types,
			parentRecord: parentRecord,
			showNewRecordEditor: this.showNewRecordEditor.bind(this)
		});
	},


	showNewRecordEditor: function(editor, type, parentRecord) {
		this.showEditor(editor.create({
			type: type,
			parentRecord: parentRecord,
			rootRecord: this.rootRecord,
			scrollingParent: this.scrollingParent,
			enableSave: this.enableSave.bind(this),
			disableSave: this.disableSave.bind(this)
		}));
	},


	doSave: function() {
		if (this.activeEditor) {
			return this.activeEditor.doSave();
		}

		return Promise.reject();
	}
}, function() {
	this.initRegistry();
});
