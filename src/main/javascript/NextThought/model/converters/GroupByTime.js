Ext.define('NextThought.model.converters.GroupByTime',{
	override: 'Ext.data.Types',

	GROUPBYTIME:{
		type: 'groupByTime',
		sortType: Ext.data.SortTypes.asUCString,
		convert: function(r,o){
			if(!r && this.mapping){ r = o.raw[this.mapping]; }

			var now = new Date(),
				v = new Date(r*1000),
				today = new Date(now.getFullYear(),now.getMonth(),now.getDate()),
				yesterday = new Date(now.getFullYear(),now.getMonth(),now.getDate()-1),
				day = new Date(v.getFullYear(), v.getMonth(), v.getDate()),
				dv = today - day,
				WEEK = 604800000,//milliseconds in a week
				MONTH = 2419200000; //millis in a 28day month (4 week)

			//TODO: make this better...serously.

			if(day.getTime()===today.getTime()){ return 'A '; }

			if(day.getTime()===yesterday.getTime()){ return 'B Yesterday'; }

			if(dv < WEEK){ return 'C'+(364-parseInt(Ext.Date.format(day,'z'),10))+Ext.Date.format(day,' l'); }

			if(dv < (2*WEEK)){ return 'D Last Week'; }

			if(dv < MONTH) { return 'E'+(12-parseInt(Ext.Date.format(day,'m'),10))+Ext.Date.format(day,' F'); }

			if(dv < (2*MONTH)){ return 'F Last Month'; }

			return 'G Older';
		}
	}
});
