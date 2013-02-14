

Ext.define( 'NextThought.view.Views', {
	extend: 'Ext.container.Container',
	alias: 'widget.main-views',
	requires: [
		'Ext.layout.container.Card',
		'NextThought.view.views.Profiles',
		'NextThought.view.views.Library'
	],
	
	plain: true,
	border: false, 
	frame: false,
	layout: {
		type: 'card',
		deferredRender: true
	},
	activeItem: 0,
	items:[
		{id: 'profile', xtype: 'profile-view-container'},
		{id: 'library', xtype: 'library-view-container'},
		{id: 'forums', xtype: 'view-container'},
		{id: 'contacts', xtype: 'view-container'}
	],
	
	getActive: function() {
		return this.getLayout().getActiveItem();
	}
});
