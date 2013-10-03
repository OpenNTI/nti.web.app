Ext.define('NextThought.util.Errors', {
	singleton: true,
	/*
		Error Message template

		'error code': {
			msg: 'Error message {replace}',
			default: {
				"replace" : "template" //the name must match something in {} in the msg
			}
		}

		Example call
		error.getError('error code',{ "replace" : "call"},"default message");
		the default will be put in if the replace object doesn't have an item
		to file a {} with

		if there is no erroMsg with 'error code' the defaultMsg will be returned
		or falsy if the defaultMsg is undefined

		note: if you want to pass a default message you have pass something for replace
			ex. NTIError.getError("Nonexistent",{},"default message");
	*/
	//error messages
	errorMsgs: {
		'FieldContainsCensoredSequence' : {
			msg: '{name} contains censored {type}.',
			defaults: {
				'name' : 'Item',
				'type' : 'material'
			}
		}
	},


	//either returns this.errorMsgs[errCode].msg (with replacements), defaultMsg, or undefined
	getError: function(errCode,replace,defaultMsg) {
		var error = this.errorMsgs[errCode],
			msg;

		if (!error || !error.msg) {
			return defaultMsg;
		}

		if (error.defaults) {
			replace = Ext.applyIf(replace || {}, error.defaults);
		}

		msg = error.msg;

		Ext.Object.each(replace, function(key,value,self) {
			msg = msg.replace('{' + key + '}', value);
		});

		return msg;
	},


	//adds messages to the errorMsgs for testing purposes
	addMsg: function(msgs) {
		Ext.applyIf(this.errorMsgs, msgs);
	}

},function() {
	window.NTIError = this;
});
