Ext.define('NextThought.app.library.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.library-view-container',

	mixins: {
		Router: 'NextThought.mixins.Router',
		State: 'NextThought.mixins.State'
	},

	requires: [
		'NextThought.app.library.Actions',
		'NextThought.app.library.StateStore',
		'NextThought.app.library.courses.StateStore',
		'NextThought.app.library.content.StateStore',
		'NextThought.app.library.courses.components.Page'
	],


	layout: 'none',

	items: [
		{xtype: 'box', autoEl: {html: 'library'}}
	],


	initComponent: function() {
		this.callParent(arguments);

		this.LibraryStore = NextThought.app.library.StateStore.getInstance();

		this.handleRoute('/catalog/courses/', this.showAvailableCourses.bind(this));
		this.handleRoute('/catalog/books/', this.showAvailableBooks.bind(this));

		this.addDefaultRoute(this.showLibrary.bind(this));
	},


	applyState: function() {},


	showLibrary: function(route) {},


	showAvailableCourses: function(route, subRoute) {},


	showAvailableBooks: function(route, subRoute) {}
});
