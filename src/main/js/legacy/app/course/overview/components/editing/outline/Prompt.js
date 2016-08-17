var Ext = require('extjs');

require('./outlinenode/Editor');
require('./calendarnode/Editor');
require('./contentnode/Editor');
require('../creation/TypeList');
require('../../../../../../model/courses/CourseOutline');
require('./outlinenode/InlineEditor');
require('./contentnode/InlineEditor');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.outline.Prompt', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-outline-editor',

	inheritableStatics: {
		canAddChildren: function (mimeType) {
			return !!this.CREATORS[mimeType];
		},


		canEdit: function (record) {
			var editor = this.EDITORS[record.mimeType],
				typeEditor = editor && editor.getEditorForRecord(record);

			return !!typeEditor;
		},


		getChildCreator: function (mimeType) {
			return this.CREATORS[mimeType];
		},


		getEditor: function (mimeType) {
			return this.EDITORS[mimeType];
		},


		getInlineEditor: function (mimeType) {
			return this.INLINE_EDITORS[mimeType];
		},


		getCreators: function () {
			return [
				NextThought.model.courses.CourseOutline.mimeType
			];
		},


		getTypeSwitcher: function (mimeType) {
			return this.TYPE_SWITCHERS[mimeType];
		},


		getTypeEditors: function () {
			var base = NextThought.app.course.overview.components.editing.outline;

			return [
				base.calendarnode.Editor,
				base.contentnode.Editor,
				base.outlinenode.Editor
			];
		},


		getInlineEditors: function () {
			return [
				NextThought.app.course.overview.components.editing.outline.outlinenode.InlineEditor,
				NextThought.app.course.overview.components.editing.outline.contentnode.InlineEditor
			];
		},


		initRegistry: function () {
			this.setUpChildCreators();
			this.setUpEditors();
			this.setUpInlineEditors();
			this.setUpTypeSwitchers();
		},


		setUpChildCreators: function () {
			var creators = this.getCreators() || [];

			this.CREATORS = creators.reduce(function (acc, item) {
				var handled = item.getHandledMimeTypes ? item.getHandledMimeTypes() : [];

				handled.forEach(function (type) {
					if (acc[type]) {
						console.warn('Overriding type picker form mimetype: ', type);
					}

					acc[type] = item;
				});

				return acc;
			}, {});
		},


		setUpEditors: function () {
			var editors = this.getTypeEditors() || [];

			this.EDITORS = editors.reduce(function (acc, editor) {
				var handled = editor.getHandledMimeTypes ? editor.getHandledMimeTypes() : [];

				handled.forEach(function (type) {
					if (acc[type]) {
						console.warn('Overriding editor for mimetype: ', type);
					}
					acc[type] = editor;
				});

				return acc;
			}, {});
		},


		setUpInlineEditors: function () {
			var editors = this.getInlineEditors() || [];

			this.INLINE_EDITORS = editors.reduce(function (acc, item) {
				var type = item.getTypes ? item.getTypes() : null;

				if (type) {
					type.editor = item;

					acc[type.mimeType] = type;
				}

				return acc;
			}, {});
		},


		setUpTypeSwitchers: function () {
			const editors = this.getTypeEditors() || [];

			this.TYPE_SWITCHERS = editors.reduce((acc, item) => {
				const handled = item.getHandledMimeTypes ? item.getHandledMimeTypes() : [];
				const typeSwitcher = item.getTypeSwitcher && item.getTypeSwitcher();

				if (!typeSwitcher) { return acc; }

				for (let handle of handled) {
					if (acc[handle]) {
						console.warn('Overriding type switcher for mimetype: ', handle);
					}

					acc[handle] = typeSwitcher;
				}

				return acc;
			}, {});
		}
	},

	layout: 'none',
	items: [],

	initComponent: function () {
		this.callParent(arguments);

		if (this.record) {
			this.editRecord(this.record, this.parentRecord, this.rootRecord, this.bundle);
		} else if (this.parentRecord) {
			this.addRecord(this.parentRecord, this.rootRecord, this.bundle);
		}
	},

	getConfig: function (record, parentRecord, rootRecord, bundle, group, values) {
		return {
			record: record,
			parentRecord: parentRecord,
			rootRecord: rootRecord,
			bundle: bundle,
			switchRecordType: (g, v) => this.switchRecordType(g, v, record, parentRecord, rootRecord, bundle),
			group: group,
			copyValues: values,
			setSaveText: this.setSaveText.bind(this),
			enableSave: this.enableSave.bind(this),
			disableSave: this.disableSave.bind(this),
			setTitle: this.setHeaderTitle.bind(this),
			setSubTitle: this.setSubTitle.bind(this),
			enableBack: this.enableHeaderBack.bind(this),
			disableBack: this.disableHeaderBack.bind(this),
			showError: this.showError.bind(this),
			showWarning: this.showWarning.bind(this),
			showMessage: this.showMessage.bind(this),
			doClose: this.doClose.bind(this),
			doSave: this.doSave.bind(this)
		};
	},

	editRecord: function (record, parentRecord, rootRecord, bundle) {
		var editor = this.self.getEditor(record.mimeType),
			cmp = editor && editor.getEditorForRecord(record);

		if (!cmp) {
			console.error('No editor to edit record: ', record.mimeType);
			return;
		}

		this.activeEditor = this.add(cmp.create(this.getConfig(record, parentRecord, rootRecord, bundle)));
	},

	addRecord: function (parentRecord, rootRecord, bundle) {
		var editor = this.self.getChildCreator(parentRecord.mimeType),
			cmp = editor && editor.getChildCreatorForRecord(parentRecord);

		if (!cmp) {
			console.error('No editor to add child to: ', parentRecord.mimeType);
			return;
		}

		this.activeEditor = this.add(cmp.create(this.getConfig(null, parentRecord, rootRecord, bundle)));
	},

	switchRecordType: function (group, values, record, parentRecord, rootRecord, bundle) {
		var typeSwitcher = this.self.getTypeSwitcher(record.mimeType);

		if (!typeSwitcher) {
			console.error('No type switcher for: ', record.mimeType);
			return;
		}

		if (this.activeEditor) {
			this.activeEditor.destroy();
		}

		this.activeEditor = this.add(typeSwitcher.create(this.getConfig(record, parentRecord, rootRecord, bundle, group, values)));
	},

	setSaveText: function (text) {
		return this.Prompt.Footer.setSaveText(text);
	},

	enableSave: function () {
		return this.Prompt.Footer.enableSave();
	},

	disableSave: function () {
		return this.Prompt.Footer.disableSave();
	},

	setHeaderTitle: function (title) {
		return this.Prompt.Header.setTitle(title);
	},

	setSubTitle: function (subTitle) {
		return this.Prompt.Header.setSubTitle(subTitle);
	},

	enableHeaderBack: function (text) {
		return this.Prompt.Header.enableBack(text);
	},

	disableHeaderBack: function () {
		return this.Prompt.Header.disableBack();
	},

	showError: function (err) {
		return this.Prompt.Header.showError(err);
	},

	showWarning: function (warn) {
		return this.Prompt.Header.showWarning(warn);
	},

	showMessage: function (msg) {
		return this.Prompt.Header.showMessage(msg);
	},

	doClose: function (reason) {
		return this.Prompt.doClose(reason);
	},

	doSave: function () {
		return this.Prompt.doSave();
	},

	onBack: function () {
		if (this.activeEditor && this.activeEditor.onBack) {
			this.activeEditor.onBack();
		}
	},

	doValidation: function () {
		if (this.activeEditor && this.activeEditor.doValidation) {
			return this.activeEditor && this.activeEditor.doValidation();
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
		if (this.activeEditor && this.activeEditor.allowCancel) {
			return this.activeEditor.allowCancel();
		}

		return Promise.resolve();
	}
}, function () {
	this.initRegistry();
});
