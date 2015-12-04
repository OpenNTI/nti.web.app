Ext.define('NextThought.app.course.overview.components.editing.Window', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-window',

	requires: [
		'NextThought.app.course.overview.components.editing.OutlineEditor',
		'NextThought.app.course.overview.components.editing.ContentsEditor',
		'NextThought.app.course.overview.components.editing.WindowFooter',
		'NextThought.app.windows.StateStore',
		'NextThought.app.windows.components.Header',
		'NextThought.app.windows.components.Loading'
	],

	cls: 'editing-window',
	layout: 'none',
	items: [],

	newItemText: 'New Object',

	initComponent: function() {
		this.callParent(arguments);

		this.record = this.precache.record;
		this.parentRecord = this.precache.parent || (this.record && this.record.parent);

		this.headerCmp = this.add({
			xtype: 'window-header',
			doClose: this.doClose.bind(this)
		});

		this.setPath(this.record, this.parentRecord);

		if (this.record) {
			this.editRecord(this.record, this.parentRecord);
		} else if (this.parentRecord) {
			this.addRecord(this.parentRecord);
		}

		this.footer = this.add({
			xtype: 'overview-editing-windowfooter',
			onCancel: this.onCancel.bind(this),
			onNext: this.onNext.bind(this),
			onSave: this.onSave.bind(this),
			controlConfig: this.footerConfig
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


	getEditorConfig: function(record, parentRecord) {
		return {};
	},


	editRecord: function(record, parentRecord) {
		var Outline = NextThought.app.course.overview.components.editing.OutlineEditor,
			Contents = NextThought.app.course.overview.components.editing.ContentsEditor,
			config = {
				record: record,
				parentRecord: parentRecord,
				doClose: this.doClose.bind(this),
				updateButtons: this.updateButtons.bind(this)
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
		var Outline = NextThought.app.course.overview.components.editing.OutlineEditor,
			Contents = NextThought.app.course.overview.components.editing.ContentsEditor,
			config = {
				parentRecord: parentRecord,
				doClose: this.doClose.bind(this),
				updateButtons: this.updateButtons.bind(this)
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


	updateButtons: function(config) {
		config = config || {};

		config.cancel = true;

		this.footerConfig = config;

		if (this.footer) {
			this.footer.setControls(config);
		}
	},


	onCancel: function() {

	},


	onNext: function() {

	},


	onSave: function() {

	}
}, function() {
	NextThought.app.windows.StateStore.register('overview-editing', this);
});
