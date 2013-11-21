Ext.define('NextThought.view.library.View', {
	extend: 'NextThought.view.Base',
	alias: 'widget.library-view-container',

	requires: [
		'NextThought.view.library.Branding'
	],

	cls: 'library-view scrollable',
	layout: 'auto',

	items: [
		{
			cls: 'branding',
			xtype: 'library-branding-box'
		},
		{
			ui: 'library-collection',
			cls: 'courses',
			courseList: true,
			xtype: 'library-collection',
			name: getString('My Courses'),
			store: 'courses',
			hidden: true
		},
		{
			ui: 'library-collection',
			cls: 'books',
			hidden: true,
			bookList: true,
			xtype: 'library-collection',
			name: getString('My Books')
		}
	],


	initComponent: function() {
		this.callParent(arguments);
		this.removeCls('make-white');
		this.mon(Library, {
			'show-courses': 'showCourses',
			'hide-courses': 'hideCourses',
			'show-books': 'showBooks',
			'hide-books': 'hideBooks'
		});
	},


	showCourses: function() {
		this.down('[courseList]').show();
	},


	hideCourses: function() {
		this.down('[courseList]').hide();
	},


	showBooks: function() {
		this.down('[bookList]').show();
	},


	hideBooks: function() {
		this.down('[bookList]').hide();
	},


	restore: function(state) {
		this.fireEvent('finished-restore');
	}
});
