Ext.define('NextThought.view.library.menus.Collection',{
	extend: 'NextThought.view.menus.navigation.Collection',
	alias: 'widget.library-collection',

	store: 'library',

	handleSelect: function(selModel, record){
		if(!this.suppressSetLocation){
			this.fireEvent('set-last-location-or-root',record.get('NTIID'));
		}
		delete this.suppressSetLocation;
		this.callParent(arguments);
	},


	updateSelection: function(pageInfo,silent){
		var ntiid = pageInfo && (pageInfo.isModel ? pageInfo.getId() : pageInfo),
			last = ContentUtils.getLineage(ntiid).last(),
			r = this.store.findRecord('NTIID',last,0,false,true,true);

		if(r){
			this.suppressSetLocation = Boolean(silent);
			this.getSelectionModel().select(r);
		}
		else{
			this.getSelectionModel().deselectAll();
		}
	}
});
