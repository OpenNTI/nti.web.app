var Ext = require('extjs');
var CommonActions = require('../../common/Actions');
var PromptStateStore = require('./StateStore');


module.exports = exports = Ext.define('NextThought.app.prompt.Actions', {
	extend: 'NextThought.common.Actions',

	statics: {
		DELETED: 'deleted'
	},

	constructor: function () {
		this.callParent(arguments);

		this.PromptStateStore = NextThought.app.prompt.StateStore.getInstance();
	},

	prompt: function (type, data) {
		return this.PromptStateStore.openPrompt(type, data);
	}
});
