Ext.define('NextThought.model.ContentBundle', {
	extend: 'NextThought.model.Base',

	fields: [
	],


	asUIData: function() {
		return {
			id: this.getId(),
			isCourse: false,
			title: '',
			label: '',
			icon: ''
		};
	},


	fireNavigationEvent: function(eventSource) {
		var id = this.get('NTIID');
		return new Promise(function(fulfill, reject) {
			var txn = history.beginTransaction('book-navigation-transaction-' + guidGenerator());
			eventSource.fireEvent('set-last-location-or-root', id, function(ntiid, reader, error) {
				if (error) {
					txn.abort();
					reject(error);
				}
				else {
					fulfill();
					txn.commit();
				}
			});
		});
	}
});
