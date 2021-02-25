const Ext = require('@nti/extjs');

const lazy = require('legacy/util/lazy-require').get('ParseUtils', () =>
	require('legacy/util/Parsing')
);

const UsersCourseAssignmentHistory = require('../../courseware/UsersCourseAssignmentHistory');

require('./BaseCollection');

module.exports = exports = Ext.define(
	'NextThought.model.courses.assignments.StudentCollection',
	{
		extend: 'NextThought.model.courses.assignments.BaseCollection',

		getHistory: function (useCache) {
			var link = this.get('HistoryURL');

			if (useCache && this.__getHistoriesRequest) {
				return this.__getHistoriesRequest;
			}

			if (!link) {
				return Promise.reject('No History Link');
			}

			this.__getHistoriesRequest = Service.request(link)
				.then(function (response) {
					return lazy.ParseUtils.parseItems(response)[0];
				})
				.catch(function (reason) {
					if (reason && reason.status === 404) {
						return UsersCourseAssignmentHistory.getEmpty();
					}

					return reason;
				});

			return this.__getHistoriesRequest;
		},

		/**
		 * Get the HistoryItem for an assignment
		 * @param  {string} assignment Id of the assignment to get
		 * @param {boolean} useCache use the last call instead of making a new one
		 * @returns {[type]}			   [description]
		 */
		getHistoryItem: async function (assignment, useCache) {
			const history = await this.getHistory(useCache);
			const item = history.getItem(assignment);

			if (!item) {
				throw new Error('No Item');
			}

			return item;
		},

		/**
		 * Update the history item in the cache with data
		 * @param  {string} assignment id of the assignment to update
		 * @param  {Object} data	   data to update with
		 * @returns {Promise} -
		 */
		updateHistoryItem: function (assignment, data) {
			return this.getHistory(true).then(function (history) {
				var item = history.getItem(assignment);

				if (item) {
					item.raw = Ext.apply(item.raw || {}, data);
					item.set(data);
				} else {
					item = lazy.ParseUtils.parseItems(data)[0];
					history.addItem(assignment, item);
				}
			});
		},
	}
);
