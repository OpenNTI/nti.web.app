const Ext = require('@nti/extjs');

require('./Header');
require('./Footer');

module.exports = exports = Ext.define(
	'NextThought.app.prompt.components.Container',
	{
		extend: 'Ext.container.Container',
		alias: 'widget.prompt-container',
		cls: 'prompt-container',
		layout: 'none',
		items: [],

		initComponent: function () {
			this.callParent(arguments);

			this.prompt = this.add({
				xtype: 'container',
				layout: 'none',
				cls: 'prompt' + (this.promptType ? ' ' + this.promptType : ''),
				items: [],
			});

			this.header = this.prompt.add({
				xtype: 'prompt-header',
				doCancel: this.doCancel.bind(this),
				doBack: this.doBack.bind(this),
			});

			this.bodyContainer = this.prompt.add({
				xtype: 'container',
				cls: 'body-container',
				layout: 'none',
				items: [],
			});

			this.footer = this.prompt.add({
				xtype: 'prompt-footer',
				doSave: this.doSave.bind(this),
				doCancel: this.doCancel.bind(this),
			});

			this.bodyCmp = this.cmp.create(this.getBodyConfig());

			this.bodyContainer.add(this.bodyCmp);

			this.isSetUp = true;
			this.fireEvent('setup-complete');
		},

		onCovered: function () {
			this.addCls('covered');

			if (this.bodyCmp && this.bodyCmp.onCovered) {
				this.bodyCmp.onCovered();
			}
		},

		onUncovered: function () {
			this.removeCls('covered');

			if (this.bodyCmp && this.bodyCmp.onUncovered) {
				this.bodyCmp.onUncovered();
			}
		},

		getBodyConfig: function () {
			return {
				Prompt: {
					data: this.data,
					type: this.promptType,
					doClose: this.doCancel.bind(this),
					doSave: this.doSave.bind(this),
					doImmediateSave: this.doImmediateSave.bind(this),
					allowFullScreen: this.allowFullScreen.bind(this),
					addCls: this.addCls.bind(this),
					removeCls: this.removeCls.bind(this),
					lockBodyHeight: () => this.lockBodyHeight(),
					unlockBodyHeight: () => this.unlockBodyHeight(),
					Header: {
						hide: this.header.hide.bind(this.header),
						show: this.header.show.bind(this.header),
						disableClose: this.header.disableClose.bind(
							this.header
						),
						enableClose: this.header.enableClose.bind(this.header),
						enableBack: this.header.enableBack.bind(this.header),
						disableBack: this.header.disableBack.bind(this.header),
						setTitle: this.header.setTitle.bind(this.header),
						setSubTitle: this.header.setSubTitle.bind(this.header),
						showError: this.header.showError.bind(this.header),
						showWarning: this.header.showWarning.bind(this.header),
						showMessage: this.header.showMessage.bind(this.header),
					},
					Footer: {
						hide: this.footer.hide.bind(this.footer),
						show: this.footer.show.bind(this.footer),
						enableSave: this.footer.enableSave.bind(this.footer),
						disableSave: this.footer.disableSave.bind(this.footer),
						setSaveText: this.footer.setSaveText.bind(this.footer),
						setCancelText: this.footer.setCancelText.bind(
							this.footer
						),
					},
				},
			};
		},

		lockBodyHeight() {
			const body = this.bodyContainer;
			const height = body && body.getHeight();

			if (body && body.el && body.el.dom) {
				body.el.dom.style.minHeight = `${height}px`;
			}
		},

		unlockBodyHeight() {
			const body = this.bodyContainer;

			if (body && body.el && body.el.dom) {
				body.el.dom.style.minHeight = null;
			}
		},

		allowFullScreen: function () {
			this.bodyContainer.addCls('full-screen');
		},

		doBack: function () {
			if (this.bodyCmp.onBack) {
				this.bodyCmp.onBack();
			}
		},

		onSaveSuccess: function (value) {
			if (this.onSubmit) {
				this.onSubmit(value);
			}
		},

		onSaveFailure: function (reason) {
			this.bodyCmp.onSaveFailure(reason);
		},

		__validate: function () {
			if (this.bodyCmp.doValidation) {
				return this.bodyCmp.doValidation();
			}

			return Promise.resolve();
		},

		__save: function () {
			if (this.bodyCmp.onSave) {
				this.bodyCmp
					.onSave()
					.then(this.onSaveSuccess.bind(this))
					.catch(this.onSaveFailure.bind(this));
			}
		},

		doImmediateSave(value) {
			this.onSaveSuccess(value);
		},

		doSave: async function () {
			try {
				await this.__validate();
				return this.__save();
			} catch {
				// validation errors (handled before this point, but we still have a dangling rejected promise)
			}
		},

		allowCancel: function () {
			if (this.bodyCmp.allowCancel) {
				return this.bodyCmp.allowCancel();
			}

			return Promise.resolve();
		},

		doCancel: function (action) {
			this.onCancel(action);
		},
	}
);
