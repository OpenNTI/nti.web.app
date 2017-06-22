const Ext = require('extjs');

const Globals = require('legacy/util/Globals');
const PromptStateStore = require('legacy/app/prompt/StateStore');

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
			return (/[/.](gif|jpg|jpeg|tiff|png)$/i).test(type);
		}
	},

	initComponent: function () {
		this.callParent(arguments);

		let data = this.Prompt.data;

		this.record = data && data.record;
		this.parentRecord = data && data.parentRecord;

		if (this.hasBrowserSupport()) {
			this.addPreview();
		} else {
			this.addUnsupportedForHref();
		}

	},


	addPreview: function () {
		this.preview = this.add({
			xtype: 'attachment-preview-panel',
			record: this.record,
			parentRecord: this.parentRecord,
			setSaveText: this.setSaveText.bind(this)
		});
	},


	hasBrowserSupport: function () {
		var nativeSupport = Globals.hasPDFSupport(),
			version;
		if (Ext.isGecko) {
			version = /Firefox\/(\d+\.\d+)/.exec(navigator.userAgent)[1];
			version = parseInt(version, 10);
		}

		if ((version && version <= 18) || (!nativeSupport && !Ext.isGecko)) {
			return false;
		}

		return true;
	},


	addUnsupportedForHref: function () {
		var href = this.record && this.record.get('url'),
			anchorAttr = 'class=\'link\' target=\'_blank\'',
			chrome = '<a ' + anchorAttr + ' href=\'http://www.google.com/chrome\'>Chrome,</a>',
			safari = '<a ' + anchorAttr + ' href=\'http://www.apple.com/safari/download/\'>Safari,</a>',
			ff = '<a ' + anchorAttr + ' href=\'http://www.getfirefox.com\'>Firefox,</a>',
			ie = '<a ' + anchorAttr + ' href=\'http://www.microsoft.com/ie\'>Internet Explorer.</a>';


		this.add({
			xtype: 'box',
			cls: 'content-card-target-container',
			width: 720,
			height: 680,
			renderTpl: Ext.DomHelper.markup({
				cls: 'no-support', cn: [
					{cls: 'message', html: 'Your browser does not currently support viewing PDF files.'},
					{cls: '', cn: [
						{tag: 'a', cls: 'link', href: 'https://get.adobe.com/reader/', target: '_blank', html: 'Install Adobe Acrobat Reader '},
						'or try the latest version of one of the following browsers:<br>',
						chrome,
						' ',
						safari,
						' ',
						ff,
						' ',
						ie
					]},
					'<br>',
					{cls: '', cn: [
						{tag: 'a', cls: 'link', href: href, html: 'Download the PDF'}
					]}
				]
			})
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
	PromptStateStore.register('attachment-preview-mode', this);
});
