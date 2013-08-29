Ext.define('NextThought.model.anchorables.TimeRangeDescription', {
	extend: 'NextThought.model.anchorables.ContentRangeDescription',


	config: {
		seriesId: '',
		start:    {},
		end:      null  //Optional
	},

	isTimeRange: true,

	isEmpty: false,

	statics: {
		createFromObject: function (o) {
			var cp = NextThought.model.anchorables.TimeContentPointer;
			return NextThought.model.anchorables.TimeRangeDescription.create({
																				 seriesId: o.seriesId,
																				 start:    cp.createFromObject(o.start),
																				 end:      cp.createFromObject(o.end)
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
		return Boolean(o instanceof NextThought.model.anchorables.TimeContentPointer);
	}
});