//Note 2012 was a leap year.  We observed a bunch of problems due to that and the new year
//boundry.	Thats why many of the dates below span the 2012 to 2013 boundry

describe('GroupByTime Tests', function() {

	function grouping(now, then) {
		var groupByTime = Ext.data.Types.GROUPBYTIME;
		return groupByTime.groupForElapsedTime(now, then);
	}

	function groupLabel(group, def, current) {
		return Ext.data.Types.GROUPBYTIME.groupTitle(group, def, current);
	}

	//Returns an object containing groups an array of the groupingStrings
	//for the provided date, and labels an array of the user readibly labels
	function groupsAndLabels(current) {
		var result = {}, daysAgo = Array.prototype.slice.call(arguments, 1),
			dates = [], groups = [], labels = [],
			oneDay = 24 * 60 * 60 * 1000;

	   //An array of dates 2-5 days before current
	   daysAgo.forEach(function(dayAgo) {
		   dates.push(new Date(current.getTime() - (oneDay * dayAgo)));
	   });

	   dates.forEach(function(date) {
		   groups.push(grouping(current, date));
	   });

	   groups.sort(function(a, b) { return b - a; });

	   groups.forEach(function(str) {
		   labels.push(groupLabel(str, null, current));
	   });

	   result.groups = groups;
	   result.labels = labels;
	   return result;
	}


	function asDateStr(d) {
		return d.toDateString();
	}


	describe('Sortable Grouping String Tests', function() {

		it('Supports different hours on same day', function() {
		   var current = new Date('January 2, 2013 11:13:00'),
			   monday1 = new Date('December 31, 2012 11:13:00'),
			   monday2 = new Date('December 31, 2012 10:27:00'),
			   group, group2;

		   group = grouping(current, monday1);
		   group2 = grouping(current, monday2);
		   expect(/Mon Dec 31 2012/.test(group.toDateString())).toBeTruthy();
		   expect(/Mon Dec 31 2012/.test(group2)).toBeTruthy();
		   expect(group).toEqual(group2);
		});

		it('Works on last day of leap year', function() {
		   var current = new Date('January 2, 2013 11:13:00'),
			   endOfLeapYear = new Date('December 31, 2012 11:13:00'),
			   group;

		   group = grouping(current, endOfLeapYear);
		   expect(/Mon Dec 31 2012/.test(group.toDateString())).toBeTruthy();
		   expect(groupLabel(group, null, current)).toEqual('Monday');
		});

		it('Works on last day of normal year', function() {
		   var current = new Date('January 2, 2014 11:13:00'),
			   endOfLeapYear = new Date('December 31, 2013 11:13:00'),
			   group;

		   group = grouping(current, endOfLeapYear);
		   expect(/Tue Dec 31 2013/.test(group.toDateString())).toBeTruthy();
		   expect(groupLabel(group, null, current)).toEqual('Tuesday');
		});


		it('Sorts correctly within a week', function() {
		   var current = new Date('December 31, 2012 11:13:00'),
			   result;

		   result = groupsAndLabels(current, 2, 3, 4, 5);

		   expect(result.groups.map(asDateStr)).toEqual(['Sat Dec 29 2012', 'Fri Dec 28 2012', 'Thu Dec 27 2012', 'Wed Dec 26 2012']);
		   expect(result.labels).toEqual(['Saturday', 'Friday', 'Thursday', 'Wednesday']);
		});

		it('Sorts correctly across year boundry', function() {
		  var current = new Date('January 3, 2013 11:13:00'),
			  result;

		   result = groupsAndLabels(current, 2, 3, 4, 5);

		   expect(result.groups.map(asDateStr)).toEqual(['Tue Jan 01 2013', 'Mon Dec 31 2012', 'Sun Dec 30 2012', 'Sat Dec 29 2012']);
		   expect(result.labels).toEqual(['Tuesday', 'Monday', 'Sunday', 'Saturday']);
		});

		it('Works for all groupings', function() {
		   var current = new Date('January 3, 2013 11:13:00'),
			   result;

		   result = groupsAndLabels(current, 1, 2, 3, 4, 5, 6, 7, 15, 23, 40, 300, 500);
		   expect(result.groups.map(asDateStr)).toEqual([
			   'Wed Jan 02 2013',
			   'Tue Jan 01 2013',
			   'Mon Dec 31 2012',
			   'Sun Dec 30 2012',
			   'Sat Dec 29 2012',
			   'Fri Dec 28 2012',
			   'Thu Dec 27 2012',
			   'Thu Dec 20 2012',
			   'Thu Dec 13 2012',
			   'Mon Dec 03 2012',
			   'Tue Jan 03 2012',
			   'Wed Dec 31 1969'
		   ]);
		   expect(result.labels).toEqual([
			   'Yesterday',
			   'Tuesday',
			   'Monday',
			   'Sunday',
			   'Saturday',
			   'Friday',
			   'Last week',
			   '2 weeks ago',
			   '3 weeks ago',
			   'Last month',
			   'Last year',
			   'Older'
		   ]);

		});
	});

	describe('Group Title Tests', function() {
		it('Gives the default value', function() {
			var current = new Date(),//current time
				group;

			group = grouping(current, current);
			expect(groupLabel(group, 'foo')).toEqual('foo');
		});
	});
});

