const Ext = require('extjs');
require('legacy/app/prompt/StateStore');
require('./Panel');


module.exports = exports = Ext.define('NextThought.app.contentviewer.components.attachment.Window', {
	extend: 'Ext.container.Container',
	alias: 'widget.attachment-preview-window',
	cls: 'content-editor',
	layout: 'none',
	title: 'Attachment Preview',

	statics: {
		canShowFile: function (fileType) {
			return this.isImage(fileType) || (/^(application\/pdf)|(text\/plain)|(text\/html)/).test(fileType);
		},

		isImage: function (type) {
			return (/[\/\.](gif|jpg|jpeg|tiff|png)$/i).test(type);
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
