Ext.define('NextThought.view.library.View', {
	extend: 'NextThought.view.Base',
	alias: 'widget.library-view-container',

	cls: 'library-view',
	layout: 'auto',

	items:[{
		ui: 'library-collection',
		courseList:true,
		xtype:'library-collection',
		name: getString('My Courses'),
		store: 'courses',
		hidden: true
	},{
		ui: 'library-collection',
		xtype:'library-collection',
		name: getString('My Books')
	}],


	initComponent: function(){
		this.callParent(arguments);
		this.removeCls('make-white');
		Library.on('show-courses','showCourses',this);
	},


	showCourses: function(){
		this.down('[courseList]').show();
	},


	restore: function(state){
		this.fireEvent('finished-restore');
	}
});
