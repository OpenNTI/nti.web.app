Ext.define('NextThought.app.course.assessment.components.Assignment', {
	extend: 'NextThought.app.course.content.Index',
	alias: 'widget.course-assessment-assignment',

	initComponent: function() {
		this.callParent(arguments);

		this.on('destroy', this.close.bind(this));
	},

	
	afterRender: function() {
		this.callParent(arguments);

		this.reader = NextThought.app.contentviewer.Index.create(this.readerConfig);

		this.setTitle(this.readerConfig.assignment.get('title'));

		this.reader.show();

		this.alignReader();
	},


	allowNavigation: function() {
		return this.reader ? this.reader.allowNavigation() : true;
	},


	close: function() {
		if (this.reader) {
			this.reader.destroy();
		}
	}
});
