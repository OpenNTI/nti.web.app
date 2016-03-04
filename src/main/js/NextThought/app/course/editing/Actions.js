Ext.define('NextThought.app.course.editing.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.model.conflict.DestructiveChallenge',
		'NextThought.app.conflict.Actions'
	],


	constructor: function() {
		this.callParent(arguments);

		this.ConflictActions = NextThought.app.conflict.Actions.create();
	},


	__resolveConflict: function(conflict, data) {
		return this.ConflictActions.resolveConflict(conflict, data);
	},


	updateAssignmentDates: function(assignment, available, due) {
		var me = this,
			link = assignment.getLink('edit'),
			data = {
				available_for_submission_beginning: available,
				available_for_submission_ending: due
			};

		if (!link) {
			return Promise.reject('No edit link');
		}

		return Service.put(link, data)
			.then(function(response) {
				assignment.syncWithResponse(response);

				return assignment;
			}).fail(function(response) {
				var conflict = response.responseText && ParseUtils.parseItems(response.responseText)[0];

				if (conflict && response.status === 409) {
					return me.__resolveConflict(conflict, data);
				}

				return Promise.reject(response);
			});
	}
});
