Ext.define('NextThought.app.course.overview.components.editing.Prompt', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-prompt',

	requires: [
		'NextThought.app.prompt.StateStore',
		'NextThought.app.course.overview.components.editing.content.Prompt',
		'NextThought.app.course.overview.components.editing.outline.Prompt'
	],

	cls: 'overview-editing-prompt',

	layout: 'none',
	items: [],

	initComponent: function() {
		this.callParent(arguments);

		var record = this.Prompt.data.record,
			parentRecord = this.Prompt.data.parent || (this.record && this.record.parent),
			rootRecord = this.Prompt.data.root;


		if (this.Prompt.type === 'overview-editing') {
			this.editRecord(record, parentRecord, rootRecord);
		} else if (this.Prompt.type === 'overview-creation') {
			this.addRecord(parentRecord, rootRecord);
		}
	},


	showError: function() {
		//TODO: fill this out
	},


	editRecord: function(record, parentRecord, rootRecord) {
		var Outline = NextThought.app.course.overview.components.editing.outline.Prompt,
			Contents = NextThought.app.course.overview.components.editing.content.Prompt,
			config = {
				record: record,
				parentRecord: parentRecord,
				rootRecord: rootRecord,
				Prompt: this.Prompt
			};

		if (!record) {
			this.showError();
		} else if (Contents.canEdit(record.mimeType)) {
			this.editor = this.add(Contents.create(config));
		} else if (Outline.canEdit(record.mimeType)) {
			this.editor = this.add(Outline.create(config));
		} else {
			this.showError();
		}
	},


	addRecord: function(parentRecord, rootRecord) {
		var Outline = NextThought.app.course.overview.components.editing.outline.Prompt,
			Contents = NextThought.app.course.overview.components.editing.content.Prompt,
			config = {
				parentRecord: parentRecord,
				rootRecord: rootRecord,
				Prompt: this.Prompt
			};

		if (!parentRecord) {
			this.showError();
		} else if (Contents.canAddChildren(parentRecord.mimeType)) {
			this.editor = this.add(Contents.create(config));
		} else if (Outline.canAddChildren(parentRecord.mimeType)) {
			this.editor = this.add(Outline.create(config));
		} else {
			this.showError();
		}
	},


	onBack: function() {
		if (this.editor && this.editor.onBack) {
			this.editor.onBack();
		}
	},


	onSave: function() {
		if (this.editor && this.editor.onSave) {
			this.editor.onSave();
		}
	},


	allowCancel: function() {
		if (this.editor && this.editor.allowCancel) {
			return this.editor.allowCancel();
		}

		return Promise.resolve();
	}
}, function() {
	NextThought.app.prompt.StateStore.register('overview-editing', this);
	NextThought.app.prompt.StateStore.register('overview-creation', this);
});
