const Ext = require('extjs');
const PromptStore = require('legacy/app/prompt/StateStore');

const view = require('./Index');

let prompt = module.exports = exports = Ext.define('NextThought.app.account.verify.Prompt', {
	extend: 'Ext.container.Container',

	layout: 'none',
	items: [],

	initComponent () {
		this.callParent(arguments);

		this.Prompt.Header.hide();
		this.Prompt.Footer.hide();

		this.Prompt.addCls('clear');

		this.view = this.add(view.create({
			onClose: () => { this.Prompt.doClose(); },
			onVerificationComplete: this.Prompt.data.onVerificationComplete,
			user: $AppConfig.userObject
		}));

		if (this.Prompt.data && this.Prompt.data.seconds) {
			this.view.presentPendingVerification(this.Prompt.data.seconds);
		}
	}
});

PromptStore.register('verify-email', prompt);
