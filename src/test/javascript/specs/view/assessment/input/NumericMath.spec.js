describe('NumericMath input Tests', function() {

	var nmInput, testBody, noop = function() {};
	beforeEach(function() {
		testBody = document.createElement('div');
		Ext.fly(testBody).addCls('input-container');
		document.body.appendChild(testBody);
	});


	it('Get solution doesn\'t explode', function() {
		var part = Ext.create('NextThought.model.assessment.NumericMathPart', {
				solutions: [NextThought.model.assessment.NumericMathSolution.create({
					value: 1.2
				})]
			}),
			solutionContent,
			nmInput = NextThought.view.assessment.input.NumericMath.create({
				renderTo: testBody,
				tabIndexTracker: {getNext: noop},
				reset: noop,
				disableSolution: noop,
				part: part
			});
		nmInput.filterHTML = Ext.identityFn;

		solutionContent = nmInput.getSolutionContent(part);
		expect(solutionContent).toBe('1.2');
		nmInput.destroy();
		document.body.removeChild(testBody);
	});
});
