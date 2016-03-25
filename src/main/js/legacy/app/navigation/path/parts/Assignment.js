var Ext = require('extjs');
var LibraryActions = require('../../../library/Actions');
var CoursewareGrade = require('../../../../model/courseware/Grade');
var AssessmentAssignment = require('../../../../model/assessment/Assignment');
var CoursewareUsersCourseAssignmentHistoryItemFeedback = require('../../../../model/courseware/UsersCourseAssignmentHistoryItemFeedback');


module.exports = exports = Ext.define('NextThought.app.navigation.path.parts.Assignment', {
	constructor: function () {
		this.LibraryActions = NextThought.app.library.Actions.create();
	},

	addHandlers: function (handlers) {
		handlers['application/vnd.nextthought.grade'] = this.getPathToGrade.bind(this);
		handlers[NextThought.model.courseware.Grade.mimeType] = this.getPathToGrade.bind(this);
		handlers[NextThought.model.assessment.Assignment.mimeType] = this.getPathToAssignment.bind(this);
		handlers[NextThought.model.courseware.UsersCourseAssignmentHistoryItemFeedback.mimeType] = this.getPathToFeedback.bind(this);
		handlers['application/vnd.nextthought.assessment.userscourseassignmenthistoryitemfeedback'] = this.getPathToFeedback.bind(this);

		return handlers;
	},

	getPathToAssignment: function (assignment, getPathTo) {
		return this.LibraryActions.findBundleForNTIID(assignment.get('ContainerId'))
			.then(function (bundle) {
				return [bundle, assignment];
			});
	},

	getPathToGrade: function (grade, getPathTo) {
		return Service.getObject(grade.get('AssignmentId'))
			.then(function (assignment) {
				return getPathTo(assignment);
			})
			.then(function (path) {
				return path.concat([grade]);
			})
			.fail(function (reason) {
				console.error('Failed to get path for grade: ', reason);
				return Promise.resolve([]);
			});
	},

	getPathToFeedback: function (feedback, getPathTo) {
		return Service.getObject(feedback.get('AssignmentId'))
			.then(function (assignment) {
				return getPathTo(assignment);
			})
			.then(function (path) {
				return path.concat([feedback]);
			})
			.fail(function (reason) {
				console.error('Failed to get path for feedback: ', reason);
				return Promise.resolve([]);
			});
	}
});
