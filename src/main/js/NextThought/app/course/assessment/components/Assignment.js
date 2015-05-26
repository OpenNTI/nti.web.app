Ext.define('NextThought.app.course.assessment.components.Assignment', {
	extend: 'NextThought.app.course.content.Index',
	alias: 'widget.course-assessment-assignment',
	
	afterRender: function() {
		this.callParent(arguments);

		this.reader = NextThought.app.contentviewer.Index.create(this.readerConfig);

		this.setTitle(this.readerConfig.assignment.get('title'));

		this.add(this.reader);
	},


	allowNavigation: function() {
		return this.reader ? this.reader.allowNavigation() : true;
	}
});
