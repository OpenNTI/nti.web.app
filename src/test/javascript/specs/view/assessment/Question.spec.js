describe('Question View Tests', function(){

	describe('Solution Label Tests', function(){

		var question, testBody, solution, noop = function(){};
		beforeEach( function(){
			testBody = document.createElement('div');
			solution = document.createElement('div');
			Ext.fly(solution).addCls('naqsolution');
			Ext.fly(testBody).addCls('fakeQuestion');
			testBody.appendChild(solution);
			document.body.appendChild(testBody);
		});

		afterEach(function(){
			document.body.removeChild(testBody);
		});

		function questionWithUnits(units){
			var question = Ext.create('NextThought.view.assessment.Question', {
				renderTo: testBody,
				tabIndexTracker: {getNext: noop},
				initComponent: noop,
				contentElement: testBody,
				afterRender: noop
			});

			if(units){
				solution.setAttribute('data-nti-units', units);
			}

			return question;
		}

		it("handles comma separated list", function(){
			var question = questionWithUnits('%,percent');

			expect(question.retrieveAnswerLabel()).toEqual('%');
		});

		it("handles double comma from content", function(){
			var question = questionWithUnits('%,,.percent');

			expect(question.retrieveAnswerLabel()).toEqual('%');
		});

		it("handles single unit", function(){
			var question = questionWithUnits('hands');

			expect(question.retrieveAnswerLabel()).toEqual('hands');
		});

		it("handles no units", function(){
			var question = questionWithUnits();

			expect(question.retrieveAnswerLabel()).toBeFalsy();
		});
	});
});

