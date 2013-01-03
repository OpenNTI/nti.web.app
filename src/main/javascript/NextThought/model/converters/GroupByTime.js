Ext.define('NextThought.model.converters.GroupByTime',{
	override: 'Ext.data.Types',

	GROUPBYTIME:{
		type: 'groupByTime',
		sortType: Ext.data.SortTypes.asUCString,

		groupStringForElapsedTime: function(now, v){
			var oneDayAgo = Ext.Date.add(now, Ext.Date.DAY, -1),
				twoDaysAgo = Ext.Date.add(now, Ext.Date.DAY, -2),
				oneWeekAgo = Ext.Date.add(now, Ext.Date.DAY, -1 * 7),
				twoWeeksAgo = Ext.Date.add(now, Ext.Date.DAY, -2 * 7),
				threeWeeksAgo = Ext.Date.add(now, Ext.Date.DAY, -3 * 7),
				fourWeeksAgo = Ext.Date.add(now, Ext.Date.DAY, -4 * 7),
				oneMonthAgo = Ext.Date.add(now, Ext.Date.MONTH, -1),
				twoMonthsAgo = Ext.Date.add(now, Ext.Date.MONTH, -2),
				oneYearAgo = Ext.Date.add(now, Ext.Date.YEAR, -1);

			v = new Date(v.getFullYear(), v.getMonth(), v.getDate());

			//We take inspiration from outlook here.  Despite being a terrible piece of
			//software it actually does this well.	Today, Yesterday, Wed, tue, ..., Last week,
			//two weeks ago, three weeks ago, last month, this year, last year

			//TODO: make this better...serously. Grouping is better sort prefix is still wacky.

			if(Ext.Date.between(v, oneDayAgo, now)){ return 'A '; }

			if(Ext.Date.between(v, twoDaysAgo, oneDayAgo)){ return 'B Yesterday'; }

			if(Ext.Date.between(v, oneWeekAgo, twoDaysAgo)){
				//C<elapsed time ago><day string>
				return 'C' + (now.getTime() - v.getTime()) + Ext.Date.format(v, ' l');
			}

			if(Ext.Date.between(v, twoWeeksAgo, oneWeekAgo)){ return 'D Last week'; }

			if(Ext.Date.between(v, threeWeeksAgo, twoWeeksAgo)){ return 'E 2 weeks ago'; }

			if(Ext.Date.between(v, fourWeeksAgo, threeWeeksAgo)){ return 'F 3 weeks ago'; }

			if(Ext.Date.between(v, twoMonthsAgo, oneMonthAgo)){ return 'G Last month'; }

			if(Ext.Date.between(v, oneYearAgo, twoMonthsAgo)){ return 'H Last year'; }

			return 'I Older';
		},

		groupTitle: function(groupLabel, defaultValue){
			var groupName = groupLabel || '',
				regex = /^[A-Z]\d{0,}\s/;

			return groupName.replace(regex,'') || defaultValue;
		},

		convert: function(r,o){
			if(!r && this.mapping){ r = o.raw[this.mapping]; }

			var now = new Date(),
				v = new Date(r*1000);
			return this.type.groupStringForElapsedTime(now, v);
		}
	}
});
