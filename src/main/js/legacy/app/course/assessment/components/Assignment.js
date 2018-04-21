const Ext = require('@nti/extjs');

const ContentviewerIndex = require('legacy/app/contentviewer/Index');

require('legacy/app/content/content/Index');

module.exports = exports = Ext.define('NextThought.app.course.assessment.components.Assignment', {
	extend: 'NextThought.app.content.content.Index',
	alias: 'widget.course-assessment-assignment',

	afterRender: function () {
		this.callParent(arguments);

		this.reader = ContentviewerIndex.create(this.readerConfig);

		this.setTitle(this.readerConfig.assignment.get('title'));

		this.mon(this.reader, {
			'assignment-submitted': this.handleSubmission.bind(this)
		});

		this.add(this.reader);
	},


	allowNavigation: function () {
		return this.reader ? this.reader.allowNavigation() : true;
	},


	beforeRouteChange: function () {
		return this.reader && this.reader.beforeRouteChange();
	},


	handleSubmission: function (assignmentId, historyItemLink) {
		if (this.onSubmission) {
			this.onSubmission(assignmentId, historyItemLink);
		}
	},


	updateHistory: function (h) {
		var reader = this.reader;

		if (reader && reader.updateHistory) {
			reader.updateHistory(h);
		}
	},


	isSameConfig (config) {
		const currentConfig = this.readerConfig;
		const sameAssignment = currentConfig.assignment.getId() === config.assignment.getId();
		const sameStudent = currentConfig.student.getId() === config.student.getId();

		return sameAssignment && sameStudent;
	},


	alignNavigation () {
		if (this.reader) {
			this.reader.alignNavigation();
		}
	}
});
