Ext.define('NextThought.model.courses.assignments.StudentCollection', {
	extend: 'NextThought.model.courses.assignments.BaseCollection',


	getHistory: function(useCache) {
		var link = this.get('HistoryURL');

		if (useCache && this.__getHistoriesRequest) {
			return this.__getHistoriesRequest;
		}

		if (!link) {
			return Promise.reject('No History Link');
		}

		this.__getHistoriesRequest = Service.request(link)
					.then(function(response) {
						return ParseUtils.parseItems(response)[0];
					})
					.fail(function(reason) {
						if (reason && reason.status === 404) {
							return NextThought.model.courseware.UsersCourseAssignmentHistory.getEmpty();
						}

						return reason;
					});

		return this.__getHistoriesRequest;
	},

	/**
	 * Get the HistoryItem for an assignment
	 * @param  {String} assignment Id of the assignment to get
	 * @param {Boolean} useCache use the last call instead of making a new one
	 * @return {[type]}            [description]
	 */
	getHistoryItem: function(assignment, useCache) {
		return this.getHistory(useCache)
				.then(function(history) {
					var item = history.getItem(assignment);

					if (item) {
						return Promise.resolve(item);
					}

					return Promise.reject();
				});
	},


	/**
	 * Update the history item in the cache with data
	 * @param  {String} assignment id of the assignment to update
	 * @param  {Object} data       data to update with
	 */
	updateHistoryItem: function(assignment, data) {
		return this.getHistory(true)
			.then(function(history) {
				var item = history.getItem(assignment);

				if (item) {
					item.raw = Ext.apply(item.raw || {}, data);
					item.set(data);
				} else {
					item = ParseUtils.parseItems(data)[0];
					history.addItem(assignment, item);
				}
			});
	}
});
