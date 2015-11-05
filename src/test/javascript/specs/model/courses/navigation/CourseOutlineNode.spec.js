describe('CourseOutlineNode tests', function() {
	describe('Availability tests', function() {
		function createOutlineNode(ntiid) {
			return NextThought.model.courses.navigation.CourseOutlineNode.create({
				ContentNTIID: ntiid
			});
		}

		it('No ContentNTIID is unavailable', function() {
			var node = createOutlineNode(null);

			expect(node.get('isAvailable')).toBeFalsy();
		});

		it('Has ContentNTIID is available', function() {
			var node = createOutlineNode('ntiid');

			expect(node.get('isAvailable')).toBeTruthy();
		});
	});
});
