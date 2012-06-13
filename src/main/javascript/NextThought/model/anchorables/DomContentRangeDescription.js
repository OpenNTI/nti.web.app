Ext.define('NextThought.model.anchorables.DomContentRangeDescription', {
	requires: [
		'NextThought.model.anchorables.DomContentPointer'
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
			!this.isDomContentPointer(start) ||
			!this.isDomContentPointer(end) ||
			!this.isDomContentPointer(ancestor))
		{
			console.error('Invalid contents', arguments);
			Ext.Error.raise('Invalid contents');
		}

		this.callParent(arguments);

		this.setStart(start);
		this.setEnd(end);
		this.setAncestor(ancestor);

		return this;
	},

	isDomContentPointer: function(o) {
		return (o instanceof NextThought.model.anchorables.DomContentPointer);
	}
});