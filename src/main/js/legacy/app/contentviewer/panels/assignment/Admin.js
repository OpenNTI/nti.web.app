const Ext = require('@nti/extjs');

require('../../navigation/assignment/Admin');
require('../Reader');

module.exports = exports = Ext.define(
	'NextThought.app.contentviewer.panels.assignment.Admin',
	{
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
				assignmentHistoryItemContainer:
					this.assignmentHistoryItemContainer,
				doNavigation: this.doNavigation.bind(this),
				currentBundle: this.bundle,
				handleEdit: this.handleEdit,
				selectHistoryItem: item => this.selectHistoryItem(item),
			};
		},

		afterRender: function () {
			this.callParent(arguments);
			this.afterRenderTask();
		},

		afterRenderTask: async function () {
			const reader = this.down('reader-content');
			const assignmentHistoryItemContainer = await this
				.assignmentHistoryItemContainer;

			reader.getScroll().lock();
			reader.pageWidgets.hide();

			if (!this.pageInfo) {
				console.error('No pageinfo configured');
				return;
			}

			const historyItem =
				await assignmentHistoryItemContainer?.getMostRecentHistoryItem();

			if (!reader.isDestroyed) {
				reader.getNoteOverlay().disable();
				this.selectHistoryItem(historyItem);
				reader.getScroll().unlock();
				this.beginViewedAnalytics();
			}
		},

		selectHistoryItem(historyItem) {
			const reader = this.down('reader-content');
			const header = this.down('course-assessment-admin-reader-header');
			const { assignment, student, bundle, pageInfo } = this;
			const readerAssessment = reader.getAssessment();

			readerAssessment.setAssignmentFromInstructorPerspective(
				assignment,
				historyItem,
				student
			);

			return reader.setPageInfo(pageInfo, bundle).then(() => {
				header.setActiveHistoryItem(historyItem);
			});
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
					course: bundle && bundle.getId(),
				};

			return data;
		},
	}
);
