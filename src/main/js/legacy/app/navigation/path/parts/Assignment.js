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
		for (let mimeType of NextThought.model.assessment.Assignment.mimeType) {
			handlers[mimeType] = this.getPathToAssignment.bind(this);
		}

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
			.catch(function (reason) {
				console.error('Failed to get path for grade: ', reason);
				return Promise.resolve([]);
			});
	}
});
