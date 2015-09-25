export default Ext.define('NextThought.app.course.assessment.components.Assignment', {
	extend: 'NextThought.app.content.content.Index',
	alias: 'widget.course-assessment-assignment',

	afterRender: function() {
		this.callParent(arguments);

		this.reader = NextThought.app.contentviewer.Index.create(this.readerConfig);

		this.setTitle(this.readerConfig.assignment.get('title'));

		this.mon(this.reader, {
			'assignment-submitted': this.handleSubmission.bind(this)
		});

		this.add(this.reader);
	},


	allowNavigation: function() {
		return this.reader ? this.reader.allowNavigation() : true;
	},


	beforeRouteChange: function() {
		return this.reader && this.reader.beforeRouteChange();
	},


	handleSubmission: function(assignmentId, historyItemLink) {
		if (this.onSubmission) {
			this.onSubmission(assignmentId, historyItemLink);
		}
	},


	updateHistory: function(h) {
		var reader = this.reader;

		if (reader && reader.updateHistory) {
			reader.updateHistory(h);
		}
	}
});
