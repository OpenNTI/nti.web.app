var Ext = require('extjs');
var PromptStateStore = require('../prompt/StateStore');


module.exports = exports = Ext.define('NextThought.app.invite.Prompt', {
	extend: 'Ext.container.Container',
	alias: 'widget.invite-prompt',
	cls: 'invite-prompt',
	layout: 'none',
	items: [],

	initComponent: function () {
		this.callParent(arguments);

		this.addInviteForm();
	},

	afterRender: function () {
		this.callParent(arguments);

		this.Prompt.Footer.setSaveText('Send');
	},

	addInviteForm: function () {
	}
}, function () {
	NextThought.app.prompt.StateStore.register('invite', this);
});
