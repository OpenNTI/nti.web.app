var Ext = require('extjs');
var ParseUtils = require('../../../util/Parsing');
var AssignmentsBaseCollection = require('./BaseCollection');
var CacheSharedInstance = require('../../../cache/SharedInstance');
var CoursewareGradeBookSummaries = require('../../../store/courseware/GradeBookSummaries');
var CoursewareStudentHistoryItems = require('../../../store/courseware/StudentHistoryItems');
var CoursewareAssignmentHistoryItems = require('../../../store/courseware/AssignmentHistoryItems');


module.exports = exports = Ext.define('NextThought.model.courses.assignments.InstructorCollection', {
    extend: 'NextThought.model.courses.assignments.BaseCollection',

    constructor: function() {
		this.callParent(arguments);

		this.GradeCache = this.__createGradeCache();
		this.HistoryItemCache = this.__createHistoryItemCache();
	},

    __getIdOf: function(obj) {
		return Ext.isString(obj) ? obj : obj.getId();
	},

    __createGradeCache: function() {
		return NextThought.cache.SharedInstance.create({
			getKeyForRecord: function(record) {
				var userName = record.get ? record.get('Username') : record.Username,
					assignmentId = record.get ? record.get('AssignmentId') : record.AssignmentId;

				return userName + '/' + assignmentId;
			}
		});
	},

    __createHistoryItemCache: function() {
		var me = this;

		return NextThought.cache.SharedInstance.create({
			getKeyForRecord: function(record) {
				var user = record.get ? record.get('Creator') : record.Creator,
					assignment = record.get ? record.get('item') : record.item,
					userName = me.__getIdOf(user),
					assignmentId = me.__getIdOf(assignment);

				return userName + '/' + assignmentId;
			}
		});
	},

    /**
	 * Get the HistoryItem for an assignment, doesn't make sense for an instructor so reject
	 * @param  {String} assignment NTIID of the assignment
	 * @return {Promse}            fulfills with the history item
	 */
	getHistoryItem: function(assignment, useCache) {
		return Promise.reject();
	},

    /**
	 * Get the HistoryItemSummaries for an assignment
	 * returns a store that can be paged, filtered, and searched through
	 *
	 * @param  {String} assignment NTIID of the assignment
	 * @return {Store}            store proxied to load the summaries
	 */
	getAssignmentHistory: function(assignment) {
		return NextThought.store.courseware.AssignmentHistoryItems.create({
			url: assignment.getLink('GradeBookByAssignment'),
			GradeCache: this.GradeCache,
			HistoryItemCache: this.HistoryItemCache,
			assignment: assignment,
			assignments: this
		});
	},

    /**
	 * Get the HistoryItemSummaries for a user
	 * returns a store that can be pages, filtered, and searched though
	 *
	 * @param {String} historyLink link to the assignment histories for a user
	 * @param {User} [] [description]
	 * @param {[String]} available the list of ntiids for the assignments this student has
	 * @return {Store}      store proxied to load the summaries
	 */
	getStudentHistory: function(historyLink, studentId) {
		return NextThought.store.courseware.StudentHistoryItems.create({
			url: historyLink,
			GradeCache: this.GradeCache,
			HistoryItemCache: this.HistoryItemCache,
			assignments: this,
			student: studentId,
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
		user = this.__getIdOf(user);
		assignment = this.__getIdOf(assignment);

		var grade = this.GradeCache.findRecord(user + '/' + assignment);

		if (grade) {
			return Promise.resolve(grade);
		}

		return Promise.resolve(this.createPlaceholderGrade(assignment, user));
	},

    /**
	 * Returns a store with summaries for all the users
	 * @return {Store}		pageable, sortable, searchable list of user summaries
	 */
	getGradeSummaries: function() {
		var gradeBook = this.get('GradeBook');

		return NextThought.store.courseware.GradeBookSummaries.create({
			url: gradeBook && gradeBook.getLink('GradeBookSummary'),
			GradeCache: this.GradeCache,
			HistoryItemCache: this.HistoryItemCache,
			assignments: this
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
	},

    getCreateGradeLink: function() {
		var gradebook = this.getGradeBook();

		return gradebook && gradebook.getLink('SetGrade');
	},

    createPlaceholderGrade: function(assignment, user) {
		var href = this.getCreateGradeLink(),
			grade = NextThought.model.courseware.Grade.create({
				href: href,
				AssignmentId: this.__getIdOf(assignment),
				Username: this.__getIdOf(user),
				IsExcused: false
			});

		//pass the update flag to force incase we already have a cached instance
		//so it will be updated to a placeholder
		grade = this.GradeCache.getRecord(grade, null, true);

		grade.isPlaceholder = true;

		return grade;
	},

    createPlaceholderHistoryItem: function(assignment, user) {
		var grade = this.createPlaceholderGrade(assignment, user),
			historyItem = NextThought.model.courseware.UsersCourseAssignmentHistoryItem.create({
				Creator: user,
				item: assignment,
				AssignmentId: assignment.getId(),
				Grade: grade
			});

		//pass the update flag to force incase we already have a cached instance
		//so it will be updated to a placeholder
		historyItem = this.HistoryItemCache.getRecord(historyItem, null, true);

		historyItem.isPlaceholder = true;
		historyItem.collection = this;

		return historyItem;
	}
});
