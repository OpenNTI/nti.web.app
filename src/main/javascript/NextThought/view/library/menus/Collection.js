Ext.define('NextThought.view.library.menus.Collection',{
	extend: 'NextThought.view.menus.navigation.Collection',
	alias: 'widget.library-collection',

	initComponent: function(){
		this.store = Library.getStore();
		this.callParent(arguments);

		this.mon(LocationProvider,'navigateComplete',this.updateSelection,this);
	},


	updateSelection: function(pageInfo){
		var ntiid = pageInfo ? pageInfo.getId() : null,
			last = LocationProvider.getLineage(ntiid).last(),
			r = this.store.findRecord('NTIID',last,0,false,true,true);
		if(r){
			this.getSelectionModel().select(r,false, true);
		}
		else{
			this.getSelectionModel().deselectAll();
		}
	},


	afterRender: function(){
		this.callParent(arguments);
		this.updateSelection();
	}
});
