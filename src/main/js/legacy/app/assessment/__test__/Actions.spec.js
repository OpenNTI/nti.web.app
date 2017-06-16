/* eslint-env jest */
require('../Actions.js');
require('legacy/model/assessment/AssignmentSubmission');
require('legacy/model/assessment/QuestionSetSubmission');
require('legacy/model/assessment/Assignment');
require('legacy/model/assessment/AssignmentPart');
require('legacy/model/assessment/UsersCourseAssignmentSavepointItem');
require('legacy/model/assessment/AssignmentSubmission');

// const { guidGenerator } = require('legacy/util/Globals');

describe ('Assessment Actions tests', () => {
	describe ('Assignment version tests', () => {

		const ASSIGNMENT_VERSION = '2016-05-05 23:45:16.943';
		let Assignment;

		beforeEach (() => {
			Assignment = NextThought.model.assessment.Assignment.create({
				ContainerId: 'tag:nextthought.com,2011-10:NTI-CourseInfo-NTI_NTI1000',
				Creator: 'carlos.sanchez@nextthought.com',
				ID: 'tag:nextthought.com,2011-10:NTI-NAQ-assignment_carlos_sanchez_nextthought_com_4743932405747896015_e102ce81',
				NTIID: 'tag:nextthought.com,2011-10:NTI-NAQ-assignment_carlos_sanchez_nextthought_com_4743932405747896015_e102ce81',
				version: ASSIGNMENT_VERSION,
				Links: [
					{
						Class: 'Link',
						rel: 'Savepoint',
						href:'http://localhost:8082/dataserver2/foo-bar'
					}
				],
				parts: [
					{
						Class: 'AssignmentPart',
						MimeType:'application/vnd.nextthought.assessment.assignmentpart',
						NTIID:'tag:nextthought.com,2011-10:system-OID-0x02208d:5573657273',
						'question_set': {
							MimeType:'application/vnd.nextthought.naquestionset',
							title:'File Upload',
							NTIID: 'tag:nextthought.com,2011-10:Foo-bar',
							questions: [
								{
									MimeType: 'application/vnd.nextthought.naquestion',
									NTIID:'tag:nextthought.com,2011-10:NTI-NAQ-question_carlos_sanchez_nextthought_com_4743934952258491648_697e19e0'
								}
							]
						}
					}
				]
			});
		});

		afterEach (function () {
			Assignment = null;
		});

		function mockSaveProgress (options) {
			let id = this.get('assignmentId');
			let assignment = null;
			if (id === Assignment.getId()) {
				assignment = Assignment;
			}

			if (assignment.get('version') === this.get('version')) {
				const version = assignment.get('version');
				options.success(this, {
					getResultSet: function () {
						let rec = NextThought.model.assessment.UsersCourseAssignmentSavepointItem.create({
							Class: 'UsersCourseAssignmentSavepointItem',
							MimeType: 'application/vnd.nextthought.assessment.userscourseassignmentsavepointitem',
							NTIID: 'tag:nextthought.com,2011-10:pacitest2-OID-foo-bar',
							Submission: {
								Class: 'AssignmentSubmission',
								MimeType: 'application/vnd.nextthought.assessment.assignmentsubmission',
								version: version,
								assignmentId: id,
								parts: []
							}
						});

						return {records: [rec]};
					}
				});
			}
			else {
				options.failure(this, {error:{status: 409, message: 'Version conflict. The assignment version has changed.'}});
			}
		}


		test ('that the assignment version is passed', function () {
			const questionData = {CreatorRecordedEffortDuration: 'John Doe'};
			const qsetSubmission = NextThought.model.assessment.QuestionSetSubmission.create(questionData);
			const submission = NextThought.model.assessment.AssignmentSubmission.create({
				assignmentId: Assignment.getId(),
				parts: [qsetSubmission],
				CreatorRecordedEffortDuration: questionData.CreatorRecordedEffortDuration,
				version: Assignment.get('version')
			});

			expect(submission.get('version')).toBe(Assignment.get('version'));
		});

		test ('savepoint: assignment and submission have the same version', function (done) {
			const questionData = {CreatorRecordedEffortDuration: '35'};
			const qsetSubmission = NextThought.model.assessment.QuestionSetSubmission.create(questionData);
			const submission = NextThought.model.assessment.AssignmentSubmission.create({
				assignmentId: Assignment.getId(),
				parts: [qsetSubmission],
				CreatorRecordedEffortDuration: questionData.CreatorRecordedEffortDuration,
				version: Assignment.get('version')
			});

			submission.save = mockSaveProgress.bind(submission);

			const Actions = NextThought.app.assessment.Actions.create({
				getObjectURL: (id) => {
					return id;
				},
				handleConflictError: () => {}
			});

			Actions.doSaveProgress(submission, Assignment)
				.then((res) => {
					done();
					let s = res.get('Submission');
					expect(s.get('assignmentId')).toBe(Assignment.getId());
				});
		});

		test ('savepoint: assignment and submission have the different version', function (done) {
			const questionData = {CreatorRecordedEffortDuration: 'John Doe'};
			const qsetSubmission = NextThought.model.assessment.QuestionSetSubmission.create(questionData);
			const OLD_VERSION = 'assignment-id-old-version';
			const submission = NextThought.model.assessment.AssignmentSubmission.create({
				assignmentId: Assignment.getId(),
				parts: [qsetSubmission],
				CreatorRecordedEffortDuration: questionData.CreatorRecordedEffortDuration,
				version: OLD_VERSION
			});

			submission.save = mockSaveProgress.bind(submission);

			const Actions = NextThought.app.assessment.Actions.create({
				getObjectURL: (id) => {
					return id;
				},
				handleConflictError: () => {}
			});

			Actions.doSaveProgress(submission, Assignment)
				.then((err) => {
					done();
					expect(submission.get('version')).toBe(OLD_VERSION);
					expect(err.status).toBe(409);
				});
		});
	});
});
