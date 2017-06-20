const Ext = require('extjs');

const PromptStateStore = require('legacy/app/prompt/StateStore');

require('./Editor');


module.exports = exports = Ext.define('NextThought.app.badge.components.Prompt', {
	extend: 'Ext.container.Container',
	alias: 'widget.badge-exporting-prompt',
	layout: 'none',
	cls: 'badge-prompt',
	items: [],

	initComponent: function () {
		this.callParent(arguments);

		var data = this.Prompt.data;

		this.activeEditor = this.add({
			xtype: 'badge-export-editor',
			user: data.user,
			badge: data.badge,
			title: data.title,
			saveText: data.saveText,
			subTitle: data.subTitle,
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
		});
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
	PromptStateStore.register('badge-exporting', this);
});
