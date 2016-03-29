var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.prompt.components.Header', {
	extend: 'Ext.Component',
	alias: 'widget.prompt-header',

	cls: 'prompt-header',

	msgTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'msg {cls}', 'data-id': '{key}', html: '{msg}'
	})),

	renderTpl: Ext.DomHelper.markup([
		{cls: 'back'},
		{cls: 'title', cn: [
			{cls: 'main'},
			{cls: 'sub'}
		]},
		{cls: 'close', cn: [
			{cls: 'icon'}
		]},
		{cls: 'msg-container'}
	]),


	renderSelectors: {
		backEl: '.back',
		mainTitleEl: '.title .main',
		subTitleEl: '.title .sub',
		closeEl: '.close .icon',
		msgEl: '.msg-container'
	},


	afterRender: function () {
		this.callParent(arguments);

		this.messages = {
			length: 0
		};

		if (this.backLabel) {
			this.enableBack(this.backLabel);
		} else {
			this.disableBack();
		}

		if (this.title) {
			this.setTitle(this.title);
		}

		if (this.subTitle) {
			this.setSubTitle(this.subTitle);
		}

		if (this.error) {
			this.showError(error);
		}

		if (this.warning) {
			this.showWarning(this.warning);
		}

		if (this.message) {
			this.showMessage(this.message);
		}

		this.mon(this.el, 'click', this.handleClick.bind(this));
	},


	enableBack: function (title) {
		if (!this.rendered) {
			this.backLabel = title;
			return;
		}

		this.backEl.update(title || '');
		this.removeCls('back-disabled');
	},


	disableBack: function () {
		if (!this.rendered) {
			delete this.backLabel;
			return;
		}

		this.backEl.update('');
		this.addCls('back-disabled');
	},


	setTitle: function (title) {
		if (!this.rendered) {
			this.title = title;
			return;
		}

		this.mainTitleEl.update(title || '');
	},


	setSubTitle: function (subTitle) {
		if (!this.rendered) {
			this.subTitle = subTitle;
			return;
		}

		this.subTitleEl.update(subTitle || '');
	},


	handleClick: function (e) {
		if (e.getTarget('.disabled')) { return; }

		if (e.getTarget('.back')) {
			this.onBack();
		} else if (e.getTarget('.close') && e.getTarget('.icon')) {
			this.onClose();
		}
	},


	onBack: function () {
		if (this.doBack) {
			this.doBack();
		}
	},


	onClose: function () {
		if (this.doCancel) {
			this.doCancel();
		}
	},


	__getMessageForKey: function (key) {
		var msg = this.msgEl && this.msgEl.dom && this.msgEl.dom.querySelector('.msg[data-id="' + key + '"]');

		return msg;
	},


	__removeMessage: function (key) {
		var msg = this.__getMessageForKey(key);

		if (msg) {
			msg.remove();
		}
	},


	__addMessage: function (msg, cls) {
		var key = this.messages.length + 1,
			config = {
				msg: msg,
				cls: cls,
				key: this.messages.length + 1
			};

		this.msgTpl.append(this.msgEl, config);

		config.remove = this.__removeMessage.bind(this, key);

		return config;
	},


	showError: function (error) {
		return this.__addMessage(error, 'error');
	},


	showWarning: function (warning) {
		return this.__addMessage(warning, 'warning');
	},


	showMessage: function (message) {
		return this.__addMessage(message, 'message');
	}
});
