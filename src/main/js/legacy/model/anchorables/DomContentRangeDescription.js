const Ext = require('extjs');

const ContentPointer = require('./ContentPointer');
const DomContentPointer = require('./DomContentPointer');
require('./ContentRangeDescription');


const DomContentRangeDescription =
module.exports = exports = Ext.define('NextThought.model.anchorables.DomContentRangeDescription', {
	extend: 'NextThought.model.anchorables.ContentRangeDescription',

	config: {
		start: {},
		end: {},
		ancestor: {}
	},

	isEmpty: false,
	isDomContentRangeDescription: true,

	statics: {
		createFromObject: function (o) {
			var cp = ContentPointer;
			return DomContentRangeDescription.create({
				start: cp.createFromObject(o.start),
				end: cp.createFromObject(o.end),
				ancestor: cp.createFromObject(o.ancestor)
			});
		}
	},

	constructor: function (o) {
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
		this.Class = 'DomContentRangeDescription';
	},

	isDomContentPointer: function (o) {
		return (o instanceof DomContentPointer);
	}
});
