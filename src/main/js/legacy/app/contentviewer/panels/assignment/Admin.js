const Ext = require('@nti/extjs');

require('../../navigation/assignment/Admin');
require('../Reader');


module.exports = exports = Ext.define('NextThought.app.contentviewer.panels.assignment.Admin', {
	extend: 'NextThought.app.contentviewer.panels.Reader',
	alias: 'widget.admin-assignment-reader',
	prefix: 'course-assignment-admin',

	getToolbarConfig: function () {
		return {
			xtype: 'course-assessment-admin-reader-header',
			parentView: this.parentView,
			student: this.student,
			path: this.path,
			pageSource: this.pageSource,
			assignment: this.assignment,
			assignmentHistory: this.assignmentHistory,
			assignmentHistoryItemContainer: this.assignmentHistoryItemContainer,
			doNavigation: this.doNavigation.bind(this),
			currentBundle: this.bundle,
			handleEdit: this.handleEdit
		};
	},

	afterRender: function () {
		this.callParent(arguments);

		var reader = this.down('reader-content'),
			student = this.student,
			bundle = this.bundle,
			pageInfo = this.pageInfo,
			assignment = this.assignment,
			assignmentHistoryItemContainer = this.assignmentHistoryItemContainer,
			readerAssessment = reader.getAssessment();

		reader.getScroll().lock();
		reader.pageWidgets.hide();

		function done () {
			reader.getScroll().unlock();
			this.beginViewedAnalytics();
		}

		if (!this.pageInfo) {
			console.error('No pageinfo configured');
			return;
		}

		if (!assignmentHistoryItemContainer || !(assignmentHistoryItemContainer instanceof Promise)) {
			assignmentHistoryItemContainer = Promise.resolve(this.assignmentHistoryItemContainer);
		}

		assignmentHistoryItemContainer
			.then(container => container.getMostRecentHistoryItem())
			.then((h) => {
				readerAssessment.setAssignmentFromInstructorProspective(assignment, h, student);
				reader.getNoteOverlay().disable();

				return reader.setPageInfo(pageInfo, bundle);
			})
			.then(done.bind(this));
	},

	getAnalyticData: function () {
		if (!this.assignment) {
			return {};
		}

		var bundle = this.ContextStore.getRootBundle(),
			data = {
				type: 'AssignmentView',
				resourceId: this.assignment.getId(),
				ContentID: this.pageInfo.getId(),
				course: bundle && bundle.getId()
			};

		return data;
	}
});
