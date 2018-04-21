const Ext = require('@nti/extjs');

const PromptStore = require('legacy/app/prompt/StateStore');

const view = require('./Index');

const prompt = module.exports = exports = Ext.define('NextThought.app.account.info.Prompt', {
	extend: 'Ext.container.Container',

	layout: 'none',
	items: [],

	initComponent () {
		this.callParent(arguments);

		this.Prompt.Header.hide();
		this.Prompt.Footer.hide();

		this.add(view.create({
			onClose: () => { this.Prompt.doClose(); }
		}));
	}
});

PromptStore.register('verify-email-info', prompt);
