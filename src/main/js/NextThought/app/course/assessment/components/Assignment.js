Ext.define('NextThought.app.course.assessment.components.Assignment', {
	extend: 'NextThought.app.course.content.Index',
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


	handleSubmission: function(assignmentId, historyItemLink) {
		if (this.onSubmission) {
			this.onSubmission(assignmentId, historyItemLink);
		}
	}
});
