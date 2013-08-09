Ext.define('NextThought.view.library.View', {
	extend: 'NextThought.view.Base',
	alias: 'widget.library-view-container',

	requires:[
		'NextThought.view.library.Branding'
	],

	cls: 'library-view',
	layout: 'auto',

	items:[{
		cls: 'branding',
		xtype: 'library-branding-box'
	},{
		ui: 'library-collection',
		cls: 'courses',
		courseList:true,
		xtype:'library-collection',
		name: getString('My Courses'),
		store: 'courses',
		hidden: true
	},{
		ui: 'library-collection',
		cls: 'books',
		xtype:'library-collection',
		name: getString('My Books')
	}],


	initComponent: function(){
		this.callParent(arguments);
		this.removeCls('make-white');
		Library.on('show-courses','showCourses',this);
	},


	showCourses: function(){ this.down('[courseList]').show(); },


	restore: function(state){ this.fireEvent('finished-restore'); }
});
