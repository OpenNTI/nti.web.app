Ext.define('NextThought.app.library.StateStore', {
	extend: 'NextThought.common.StateStore',

	requires: [
		'NextThought.app.library.courses.StateStore',
		'NextThought.app.library.content.StateStore'
	],


	constructor: function() {
		this.callParent(arguments);

		this.CourseStore = NextThought.app.library.courses.StateStore.getInstance();
		this.ContentStore = NextThought.app.library.content.StateStore.getInstance();
	},


	getTitle: function(id) {
		return this.ContentStore.getTitle(id);
	}
});
