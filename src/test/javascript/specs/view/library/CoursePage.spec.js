describe('Course Page Unit Tests', function() {
	
	describe('Binning Tests', function() {
		var coursePage, testBody;

		afterEach(function() {
			document.body.removeChild(testBody);
		});

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
			'December 25, 2014'
		]

		it('Should Return the Right Semester', function() { 
			for (index = 0; index < dates.length; index++) {
				// it('Should Return Right Semester', function() { 
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
			}
		});

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

		var testCourses = [ 
			{
				id: 'testCourse1',
				getCourseCatalogEntry: function() {
					return NextThought.model.courses.CourseCatalogEntry.create({
						StartDate: new Date('January 12, 2015'),
						EndDate: new Date('May 5, 2015')
					});
				}
			},
			{
				id: 'testCourse2',
				getCourseCatalogEntry: function() {
					return NextThought.model.courses.CourseCatalogEntry.create({
						StartDate: new Date('August 20, 2014'),
						EndDate: new Date('December 12, 2014')
					});
				}
			},
			{
				id: 'testCourse3',
				getCourseCatalogEntry: function() {
					return NextThought.model.courses.CourseCatalogEntry.create({
						StartDate: new Date('October 31, 2014'),
						EndDate: new Date('October 30, 2015')
					});
				}
			},
			{
				id: 'testCourse4',
				getCourseCatalogEntry: function() {
					return NextThought.model.courses.CourseCatalogEntry.create({
						StartDate: new Date('December 17, 2014'),
						EndDate: new Date('December 18, 2014')
					});
				}
			},
			{
				id: 'testCourse5',
				getCourseCatalogEntry: function() {
					return NextThought.model.courses.CourseCatalogEntry.create({
						StartDate: new Date('May 5, 2015'),
						EndDate: new Date('July 20, 2015')
					});
				}
			}
		];


		it('coursePage has a bin function', function() {
			var def = coursePage.binCourses(testCourses);
			expect(def).toBeTruthy();
		});

		it('Everything in the right bin', function() { 

			var def = coursePage.binCourses(testCourses);
			expect(def.years).toEqual([2014]);

			expect(def.upcoming).toEqual([2015]);

			var testFall = def.bins[2014]; 
			for (j = 0; j < testFall.length; j++) { 
				expect(testFall[j]).toEqual('testCourse2' || 'testCourse3' || 'testCourse4');
			}

			var testUpcoming = def.bins.upcoming[2015];
			for (j = 0; j < testUpcoming.length; j++) {
				expect(testUpcoming[j]).toEqual('testCourse1' || 'testCourse5');
			}
			//console.log(def.bins[2014]);
			for (j = 0; j < testFall.length; j++) {
				if ((testFall[j].id) === ('testCourse2' || 'testCourse3' || 'testCourse4')) {
					expect(Object.hasOwnPropertyName(def.years)).toEqual('Fall');
				}
			}

			for (j = 0; j < testUpcoming.length; j++) {
				if ((testUpcoming[j].id) === ('testCourse1' || 'testCourse5')) {
					expect(Object.hasOwnPropertyName(def.upcoming)).toEqual('Spring' && 'Summer');
				}
			}
		});
	});

});