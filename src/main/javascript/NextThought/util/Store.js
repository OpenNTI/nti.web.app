Ext.define('NextThought.util.Store', {
	singleton: true,

	fillInUsers: function fillIn(store, records) {

		if (store && arguments.length === 1) {
			store.on({'load': fillIn});
			return;
		}


		var users = Ext.Array.map(records || [], function (r) {return r.get('Creator');});

		function apply(r, i) {
			var u = users[i],
					id = u.getId(),
					c = r.get('Creator');

			if (c !== id && !Ext.isString(c) && c && c.getId() !== id) {
				console.error('Bad mapping:', c, id, records, users, i);
				return;
			}

			if (c && !c.isModel) {
				r.set('Creator', u);
			}
		}

		UserRepository.getUser(users, function (u) {
			users = u;

			store.suspendEvents(true);
			Ext.each(records, apply);
			store.resumeEvents();

		});
	},



	newView: function(store){
		if( Ext.isString(store) ){
			store = Ext.getStore(store);
		}

		var copy = new Ext.data.Store({
			proxy: 'memory',
			model: store.model,
			sorters: store.sorters.getRange(),
			data: store.getRange()
		});

		//probably a more efficient way exists...
		copy.mon(store,'datachanged',function(){
			copy.removeAll();
			delete copy.snapshot;
			copy.add(store.getRange());
			copy.filter();
		});

		return copy;

	}


}, function () {
	window.StoreUtils = this;
});
