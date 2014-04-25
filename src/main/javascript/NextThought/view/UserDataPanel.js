Ext.define('NextThought.view.UserDataPanel', {
	statics: {
		storeIds: {
			note: 'noteHighlightStore',
			highlight: 'noteHighlightStore',
			favorite: 'favoriteStore',
			transcriptsummary: 'transcriptSummaryStore'
		},
		//this is the only reason this file exists....
		getHistoryStoreForMimeType: function(mt) {
			var id = this.storeIds[mt.toLowerCase()];
			return id ? Ext.getStore(id) : undefined;
		}
	}
});
