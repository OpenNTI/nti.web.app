Ext.define('NextThought.model.Change', {
	extend: 'NextThought.model.Base',
	fields: [
		{ name: 'ChangeType', type: 'string' },
		{ name: 'Item', type: 'singleItem' },
		{ name: 'EventTime', mapping: 'Last Modified', convert: function(r){
			var now = new Date(),
				v = new Date(r*1000),
				today = new Date(now.getFullYear(),now.getMonth(),now.getDate()),
				yesterday = new Date(now.getFullYear(),now.getMonth(),now.getDate()-1),
				day = new Date(v.getFullYear(), v.getMonth(), v.getDate()),
				dv = today - day,
				WEEK = 604800000,//milliseconds in a week
				MONTH = 2419200000; //millis in a 28day month (4 week)
//TODO: make this better...
			if(day.getTime()===today.getTime()){ return ''; }

			if(day.getTime()===yesterday.getTime()){ return 'Yesterday'; }

			if(dv < WEEK){ return Ext.Date.format(day,'l'); }

			if(dv < (2*WEEK)){ return 'Last Week'; }

			if(dv < MONTH) { return Ext.Date.format(day,'F'); }

			if(dv < (2*MONTH)){ return 'Last Month'; }

			return 'Older';

		}}
	],

	getItemValue: function(field) {
		var i = this.get('Item');

		if (!i) {
			return null;
		}

		return i.get(field);
	}
});
