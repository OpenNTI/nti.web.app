Ext.define('NextThought.model.anchorables.TextContext', {
	config: {
		contextText: '',
		contextOffset: 1
	},
	constructor: function(o){
		this.validateOffset(o.contextOffset);
		this.validateText(o.contextText);
		this.initConfig(o);
	},

	validateOffset: function(offset) {
		if (offset === null || offset === undefined) {
			Ext.Error.raise('No offset supplied');
		}
		else if (offset < 0) {
			Ext.Error.raise('Offset must be greater than 0, supplied value: ' + offset);
		}
	},


	validateText: function(text) {
		if (!text || text.length < 0) {
			Ext.Error.raise('Text must have one or more characters');
		}
	}
});