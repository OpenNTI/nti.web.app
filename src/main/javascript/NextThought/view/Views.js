Ext.define( 'NextThought.view.Views', {
	extend: 'Ext.container.Container',
	alias: 'widget.main-views',
	requires: [
		'Ext.layout.container.Card',
		'NextThought.view.contacts.View',
		'NextThought.view.library.View',
		'NextThought.view.profiles.View'
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
		{id: 'contacts', xtype: 'contacts-view-container'}
	],
	
	getActive: function() {
		return this.getLayout().getActiveItem();
	},

	switchActiveViewTo: function(id){
		var layout = this.getLayout(), activeItem = layout.getActiveItem();

		if(activeItem.getId() === id){
			return activeItem;
		}
		return layout.setActiveItem(id);
	}
});
