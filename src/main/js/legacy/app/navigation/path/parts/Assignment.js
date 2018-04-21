const Ext = require('@nti/extjs');

const Grade = require('legacy/model/courseware/Grade');
const LibraryActions = require('legacy/app/library/Actions');


module.exports = exports = Ext.define('NextThought.app.navigation.path.parts.Assignment', {
	constructor: function () {
		this.LibraryActions = LibraryActions.create();
	},

	addHandlers: function (handlers) {
		handlers['application/vnd.nextthought.grade'] = this.getPathToGrade.bind(this);
		handlers[Grade.mimeType] = this.getPathToGrade.bind(this);

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
