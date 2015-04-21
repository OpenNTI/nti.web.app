Ext.define('NextThought.model.converters.Date', {
	override: 'Ext.data.Types',
	requires: ['Ext.data.SortTypes']
}, function() {
	Ext.data.Types.ISODATE = {
		convert: function(v) {
			//if we already have a date don't try to parse it
			if (v instanceof Date) {
				return v;
			}

			if (v && v[v.length - 1] === 'Z') {
				v = v.substr(0, v.length - 1);
			}

			var fmt = 'Y-m-d\\TH:i:sP',
			//we know most of the time the date will be a timezone-less sting... so concat the GMT zone and parse strict.
				d = Ext.Date.parse(v + '-00:00', fmt, true);

			//if the parse strict fails, d will be undefined, and we will parse again without the concat.
			return d || Ext.Date.parse(v, fmt, true);
		},
		type: 'ISODate',
		sortType: Ext.data.SortTypes.asDate
	};
});
