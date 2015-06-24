Ext.define('NextThought.app.library.courses.components.available.CourseDetailWindow', {
	extend: 'NextThought.app.library.courses.components.available.CourseWindow',

	isSingle: true,

	initComponent: function () {
		this.callParent(arguments);

		debugger;
		var me = this;
		// Go ahead and show the course detail window
		me.showCourse(this.record);
		wait()
			.then(me.show.bind(me));

	}
}, function() {
	NextThought.app.windows.StateStore.register(NextThought.model.courses.CourseCatalogEntry.mimeType, this);
});
