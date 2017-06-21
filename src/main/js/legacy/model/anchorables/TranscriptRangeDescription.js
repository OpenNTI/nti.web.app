const Ext = require('extjs');

const TranscriptContentPointer = require('./TranscriptContentPointer');

require('./TimeRangeDescription');

const TranscriptRangeDescription =
module.exports = exports = Ext.define('NextThought.model.anchorables.TranscriptRangeDescription', {
	extend: 'NextThought.model.anchorables.TimeRangeDescription',

	statics: {
		createFromObject: function (o) {
			var cp = TranscriptContentPointer;

			return TranscriptRangeDescription.create({
				start: cp.createFromObject(o.start),
				end: cp.createFromObject(o.end),
				seriesId: o.seriesId
			});
		}
	},

	constructor: function (o) {
		this.callParent(arguments);
		this.initConfig(o);
		this.Class = 'TranscriptRangeDescription';
	}
});
