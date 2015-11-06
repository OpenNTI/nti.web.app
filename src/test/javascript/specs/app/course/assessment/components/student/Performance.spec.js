describe('Course Assignments, Student Performance view', function() {
	describe('Score Sorter tests', function() {
		var store;

		function addRecord(ntiid, completed, gradeValue) {
			var grade = new NextThought.model.courseware.Grade({value: gradeValue});

			store.add({
				NTIID: ntiid,
				completed: completed,
				Grade: grade
			});
		}


		function getSortedValues() {
			var sorter = new Ext.util.Sorter({
					sorterFn: NextThought.app.course.assessment.components.student.Performance.getScoreSorter()
				});

			store.sort(sorter);

			return store.getRange().map(function(x) {
				return x.get('NTIID');
			});
		}

		beforeEach(function() {
			store = new Ext.data.Store({
				fields: [
					{name: 'NTIID', type: 'string'},
					{name: 'completed', type: 'date'},
					{name: 'Grade', type: 'auto'}
				]
			});
		});


		it('Completed sorts correctly', function() {
			addRecord('Non-completed', null, null);
			addRecord('Completed', new Date(), null);

			var values = getSortedValues();

			expect(values[0]).toEqual('Completed');
			expect(values[1]).toEqual('Non-completed');
		});


		it('Numbers sort correctly', function() {
			addRecord('lower', new Date(), '1 A');
			addRecord('higher', new Date(), 2);

			var values = getSortedValues();

			expect(values[0]).toEqual('higher');
			expect(values[1]).toEqual('lower');
		});


		it('Alphanumeric sorts correctly', function() {
			addRecord('higher', new Date(), 'a F');
			addRecord('lower', new Date(), 'A -');

			var values = getSortedValues();

			expect(values[0]).toEqual('lower');
			expect(values[1]).toEqual('higher');
		});

		it('Mix numbers and Alphanumeric sorts correctly', function() {
			addRecord('higher', new Date(), 'A -');
			addRecord('lower', new Date(), '2 -');

			var values = getSortedValues();

			expect(values[0]).toEqual('lower');
			expect(values[1]).toEqual('higher');
		});
	});
});
