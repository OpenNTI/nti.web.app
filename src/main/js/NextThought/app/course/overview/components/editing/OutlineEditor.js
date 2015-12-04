Ext.define('NextThought.app.course.overview.components.editing.OutlineEditor', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-outlineeditor',

	requires: [
		'NextThought.model.courses.CourseOutline',
		'NextThought.app.course.overview.components.editing.outlinenode.Editor',
		'NextThought.app.course.overview.components.editing.contentnode.Editor',
		'NextThought.app.course.overview.components.editing.NewChild'
	],

	inheritableStatics: {
		canAddChildren: function(mimeType) {
			return !!this.PARENTS[mimeType];
		},

		canEdit: function(mimeType) {
			return !!this.EDITORS[mimeType];
		},


		getParents: function() {

		},


		getTypeEditors: function() {
			return [
				NextThought.app.course.overview.components.editing.outlinenode.Editor,
				NextThought.app.course.overview.components.editing.contentnode.Editor
			];
		},


		initRegistry: function() {
			this.setUpParents();
			this.setUpEditors();
		},


		setUpParents: function() {
			var parents = this.getParents() || [];

			this.PARENTS = parents.reduce(function(acc, item) {
				acc[item] = true;

				return acc;
			}, {});
		},


		setUpEditors: function() {
			this.EDITORS = {};

			var me = this,
				editors = me.getTypeEditors() || [];

			editors.map(function(editor) {
				var type = editor.getTypes ? editor.getTypes() : null;

				if (type) {
					type.editor = editor;
				}

				return type;
			}).forEach(function(type) {
				if (type) {
					me.setEditor(type.mimeType, type);
				}
			});
		},


		setEditor: function(mimeType, config) {
			this.EDITORS = this.EDITORS || {};

			if (this.EDITORS[mimeType]) {
				console.warn('Overriding editor for mimetype: ', mimeType);
			}

			this.EDITORS[mimeType] = config;
		}
	},


	layout: 'none',
	items: [],


	initComponent: function() {
		this.callParent(arguments);
		this.add([
			{xtype: 'box', cls: 'controls'},
			{xtype: 'container', cls: 'new-child', newChildContainer: true, layout: 'none', items: []},
			{xtype: 'container', cls: 'edit-record', editRecordContainer: true, layout: 'none', items: []}
		]);

		this.newChildContainer = this.down('[newChildContainer]');
		this.editRecordContainer = this.down('[editRecordContainer]');

		if (this.record) {
			this.editRecord(this.record);
		} else if (this.parentRecord) {
			this.addRecord(this.parentRecord);
		}
	},


	editRecord: function(record) {
		var editorType = this.self.EDITORS[record.mimeType],
			editor = editorType && editorType.editor;

		if (!editor) {
			console.error('No editor for type: ', record);
			return;
		}

		this.newChildContainer.hide();
		this.editRecordContainer.show();

		this.activeEditor = this.editRecordContainer.add(editor.create({record: record}));

		this.updateButtons({save: true});
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

		this.newChildContainer.show();
		this.editRecordContainer.hide();

		this.newChildContainer.add({
			xtype: 'overview-editing-newchild',
			types: types,
			parentRecord: parentRecord,
			showEditor: this.showNewRecordEditor.bind(this)
		});
	},


	showNewRecordEditor: function(editor, type, parentRecord) {
		this.newChildContainer.hide();
		this.editRecordContainer.show();

		this.activeEditor = this.editRecordContainer.add(editor.create({
			type: type,
			parentRecord: parentRecord
		}));

		this.updateButtons({save: true});
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
