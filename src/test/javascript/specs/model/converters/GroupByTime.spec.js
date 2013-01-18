//Note 2012 was a leap year.  We observed a bunch of problems due to that and the new year
//boundry.	Thats why many of the dates below span the 2012 to 2013 boundry

describe("GroupByTime Tests", function() {

	function groupingString(now, then){
		var groupByTime = Ext.data.Types.GROUPBYTIME;
		return groupByTime.groupStringForElapsedTime(now, then);
	};

	function groupLabel(groupString, def){
		return Ext.data.Types.GROUPBYTIME.groupTitle(groupString, def);
	};

	describe('Sortable Grouping String Tests', function(){

		it('Supports different hours on same day', function(){
		   var current = new Date('January 2, 2013 11:13:00'),
			   monday1 = new Date("December 31, 2012 11:13:00"),
			   monday2 = new Date("December 31, 2012 10:27:00"),
			   group, group2;

		   group = groupingString(current, monday1);
		   group2 = groupingString(current, monday2)
		   expect(/C\d+\sMonday/.test(group)).toBeTruthy();
		   expect(/C\d+\sMonday/.test(group2)).toBeTruthy();
		   expect(group).toEqual(group2);
		});

		it('Works on last day of leap year', function(){
		   var current = new Date('January 2, 2013 11:13:00'),
			   endOfLeapYear = new Date("December 31, 2012 11:13:00"),
			   group;

		   group = groupingString(current, endOfLeapYear);
		   expect(/C\d+\sMonday/.test(group)).toBeTruthy();
		   expect(groupLabel(group)).toEqual('Monday');
		});

		it('Works on last day of normal year', function(){
		   var current = new Date('January 2, 2014 11:13:00'),
			   endOfLeapYear = new Date("December 31, 2013 11:13:00"),
			   group;

		   group = groupingString(current, endOfLeapYear);
		   expect(/C\d+\sTuesday/.test(group)).toBeTruthy();
		   expect(groupLabel(group)).toEqual('Tuesday');
		});

		//Returns an object containing groups an array of the groupingStrings
		//for the provided date, and labels an array of the user readibly labels
		function groupsAndLabels(current, daysAgo){
			var result = {},
				i, dates = [], groupStrings = [], labels = [],
				oneDay = 24 * 60 * 60 * 1000;

		   if(!Ext.isArray(daysAgo)){
			   daysAgo = Array.prototype.slice.call(arguments, 1);
		   }

		   //An array of dates 2-5 days before current
		   Ext.each(daysAgo, function(dayAgo){
			   dates.push(new Date(current.getTime() - (oneDay * dayAgo)));
		   });

		   Ext.each(dates, function(date){
			   groupStrings.push(groupingString(current, date));
		   });

		   groupStrings = Ext.Array.sort(groupStrings);

		   Ext.each(groupStrings, function(str){
			   labels.push(groupLabel(str));
		   });

		   result.groups = groupStrings;
		   result.labels = labels;
		   return result;
		}

		it('Sorts correctly within a week', function(){
		   var current = new Date('December 31, 2012 11:13:00'),
			   result;

		   result = groupsAndLabels(current, 2, 3, 4, 5);

		   expect(result.groups).toEqual([ 'C172800000 Saturday', 'C259200000 Friday', 'C345600000 Thursday', 'C432000000 Wednesday' ]);
		   expect(result.labels).toEqual(["Saturday", "Friday", "Thursday", "Wednesday"]);
		});

		it('Sorts correctly across year boundry', function(){
		  var current = new Date('January 3, 2013 11:13:00'),
			  result;

		   result = groupsAndLabels(current, [2, 3, 4, 5]);

		   expect(result.groups).toEqual([ 'C172800000 Tuesday', 'C259200000 Monday', 'C345600000 Sunday', 'C432000000 Saturday' ]);
		   expect(result.labels).toEqual(["Tuesday", "Monday", "Sunday", "Saturday"]);
		});

		it('Works for all groupings', function(){
		   var current = new Date('January 3, 2013 11:13:00'),
			   result;

		   result = groupsAndLabels(current, 1, 2, 3, 4, 5, 6, 7, 15, 23, 40, 300, 500);
		   expect(result.groups).toEqual([ 'B Yesterday', 'C172800000 Tuesday', 'C259200000 Monday', 'C345600000 Sunday', 'C432000000 Saturday', 'C518400000 Friday', 'D Last week', 'E 2 weeks ago', 'F 3 weeks ago', 'G Last month', 'H Last year', 'I Older' ]);
		   expect(result.labels).toEqual(["Yesterday", "Tuesday", "Monday", "Sunday", "Saturday", "Friday", "Last week", "2 weeks ago", "3 weeks ago", "Last month", "Last year", "Older"]);

		});
	});

	describe('Group Title Tests', function(){
		it('Gives the default value', function(){
			var current = new Date('January 2, 2013 11:13:00'),
				group;

			group = groupingString(current, current);
			expect(groupLabel(group, 'foo')).toEqual('foo');
		});
	});
});

