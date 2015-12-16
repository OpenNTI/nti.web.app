Ext.define('NextThought.common.form.ErrorMessages', {

	MESSAGES: {
		missing: 'Please fill out all required fields.',
		invalidUrl: 'Please enter a valid url.',
		noError: 'Valid'
	},

	PRIORITY: ['missing', 'invalidUrl'],

	getMessageForErrors: function(errors) {
		var priority = this.PRIORITY, i;

		for (i = 0; i < priority.length; i++) {
			if (errors[priority[i]]) {
				return this.MESSAGES[priority[i]];
			}
		}

		return this.MESSAGES.noError;
	}
});
