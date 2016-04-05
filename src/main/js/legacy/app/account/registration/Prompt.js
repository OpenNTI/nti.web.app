const Ext = require('extjs');
const PromptStateStore = require('legacy/app/prompt/StateStore');

const SURVEY_COMPLETE = 'survey-complete';

let prompt = module.exports = exports = Ext.define('NextThought.app.account.registration.Prompt', {
	extend: 'Ext.container.Container',
	alias: 'widget.registration-prompt',

	title: 'Submit Registration',

	cls: 'registration-prompt',
	layout: 'none',
	items: [],

	initComponent () {
		this.callParent(arguments);

		this.Prompt.Header.disableClose();
		this.Prompt.Header.setTitle(this.title);

		this.Prompt.Footer.hide();
		// this.Prompt.allowFullScreen();

		this.iframeCmp = this.add({
			xtype: 'box',
			autoEl: {
				tag: 'iframe',
				src: '/mobile/onboarding/i2-survey'
			}
		});

		let onPostMessage = this.onPostMessage.bind(this);

		window.addEventListener('message', onPostMessage);

		this.on('destroy', () => {
			window.removeEventListener('message', onPostMessage);
		});
	},


	onPostMessage (event) {
		if (event.origin !== window.location.origin) { return; }

		if (event.data === SURVEY_COMPLETE) {
			this.Prompt.doSave();
		}
	},


	onSave () {
		return Promise.resolve();
	}
});

PromptStateStore.register('account-registration', prompt);
