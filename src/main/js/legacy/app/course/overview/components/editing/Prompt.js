var Ext = require('extjs');
var PromptStateStore = require('../../../../prompt/StateStore');
var ContentPrompt = require('./content/Prompt');
var OutlinePrompt = require('./outline/Prompt');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.Prompt', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-prompt',
	cls: 'overview-editing-prompt',
	layout: 'none',
	items: [],

	initComponent: function() {
		this.callParent(arguments);

		var record = this.Prompt.data.record,
			parentRecord = this.Prompt.data.parent || (this.record && this.record.parent),
			rootRecord = this.Prompt.data.root,
			bundle = this.Prompt.data.bundle;


		if (this.Prompt.type === 'overview-editing') {
			this.editRecord(record, parentRecord, rootRecord, bundle);
		} else if (this.Prompt.type === 'overview-creation') {
			this.addRecord(parentRecord, rootRecord, bundle);
		}
	},

	showUnkownTypeError: function() {
		//TODO: fill this out
	},

	editRecord: function(record, parentRecord, rootRecord, bundle) {
		var Outline = NextThought.app.course.overview.components.editing.outline.Prompt,
			Contents = NextThought.app.course.overview.components.editing.content.Prompt,
			config = {
				record: record,
				parentRecord: parentRecord,
				rootRecord: rootRecord,
				bundle: bundle,
				Prompt: this.Prompt
			};

		if (!record) {
			this.showUnkownTypeError();
		} else if (Contents.canEdit(record)) {
			this.editor = this.add(Contents.create(config));
		} else if (Outline.canEdit(record)) {
			this.editor = this.add(Outline.create(config));
		} else {
			this.showUnkownTypeError();
		}
	},

	addRecord: function(parentRecord, rootRecord, bundle) {
		var Outline = NextThought.app.course.overview.components.editing.outline.Prompt,
			Contents = NextThought.app.course.overview.components.editing.content.Prompt,
			config = {
				parentRecord: parentRecord,
				rootRecord: rootRecord,
				bundle: bundle,
				Prompt: this.Prompt
			};

		if (!parentRecord) {
			this.showUnkownTypeError();
		} else if (Contents.canAddChildren(parentRecord.mimeType)) {
			this.editor = this.add(Contents.create(config));
		} else if (Outline.canAddChildren(parentRecord.mimeType)) {
			this.editor = this.add(Outline.create(config));
		} else {
			this.showUnkownTypeError();
		}
	},

	onBack: function() {
		if (this.editor && this.editor.onBack) {
			this.editor.onBack();
		}
	},

	doValidation: function() {
		if (this.editor && this.editor.doValidation) {
			return this.editor.doValidation();
		}

		return Promise.resolve();
	},

	onSaveFailure: function(reason) {
		if (this.editor && this.editor.onSaveFailure) {
			return this.editor.onSaveFailure(reason);
		}

		return Promise.reject('Nothing to handle failure');
	},

	onSave: function() {
		if (this.editor && this.editor.onSave) {
			return this.editor.onSave();
		}

		return Promise.reject('Nothing to submit.');
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
