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
			};
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
		];

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

		var testCourses = [
			{
				id: 'testCourse1',
				year: 2015,
				semester: 'Spring',
				getCourseCatalogEntry: function() {
					return NextThought.model.courses.CourseCatalogEntry.create({
						StartDate: new Date('January 12, 2015'),
						EndDate: new Date('May 5, 2015')
					});
				}
			},
			{
				id: 'testCourse2',
				year: 2014,
				semester: 'Fall',
				getCourseCatalogEntry: function() {
					return NextThought.model.courses.CourseCatalogEntry.create({
						StartDate: new Date('August 20, 2014'),
						EndDate: new Date('December 12, 2014')
					});
				}
			},
			{
				id: 'testCourse3',
				year: 2014,
				semester: 'Fall',
				getCourseCatalogEntry: function() {
					return NextThought.model.courses.CourseCatalogEntry.create({
						StartDate: new Date('October 31, 2014'),
						EndDate: new Date('October 30, 2015')
					});
				}
			},
			{
				id: 'testCourse4',
				year: 2014,
				semester: 'Fall',
				getCourseCatalogEntry: function() {
					return NextThought.model.courses.CourseCatalogEntry.create({
						StartDate: new Date('December 17, 2014'),
						EndDate: new Date('December 18, 2014')
					});
				}
			},
			{
				id: 'testCourse5',
				year: 2015,
				semester: 'Summer',
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

		it('Binned correctly', function() {
			var i, course, bin,
			 binObj = coursePage.binCourses(testCourses);

			 function testFunction(idArr) {
				for (i = 0; i < testCourses.length; i++) {
					for (j = 0; j < bin.length; j++) {
						if (testCourses[i].id === bin[j].id) {
							idArr.push(testCourses[i].id);
						}
					}
				}

				testVar = true;
				for (k = 0; k < bin.length; k++) {
					if (bin[k].id === idArr[k]) {
						testVar = true;
					}
					else {
						testVar = false;
						break;
					}
				}
				return testVar;
			}





			function binContains(bin, id) {
				var k, contains = false;

				for(k = 0; k < bin.length; k++) {
					if (bin[k].id === id) {
						contains = true;
						break;
					}
				}

				return contains;
			}


			for (i = 0; i < testCourses.length; i++) {
				testYear = testCourses[i].year;
				testID = testCourses[i].id;
				testSemester = testCourses[i].semester;

				if (testYear < 2015) {
					bin = binObj.bins[testYear][testSemester];
					expect(binContains(bin, testID)).toBeTruthy();
				}
				else if (testYear > 2014) {
					bin = binObj.bins.upcoming[testYear][testSemester];
					expect(binContains(bin, testID)).toBeTruthy();
				}
			}
		});

		it('Correct years used', function() {

			var def = coursePage.binCourses(testCourses);
			expect(def.years).toEqual([2014]);
			expect(def.upcoming).toEqual([2015]);
		});
	});
});
