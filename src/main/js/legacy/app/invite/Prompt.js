var Ext = require('extjs');
var PromptStateStore = require('../prompt/StateStore');
const InviteForm = require('./Index');

module.exports = exports = Ext.define('NextThought.app.invite.Prompt', {
	extend: 'Ext.container.Container',
	alias: 'widget.invite-prompt',
	cls: 'invite-prompt',
	layout: 'none',
	items: [],

	initComponent () {
		this.callParent(arguments);

		this.record = this.Prompt.data.record;

		this.inviteForm = this.addInviteForm();
	},

	afterRender () {
		this.callParent(arguments);

		this.Prompt.Header.hide();
		this.Prompt.Footer.enableSave();
		this.Prompt.Footer.setSaveText('Send');
	},

	addInviteForm ()  {
		return this.add({
			xtype: 'invite-form',
			record: this.record,
			onSuccess: this.onSuccess.bind(this)
		});
	},

	onSave () {
		if (this.inviteForm && this.inviteForm.onSave) {
			return this.inviteForm.onSave();
		}

		return Promise.reject('Nothing to submit.');
	},

	onSuccess () {
		this.Prompt.close();
	},

	onSaveFailure () {
	}
}, function () {
	NextThought.app.prompt.StateStore.register('invite', this);
});
