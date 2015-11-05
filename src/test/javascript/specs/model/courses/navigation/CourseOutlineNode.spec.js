describe('CourseOutlineNode tests', function() {
	describe('Availability tests', function() {
		function createOutlineNode(ntiid, start, end) {
			return NextThought.model.courses.navigation.CourseOutlineNode.create({
				NTIID: ntiid,
				AvailableBeginning: start,
				AvailableEnding: end
			});
		}

		function getRelativeDate(dayOffset) {
			var a = new Date();

			dayOffset = dayOffset || 0;

			a.setDate(a.getDate() + dayOffset);

			return a;
		}


		it('No NTIID and no dates is unavailable', function() {
			var node = createOutlineNode(null, null, null);

			expect(node.get('isAvailable')).toBeFalsy();
		});


		it('No NTIID and has Dates is unavailable', function() {
			var node = createOutlineNode(null, getRelativeDate(-1), getRelativeDate(1));

			expect(node.get('isAvailable')).toBeFalsy();
		});


		it('Has NTIID and no Dates is available', function() {
			var node = createOutlineNode('ntiid', null, null);

			expect(node.get('isAvailable')).toBeTruthy();
		});


		it('Has NTIID, after start, no end is available', function() {
			var node = createOutlineNode('ntiid', getRelativeDate(-1), null);

			expect(node.get('isAvailable')).toBeTruthy();
		});


		it('Has NTIID, before start, no end is unavailable', function() {
			var node = createOutlineNode('ntiid', getRelativeDate(1), null);

			expect(node.get('isAvailable')).toBeFalsy();
		});


		it('Has NTIID, no start, before end is available', function() {
			var node = createOutlineNode('ntiid', null, getRelativeDate(1));

			expect(node.get('isAvailable')).toBeTruthy();
		});


		it('Has NTIID, no start, after end is unavailable', function() {
			var node = createOutlineNode('ntiid', null, getRelativeDate(-1));

			expect(node.get('isAvailable')).toBeFalsy();
		});


		it('Has NTIID, after start, before end is available', function() {
			var node = createOutlineNode('ntiid', getRelativeDate(-1), getRelativeDate(1));

			expect(node.get('isAvailable')).toBeTruthy();
		});


		it('Has NTIID, after start, after end is unavailable', function() {
			var node = createOutlineNode('ntiid', getRelativeDate(-1), getRelativeDate(-1));

			expect(node.get('isAvailable')).toBeFalsy();
		});


		it('Has NTIID, before start, before end is unavailable', function() {
			var node = createOutlineNode('ntiid', getRelativeDate(1), getRelativeDate(1));

			expect(node.get('isAvailable')).toBeFalsy();
		});
	});
});
