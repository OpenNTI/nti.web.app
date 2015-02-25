Ext.define('NextThought.model.courses.assignments.InstructorCollection', {
	extend: 'NextThought.model.courses.assignments.BaseCollection',


	getHistory: function() {
		if (this.__loadHistoryRequest) { return this.__loadHistoryRequest; }

		var link = this.get('HistoryURL');

		if (!link) {
			return Promise.reject('No History Link');
		}

		this.__loadHistoryRequest = Service.request(link)
					.then(function(response) {
						return ParseUtils.parseItems(response)[0];
					})
					.fail(function(reason) {
						if (reason && reason.status === 404) {
							return NextThought.model.courseware.UsersCourseAssignmentHistory.getEmpty();
						}

						return reason;
					});

		return this.__loadHistoryRequest;
	},

	/**
	 * Get the HistoryItem for an assignment
	 * @param  {String} assignment Id of the assignment to get
	 * @return {[type]}            [description]
	 */
	getHistoryItem: function(assignment) {
		return this.getHistory()
				.then(function(history) {
					return history.getItem(assignment);
				});
	}
});
