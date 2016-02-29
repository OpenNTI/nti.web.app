Ext.define('NextThought.common.form.Utils', {
	constructor: function(config) {

		this.handlers = {
			limitToNumeric: this.__limitEventToNumeric.bind(this)
		};
	},

	limitInputToNumeric: function(input) {
		if (!input.addEventListener) {
			console.error('Invalid input');

			return;
		}

		input.addEventListener('keypress', this.handlers.limitToNumeric);
	},


	unlimitInputToNumeric: function(input) {

	},


	__limitEventToNumeric: function(e) {
		var charCode = e.key || e.charCode;

		//if its not a control char and not a number
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			e.preventDefault();
		}
	}
});
