

Ext.define( 'NextThought.view.Views', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.main-views',
	requires: [
		'Ext.layout.container.Card',
		'NextThought.view.views.Home',
		'NextThought.view.views.Library'
//		'NextThought.view.views.Classroom'
	],
	
	// plain: true,
	border: false, 
	frame: false,
	layout: {
		type: 'card',
		deferredRender: true
	},
	activeItem: 1,
	items:[
		{id: 'home',   xtype: 'home-view-container'},
		{id: 'library', xtype: 'library-view-container'}
//		{id: 'classroom', xtype: 'classroom-view-container'}
	],
	
	getActive: function() {
		return this.getLayout().getActiveItem();
	}
});
