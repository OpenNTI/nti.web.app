Ext.define('NextThought.model.anchorables.TranscriptRangeDescription', {
	extend: 'NextThought.model.anchorables.TimeRangeDescription',

	requires:[
		'NextThought.model.anchorables.TranscriptContentPointer'
	],

	statics: {
		createFromObject: function(o){
			var cp = NextThought.model.anchorables.TranscriptContentPointer;

			return NextThought.model.anchorables.TranscriptRangeDescription.create({
				start: cp.createFromObject(o.start),
				end: cp.createFromObject(o.end)
			});
		}
	},

	constructor: function(o){
		this.initConfig(o);
		this.Class = 'TranscriptRangeDescription';
	}
});