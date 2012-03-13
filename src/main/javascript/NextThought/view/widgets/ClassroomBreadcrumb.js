Ext.define('NextThought.view.widgets.ClassroomBreadcrumb', {
	extend: 'NextThought.view.widgets.Breadcrumb',
	alias: 'widget.classroom-breadcrumbbar',


	initComponent: function(){
		this.callParent(arguments);
		this.reset();
	},

	onResize: function(){
		//dont resize buttons here...
	}

});