Ext.define('NextThought.model.courses.assignments.InstructorCollection', {
	extend: 'NextThought.model.courses.assignments.BaseCollection',

	requires: [
		'NextThought.cache.SharedInstance',
		'NextThought.store.courseware.GradeBookSummaries',
		'NextThought.store.courseware.StudentHistoryItems'
	],


	constructor: function() {
		this.callParent(arguments);

		this.GradeCache = this.__createGradeCache();
		this.HistoryItemCache = this.__createHistoryItemCache();
	},


	__createGradeCache: function() {
		return NextThought.cache.SharedInstance.create();
	},


	__createHistoryItemCache: function() {
		return NextThought.cache.SharedInstance.create();
	},


	/**
	 * Get the HistoryItem (not summary) for the user for an assignment
	 * @param  {String} assignment NTIID of the assignment
	 * @param  {String} user       Username of the user
	 * @return {Promse}            fulfills with the history item
	 */
	getHistoryItem: function(assignment, user) {
		return Promise.resolve();
	},

	/**
	 * Get the HistoryItemSummaries for an assignment
	 * returns a store that can be paged, filtered, and searched through
	 *
	 * @param  {String} assignment NTIID of the assignment
	 * @return {Store}            store proxied to load the summaries
	 */
	getAssignmentHistory: function(assignment) {
		return Promise.resolve();
	},


	/**
	 * Get the HistoryItemSummaries for a user
	 * returns a store that can be pages, filtered, and searched though
	 *
	 * @param  {String} historyLink link to the assignment histories for a user
	 * @return {Store}      store proxied to load the summaries
	 */
	getStudentHistory: function(historyLink, studentId) {
		return NextThought.store.courseware.StudentHistoryItems.create({
			url: historyLink,
			GradeCache: this.GradeCache,
			HistoryItemCache: this.HistoryItemCache,
			assignments: this,
			pageSize: this.getCount() //load all of the history item for a student
		});
	},


	/**
	 * Returns the gradebook entry for an assignment
	 * @param  {String} assignment NTIID of the assignment
	 * @return {Promise}           fulfills with the gradebook entry
	 */
	getGradeBookEntry: function(assignment) {
		return Promise.resolve();
	},


	/**
	 * Returns the grade for a user on an assignment
	 * @param  {String} assignment NTIID of the assignment
	 * @param  {String} user       Username of the user
	 * @return {Promise}            fulfills with the grade
	 */
	getGradeFor: function(assignment, user) {
		return Promise.resolve();
	},


	/**
	 * Returns a store with summaries for all the users
	 * @return {Store}		pageable, sortable, searchable list of user summaries
	 */
	getGradeSummaries: function() {
		var gradeBook = this.get('GradeBook');

		return NextThought.store.courseware.GradeBookSummaries.create({
			url: gradeBook.getLink('GradeBookSummary'),
			GradeCache: this.GradeCache
		});
	},


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
	}
});
