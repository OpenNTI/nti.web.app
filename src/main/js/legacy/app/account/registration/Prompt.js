const Url = require('url');

const Ext = require('@nti/extjs');

const PromptStateStore = require('legacy/app/prompt/StateStore');

const SURVEY_COMPLETE = 'survey-complete';

function getData ({data}) {
	try {
		return JSON.parse(data);
	} catch (e) {
		//don't care
	}
	return {};
}


let prompt = module.exports = exports = Ext.define('NextThought.app.account.registration.Prompt', {
	extend: 'Ext.container.Container',
	alias: 'widget.registration-prompt',

	title: 'Submit Registration',

	cls: 'registration-prompt',
	layout: 'none',
	items: [],

	initComponent () {
		this.callParent(arguments);

		let src = this.Prompt.data.link;
		this.postMessageSourceId = Url.resolve(window.location.href, src);


		this.Prompt.Header.disableClose();
		this.Prompt.Header.setTitle(this.title);

		this.Prompt.Footer.hide();
		// this.Prompt.allowFullScreen();

		this.iframeCmp = this.add({
			xtype: 'box',
			autoEl: {
				tag: 'iframe',
				src: src
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

		const data = getData(event);

		if (data.id === this.postMessageSourceId && data.method === SURVEY_COMPLETE) {
			this.Prompt.doSave();
		}
	},


	onSave () {
		return Promise.resolve();
	}
});

PromptStateStore.register('account-registration', prompt);
