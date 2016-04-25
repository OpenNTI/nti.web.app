const Ext = require('extjs');
const ParseUtils = require('legacy/util/Parsing');
require('legacy/app/prompt/StateStore');
require('legacy/app/prompt/Actions');
require('legacy/common/components/cards/CardTarget');
require('./Panel');


module.exports = exports = Ext.define('NextThought.app.contentviewer.components.attachment.Window', {
	extend: 'Ext.container.Container',
	alias: 'widget.attachment-preview-window',
	cls: 'content-editor',
	layout: 'none',
	title: 'Attachment Preview',

	statics: {
		showAttachmentInPreviewMode: function (contentFile, parentRecord) {
			var rec = ParseUtils.parseItems(contentFile)[0];

			if (!this.PromptActions) {
				this.PromptActions = NextThought.app.prompt.Actions.create();
			}

			this.PromptActions.prompt('attachment-preview-mode', {
				record: rec,
				parent: parentRecord
			});
		}
	},


	initComponent: function () {
		this.callParent(arguments);

		let data = this.Prompt.data;

		this.record = data && data.record;
		this.parentRecord = data && data.parentRecord;
		this.addPreview();
	},


	addPreview: function () {
		this.preview = this.add({
			xtype: 'attachment-preview-panel',
			record: this.record,
			parentRecord: this.parentRecord,
			setSaveText: this.setSaveText.bind(this)
		});
	},


	afterRender: function () {
		this.callParent(arguments);

		let title = this.record.get('filename');
		if (!title) {
			title = this.title;
		}

		this.setHeaderTitle(title);
	},


	setHeaderTitle: function (title) {
		return this.Prompt.Header.setTitle(title);
	},


	setSaveText: function (text) {
		return this.Prompt.Footer.setSaveText(text);
	}

}, function () {
	NextThought.app.prompt.StateStore.register('attachment-preview-mode', this);
});
