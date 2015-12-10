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
			return !!this.CREATORS[mimeType];
		},


		canEdit: function(mimeType) {
			return !!this.EDITORS[mimeType];
		},


		getChildCreator: function(mimeType) {
			return this.CREATORS[mimeType];
		},


		getEditor: function(mimeType) {
			return this.EDITORS[mimeType];
		},


		getInlineEditor: function(mimeType) {
			return this.INLINE_EDITORS[mimeType];
		},


		getCreators: function() {
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


		getInlineEditors: function() {
			return [
				NextThought.app.course.overview.components.editing.outline.InlineEditor
			];
		},


		initRegistry: function() {
			this.setUpChildCreators();
			this.setUpEditors();
			this.setUpInlineEditors();
		},


		setUpChildCreators: function() {
			var creators = this.getCreators() || [];

			this.CREATORS = creators.reduce(function(acc, item) {
				var handled = item.getHandledMimeTypes ? item.getHandledMimeTypes() : [];

				handled.forEach(function(type) {
					if (acc[type]) {
						console.warn('Overriding type picker form mimetype: ', type);
					}

					acc[type] = item;
				});

				return acc;
			}, {});
		},


		setUpEditors: function() {
			var editors = this.getTypeEditors() || [];

			this.EDITORS = editors.reduce(function(acc, editor) {
				var handled = editor.getHandledMimeTypes ? editor.getHandledMimeTypes() : [];

				handled.forEach(function(type) {
					if (acc[type]) {
						console.warn('Overriding editor for mimetype: ', type);
					}
					acc[type] = editor;
				});

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

		if (this.record) {
			this.editRecord(this.record, this.parentRecord, this.rootRecord);
		} else if (this.parentRecord) {
			this.addRecord(this.parentRecord, this.rootRecord);
		}
	},


	getConfig: function(record, parentRecord, rootRecord) {
		return {
			record: record,
			parentRecord: parentRecord,
			rootRecord: rootRecord,
			enableSave: this.enableSave.bind(this),
			disableSave: this.disableSave.bind(this),
			setTitle: this.setHeaderTitle.bind(this),
			enableBack: this.enableHeaderBack.bind(this),
			disableBack: this.disableHeaderBack.bind(this),
			scrollingParent: this.scrollingParent
		};
	},


	editRecord: function(record, parentRecord, rootRecord) {
		var editor = this.self.getEditor(record.mimeType),
			cmp = editor && editor.getEditorForRecord(record);

		if (!cmp) {
			console.error('No editor to edit record: ', record.mimeType);
			return;
		}

		this.activeEditor = this.add(cmp.create(this.getConfig(record, parentRecord, rootRecord)));
	},


	addRecord: function(parentRecord, rootRecord) {
		var editor = this.self.getChildCreator(parentRecord.mimeType),
			cmp = editor && editor.getChildCreatorForRecord(parentRecord);

		if (!cmp) {
			console.error('No editor to add child to: ', parentRecord.mimeType);
			return;
		}

		this.activeEditor = this.add(cmp.create(this.getConfig(null, parentRecord, rootRecord)));
	},


	enableSave: function() {},
	disableSave: function() {},

	setHeaderTitle: function() {},
	enableHeaderBack: function() {},
	disableHeaderBack: function() {},

	doSave: function() {
		if (this.activeEditor) {
			return this.activeEditor.doSave();
		}

		return Promise.reject();
	}
}, function() {
	this.initRegistry();
});
