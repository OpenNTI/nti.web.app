Ext.define('NextThought.app.navigation.path.parts.Assignment', {
	requires: ['NextThought.app.library.Actions'],

	constructor: function() {
		this.LibraryActions = NextThought.app.library.Actions.create();
	},


	addHandlers: function(handlers) {
		handlers['application/vnd.nextthought.grade'] = this.getPathToGrade.bind(this);
		handlers[NextThought.model.courseware.Grade.mimeType] = this.getPathToGrade.bind(this);
		handlers[NextThought.model.assessment.Assignment.mimeType] = this.getPathToAssignment.bind(this);

		return handlers;
	},


	getPathToAssignment: function(assignment, getPathTo) {
		return this.LibraryActions.findBundleForNTIID(assignment.get('ContainerId'))
			.then(function(bundle) {
				return [bundle, assignment];
			});
	},


	getPathToGrade: function(grade, getPathTo) {
		return Service.getObject(grade.get('AssignmentId'))
			.then(function(assignment) {
				return getPathTo(assignment);
			})
			.then(function(path) {
				return path.concat([grade]);
			})
			.fail(function(reason) {
				console.error('Failed to get path for grade: ', reason);
				return Promise.resolve([]);
			});
	}
});
