describe('Course Page Unit Tests', function() {
	describe('Binning Tests', function() {
		var coursePage, testBody;

		beforeEach(function() {
			testBody = document.createElement('div');

			document.body.appendChild(testBody);

			coursePage = Ext.create('NextThought.view.library.CoursePage',{
				renderTo: testBody
			});

			NTIStrings['months'] = {
				1: 'Spring',
				2: 'Spring',
				3: 'Spring',
				4: 'Spring',
				5: 'Summer',
				6: 'Summer',
				7: 'Summer',
				8: 'Fall',
				9: 'Fall',
				10: 'Fall',
				11: 'Fall',
				12: 'Fall'
			}
		});

		var dates = [
		'January 1, 2014',
		'February 14, 2014',
		'March 30, 2014',
		'April 10, 2014',
		'May 15, 2014',
		'June 5, 2014',
		'July 9, 2014',
		'August 20, 2014',
		'September 11, 2014',
		'October 31, 2014',
		'November 26, 2014',
		'December 25, 2014']

		for (index = 0; index < dates.length; index++) {
			it('Should Return Right Semester', function() { 
				var a = 1 + (new Date(dates[index])).getMonth; 
				if (a < 5) { 
					expect(NTIStrings[a].toEqual('Spring')); 
				} 
				else if (a > 4) { 
					if (a < 8) { 
						expect(NTIStrings[a].toEqual('Summer')); 
					}
					else if (a > 8) { 
						expect(NTIStrings[a].toEqual('Fall'));
					}
				}
				console.log(a + ' ' +NTIStrings[a] + ' ' + 'PASSED');
			})
			// it('Should Return Right Semester', function() {
			// 	var a = Ext.create('NextThought.model.coursePage', {
			// 		'semester': dates[index].getMonth()
				//});
				//expect(a.get('semester')).toEqual(dates[index].get('month'));
			//}
		};

		/*
			[
				{
					id: '',
					getCatalogEntry: function() {
						needs to return: getString('NextThought.model.courses.CourseCatalogEntry')
					}
				}

			]

		*/

		afterEach(function() {
			document.body.removeChild(testBody);
		});

		it('coursePage has a bin function', function() {
			expect(coursePage.binCourses).toBeTruthy();
		});
	});
});