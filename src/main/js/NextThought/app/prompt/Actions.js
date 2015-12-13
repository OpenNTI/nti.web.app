Ext.define('NextThought.app.prompt.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.app.prompt.StateStore'
	],


	constructor: function() {
		this.callParent(arguments);

		this.PromptStateStore = NextThought.app.prompt.StateStore.getInstance();
	},


	prompt: function(type, data) {
		return this.PromptStateStore.openPrompt(type, data);
	}
});
