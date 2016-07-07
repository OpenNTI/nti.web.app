require('legacy/app/assessment/Actions');
var { guidGenerator } = require('legacy/util/Globals');

describe('NextThought.app.assessment.Actions', () => {

	let previousGlobalService;

	let associatedAssignment;
	let testQuestionSet;
	let testAction;

	beforeAll(() => {
		previousGlobalService = global.Service;

		global.Service = {
			getObjectURL: () => { return 'default'; }
		};
	});

	afterAll(() => {
		global.Service = previousGlobalService;
	});

	beforeEach(() => {
		associatedAssignment = {
			id: guidGenerator(),
			link: guidGenerator(),
			getId: () => { return this.id; },
			getLink: (link) => { return associatedAssignment[link]; }
		};

		testQuestionSet = {
			id: guidGenerator(),
			associatedAssignment: associatedAssignment,
			effortDuration: 0,
			getId: () => { return this.id; },
			getPreviousEffortDuration: () => { return this.effortDuration; }
		};

		testAction = NextThought.app.assessment.Actions.create({});
	});

	it('should call doPracticeSubmission for assignment submit with practice link.', () => {
		testQuestionSet.associatedAssignment.PracticeSubmission = 'practice';
		spyOn(testAction, 'doPracticeSubmission');

		testAction.submitAssignment(testQuestionSet, {}, {}, {});

		expect(testAction.doPracticeSubmission).toHaveBeenCalled();
	});

	it('should not call doPracticeSubmission for assignment submit without practice link.', () => {
		spyOn(testAction, 'doSubmission');

		testAction.submitAssignment(testQuestionSet, {}, {}, {});

		expect(testAction.doSubmission).toHaveBeenCalled();
	});
});
