Ext.define('NextThought.view.library.menus.Collection',{
	extend: 'NextThought.view.menus.navigation.Collection',
	alias: 'widget.library-collection',

	initComponent: function(){
		this.store = Library.getStore();
		this.callParent(arguments);
	},


	handleSelect: function(selModel, record){
		this.fireEvent('set-last-location-or-root',record.get('NTIID'));
		Ext.menu.Manager.hideAll();
	},


	updateSelection: function(pageInfo){
		var ntiid = pageInfo && (pageInfo.isModel ? pageInfo.getId() : pageInfo),
			last = ContentUtils.getLineage(ntiid).last(),
			r = this.store.findRecord('NTIID',last,0,false,true,true);
		if(r){
			this.getSelectionModel().select(r);
		}
		else{
			this.getSelectionModel().deselectAll();
		}
	}
});
