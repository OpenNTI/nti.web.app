var Ext = require('extjs');
var AnchorablesTimeRangeDescription = require('./TimeRangeDescription');
var AnchorablesTranscriptContentPointer = require('./TranscriptContentPointer');


module.exports = exports = Ext.define('NextThought.model.anchorables.TranscriptRangeDescription', {
	extend: 'NextThought.model.anchorables.TimeRangeDescription',

	statics: {
		createFromObject: function (o) {
			var cp = NextThought.model.anchorables.TranscriptContentPointer;

			return NextThought.model.anchorables.TranscriptRangeDescription.create({
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
