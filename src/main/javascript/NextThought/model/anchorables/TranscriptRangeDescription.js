Ext.define('NextThought.model.anchorables.TranscriptRangeDescription', {
	extend: 'NextThought.model.anchorables.TimeRangeDescription',

	requires: [
		'NextThought.model.anchorables.TranscriptContentPointer'
	],

	statics: {
		createFromObject: function (o) {
			var cp = NextThought.model.anchorables.TranscriptContentPointer;

			return NextThought.model.anchorables.TranscriptRangeDescription.create({
																					   start:    cp.createFromObject(o.start),
																					   end:      cp.createFromObject(o.end),
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