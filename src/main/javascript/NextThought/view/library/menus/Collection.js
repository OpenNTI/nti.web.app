Ext.define('NextThought.view.library.menus.Collection',{
	extend: 'NextThought.view.menus.navigation.Collection',
	alias: 'widget.library-collection',

	initComponent: function(){
		this.store = Library.getStore();
		this.callParent(arguments);

		this.mon(LocationProvider,'navigate',this.updateSelection,this);
	},


	updateSelection: function(ntiid){
		var last = LocationProvider.getLineage(ntiid).last();
		var r = this.store.findRecord('NTIID',last,0,false,true,true);
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
