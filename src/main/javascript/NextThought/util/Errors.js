Ext.define('NextThought.util.Errors', { 
	singleton: true,
	//Error code/message object
	/*
		Error Message template
		
		'error code': {
			msg: 'Error message {replace}',
			default: {
				"replace" : "template" //the name must match something in {} in the msg
			}
		}

		Example call
		error.getError('error code',{ "replace" : "call"});
		the default will be put in if the replace object doesn't have an item
		to file a {} with
	*/
	errorMsgs: {
		'Default' : {
			msg : "An unknown error occured.",
		},
		'FieldContainsCensoredSequence' : {
			msg : "{name} contains censored {type}",
			defaults: {
				'name' : 'Item',
				'type' : 'material'
			}
		}
	},

	getError: function(errCode,replace){
		var error = this.errorMsgs[errCode] || this.errorMsgs['Default'],
			msg = error.msg,
			defaults = error.defaults || {},
			replace = Ext.applyIf(replace || {},defaults);
		
		Ext.Object.each(replace,function(key,value,self){
			msg = msg.replace("{"+key+"}",value);
		})

		return msg;
	},
	//adds messages to the errorMsgs for testing purposes
	addMsg: function(msgs){
		Ext.applyIf(this.errorMsgs,msgs);
	}
},
function(){
	window.NTIError = this;
});
