Ext.define('NextThought.model.anchorables.ContentSimpleTextRangeSpec', {
	extend: 'NextThought.model.anchorables.ContentRangeSpec',

	config: {
		selectedText: '',
		offset: 0
	},

	constructor: function(o){
		this.initConfig(o);
	}
});