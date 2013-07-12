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


	updateSelection: function(pageInfo, silent, suppressEvent){
		var me = this,
			ntiid = pageInfo && (pageInfo.isModel ? pageInfo.getId() : pageInfo),
			last = ContentUtils.getLineage(ntiid).last(),
			r = me.store.findRecord('NTIID',last,0,false,true,true);

		if(!suppressEvent){
			Ext.each(Ext.ComponentQuery.query('library-collection'), function(cmp){
				if(cmp !== me){
					cmp.updateSelection(pageInfo,silent,true);
				}
			});
		}
		if(r){
			me.suppressSetLocation = Boolean(silent);
			me.getSelectionModel().select(r);
		}
		else{
			me.getSelectionModel().deselectAll();
		}
	}
});
