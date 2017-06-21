require('legacy/common/Actions');
const Ext = require('extjs');

const PromptStateStore = require('./StateStore');


module.exports = exports = Ext.define('NextThought.app.prompt.Actions', {
	extend: 'NextThought.common.Actions',

	statics: {
		DELETED: 'deleted'
	},

	constructor: function () {
		this.callParent(arguments);

		this.PromptStateStore = PromptStateStore.getInstance();
	},

	prompt: function (type, data) {
		return this.PromptStateStore.openPrompt(type, data);
	}
});
