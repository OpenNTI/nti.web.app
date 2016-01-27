Ext.define('NextThought.app.course.overview.components.editing.window.Window', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-window',


	requires: [
		'NextThought.app.windows.StateStore',
		'NextThought.app.windows.components.Header'
	],

	cls: 'editing-window',

	layout: 'none',
	items: [],

	initComponent: function() {
		this.callParent(arguments);

		this.record = this.precache.record;
		this.parentRecord = this.precache.parent || (this.record && this.record.parent);
		this.rootRecord = this.precache.root;

		this.headerCmp = this.add({
			xtype: 'window-header',
			doClose: this.onCancel.bind(this)
		});

		this.setPath(this.record, this.parentRecord);

		if (this.record) {
			this.editRecord(this.record, this.parentRecord, this.rootRecord);
		} else if (this.parentRecord) {
			this.addRecord(this.parentRecord, this.rootRecord);
		}

		this.footer = this.add({
			xtype: 'overview-editing-window-footer',
			onSave: this.onSave.bind(this),
			onCancel: this.onCancel.bind(this)
		});
	},


	setPath: function(record, parentRecord) {
		var titles = [], leaf,
			parent = parentRecord;

		while (parent) {
			if (parent.getTitle) {
				titles.push({label: parent.getTitle(), noLink: true});
			}

			parent = parent.parent;
		}

		if (record) {
			leaf = record.getTitle();
		} else {
			leaf = this.newItemText;
		}

		this.headerCmp.showPath(titles, leaf);
	},


	editRecord: function(record, parentRecord, rootRecord) {
		var Outline = NextThought.app.course.overview.components.editing.outline.Editor,
			Contents = NextThought.app.course.overview.components.editing.content.Editor,
			config = {
				record: record,
				parentRecord: parentRecord,
				rootRecord: rootRecord,
				doClose: this.doClose.bind(this),
				disableSave: this.disableSave.bind(this),
				enableSave: this.enableSave.bind(this),
				scrollingParent: this.scrollingParent
			};

		if (Contents.canEdit(record.mimeType)) {
			this.editor = this.add(Contents.create(config));
		} else if (Outline.canEdit(record.mimeType)) {
			this.editor = this.add(Outline.create(config));
		} else {
			this.doClose();
			alert('Error Editing Record');
		}
	},


	addRecord: function(parentRecord, rootRecord) {
		var Outline = NextThought.app.course.overview.components.editing.outline.Editor,
			Contents = NextThought.app.course.overview.components.editing.content.Editor,
			config = {
				parentRecord: parentRecord,
				rootRecord: rootRecord,
				doClose: this.doClose.bind(this),
				disableSave: this.disableSave.bind(this),
				enableSave: this.enableSave.bind(this),
				scrollingParent: this.scrollingParent
			};

		if (Contents.canAddChildren(parentRecord.mimeType)) {
			this.editor = this.add(Contents.create(config));
		} else if (Outline.canAddChildren(parentRecord.mimeType)) {
			this.editor = this.add(Outline.create(config));
		} else {
			this.doClose();
			alert('Error Creating Record');
		}
	},


	onSave: function() {
		if (this.editor) {
			this.editor.doSave()
				.then(this.doClose.bind(this));
		}
	},


	onCancel: function() {
		//TODO: check if its already to close without
		this.doClose();
	},


	disableSave: function() {
		this.footer.disableSave();
	},


	enableSave: function() {
		this.footer.enableSave();
	}
}, function() {
	NextThought.app.windows.StateStore.register('overview-editing', this);
});
