Ext.define('NextThought.app.course.overview.components.editing.window.Window', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-window',


	requires: [
		'NextThought.app.windows.StateStore',
		'NextThought.app.windows.components.Header',
		'NextThought.app.course.overview.components.editing.outline.Editor',
		'NextThought.app.course.overview.components.editing.content.Editor'
	],

	cls: 'editing-window',

	layout: 'none',
	items: [],

	initComponent: function() {
		this.callParent(arguments);

		this.record = this.precache.record;
		this.parentRecord = this.precache.parent || (this.record && this.record.parent);

		this.headerCmp = this.add({
			xtype: 'window-header',
			doClose: this.onCancel.bind(this)
		});

		this.setPath(this.record, this.parentRecord);

		if (this.record) {
			this.editRecord(this.record, this.parentRecord);
		} else if (this.parentRecord) {
			this.addRecord(this.parentRecord);
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


	editRecord: function(record, parentRecord) {
		var Outline = NextThought.app.course.overview.components.editing.outline.Editor,
			Contents = NextThought.app.course.overview.components.editing.content.Editor,
			config = {
				record: record,
				parentRecord: parentRecord,
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


	addRecord: function(parentRecord) {
		var Outline = NextThought.app.course.overview.components.editing.outline.Editor,
			Contents = NextThought.app.course.overview.components.editing.content.Editor,
			config = {
				parentRecord: parentRecord,
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

	},


	onCancel: function() {
		//TODO: check if its already to close without
		this.doClose();
	},


	disableSave: function() {

	},


	enableSave: function() {

	}
}, function() {
	NextThought.app.windows.StateStore.register('overview-editing', this);
});
