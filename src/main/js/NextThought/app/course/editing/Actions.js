Ext.define('NextThought.app.course.editing.Actions', {
	extend: 'NextThought.common.Actions',

	updateAssignmentDates: function(assignment, available, due) {
		var link = assignment.getLink('edit');

		if (!link) {
			return Promise.reject('No edit link');
		}

		return Service.put(link, {
			available_for_submission_beginning: available,
			available_for_submission_ending: due
		}).then(function(response) {
			assignment.syncWithResponse(response);
		});
	}
});
