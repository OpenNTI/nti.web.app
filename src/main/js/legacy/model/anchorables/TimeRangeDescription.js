const Ext = require('extjs');

const TimeContentPointer = require('./TimeContentPointer');

require('./ContentRangeDescription');

const TimeRangeDescription =
module.exports = exports = Ext.define('NextThought.model.anchorables.TimeRangeDescription', {
	extend: 'NextThought.model.anchorables.ContentRangeDescription',


	config: {
		seriesId: '',
		start: {},
		end: null  //Optional
	},

	isTimeRange: true,

	isEmpty: false,

	statics: {
		createFromObject: function (o) {
			var cp = TimeContentPointer;
			return TimeRangeDescription.create({
				seriesId: o.seriesId,
				start: cp.createFromObject(o.start),
				end: cp.createFromObject(o.end)
			});
		}
	},


	constructor: function (o) {
		if (!this.isTimeContentPointer(o.start)) {
			console.error('Missing or invalid time start', arguments);
			Ext.Error.raise('Invalid contents');
		}

		this.callParent(arguments);
		this.Class = 'TimeRangeDescription';
	},


	isTimeContentPointer: function (o) {
		return Boolean(o instanceof TimeContentPointer);
	}
});
