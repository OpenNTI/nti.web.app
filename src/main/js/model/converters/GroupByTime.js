var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.model.converters.GroupByTime', {}, function() {
	Ext.data.Types.GROUPBYTIME = {
		type: 'groupByTime',
		sortType: Ext.data.SortTypes.asUCString,

		DAY: 86400,//seconds in a day
		WEEK: 604800, //seconds in a week

		groupForElapsedTime: function(n, v) {
			var now = new Date(n.getFullYear(), n.getMonth(), n.getDate()),
				oneDayAgo = Ext.Date.add(now, Ext.Date.DAY, -1),
				twoDaysAgo = Ext.Date.add(now, Ext.Date.DAY, -2),
				oneWeekAgo = Ext.Date.add(now, Ext.Date.DAY, -1 * 7),
				twoWeeksAgo = Ext.Date.add(now, Ext.Date.DAY, -2 * 7),
				threeWeeksAgo = Ext.Date.add(now, Ext.Date.DAY, -3 * 7),
				//fourWeeksAgo = Ext.Date.add(now, Ext.Date.DAY, -4 * 7),
				oneMonthAgo = Ext.Date.add(now, Ext.Date.MONTH, -1),
				twoMonthsAgo = Ext.Date.add(now, Ext.Date.MONTH, -2),
				oneYearAgo = Ext.Date.add(now, Ext.Date.YEAR, -1),
				weekday, nextWeekday;


			function between(date, start, end) {
				var t = date.getTime();
				return start.getTime() < t && t <= end.getTime();
			}


			v = new Date(v.getFullYear(), v.getMonth(), v.getDate());

			//We take inspiration from outlook here.  Despite being a terrible piece of
			//software it actually does this well.	Today, Yesterday, Wed, tue, ..., Last week,
			//two weeks ago, three weeks ago, last month, this year, last year

			if (between(v, oneDayAgo, now)) { return now; }//Today

			if (between(v, twoDaysAgo, oneDayAgo)) { return oneDayAgo; }//Yesterday

			if (between(v, oneWeekAgo, twoDaysAgo)) {
				nextWeekday = twoDaysAgo;

				do {
					weekday = nextWeekday;
					nextWeekday = Ext.Date.add(weekday, Ext.Date.DAY, -1);
					if (between(v, nextWeekday, weekday)) {
						return weekday;
					}
				} while (weekday > oneWeekAgo);

			}

			if (between(v, twoWeeksAgo, oneWeekAgo)) { return oneWeekAgo; }//Last Week

			if (between(v, threeWeeksAgo, twoWeeksAgo)) { return twoWeeksAgo; }// Two Weeks ago

			if (between(v, oneMonthAgo, threeWeeksAgo)) { return threeWeeksAgo; }// Three Weeks ago

			if (between(v, twoMonthsAgo, oneMonthAgo)) { return oneMonthAgo; }// Last Month

			if (between(v, oneYearAgo, twoMonthsAgo)) { return oneYearAgo; }// This Year

			return new Date(0); //Older
		},

		groupTitle: function(groupValue, defaultValue, forceNow) {
			var d = (forceNow || new Date()).setHours(0, 0, 0, 0), c, now = new Date(d),
				tollerance = 0.0099;

			function under(c, i) {
				var d = (i - c);
				d = d > 0 && d < tollerance;//account for DST shifts
				return c < i && !d;
			}

			if (!groupValue) {
				return defaultValue;
			}

			d = (d - groupValue.getTime()) / 1000;

			if (groupValue.getTime() === 0) { return 'Older'; }

			if (d <= 0) { return defaultValue; }//Today

			c = d / this.DAY;
			if (under(c, 2)) { return 'Yesterday'; }
			if (under(c, 7)) { return Ext.Date.format(groupValue, 'l'); }//Sunday, Monday, Tuesday, etc...

			c = d / this.WEEK;

			if (under(c, 2)) { return 'Last week'; }
			if (under(c, 3)) { return '2 weeks ago'; }
			if (under(c, 4)) { return '3 weeks ago'; }

			if (groupValue < Ext.Date.add(now, Ext.Date.MONTH, -2)) { return 'This year'; }

			return 'Last month';
		},

		convert: function(r, o) {
			if (!r && this.mapping) { r = o.get(this.mapping); }

			var now = new Date(),
				v = Ext.isDate(r) ? r : new Date(r * 1000);
			return this.type.groupForElapsedTime(now, v);
		}
	};
});
