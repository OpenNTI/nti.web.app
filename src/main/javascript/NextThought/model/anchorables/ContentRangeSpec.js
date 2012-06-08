Ext.define('NextThought.model.anchorables.ContentRangeSpec', {
	require: [
		'NextThought.model.anchorables.ContentAnchor'
	],

	config: {
		start: {},
		end: {},
		ancestor: {}
	},

	constructor: function(o){
		var start = o.start,
			end = o.end,
			ancestor = o.ancestor;

		//make sure contents are acceptable
		if (!start || !end || !ancestor ||
			!this.isContentAnchor(start) ||
			!this.isContentAnchor(end) ||
			!this.isContentAnchor(ancestor))
		{
			console.error('Invalid contents', arguments);
			Ext.Error.raise('invalid contents');
		}

		this.initConfig({
			start: start,
			end: end,
			ancestor: ancestor
		});
	},

	isContentAnchor: function(o) {
		return (o instanceof NextThought.model.anchorables.ContentAnchor);
	}
});