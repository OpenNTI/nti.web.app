Ext.define('NextThought.util.Store',{
	singleton: true,

	fillInUsers: function(store, records){
		var users = Ext.Array.map(records||[],function(r){return r.get('Creator');});

		function apply(r,i){
			var u = users[i],
				id = u.getId(),
				c = r.get('Creator');

			if(c !== id && !Ext.isString(c) && c && c.getId() !== id){
				console.error('Bad mapping:', c, id, records, users, i);
				return;
			}

			if(c && !c.isModel){
				r.set('Creator',u);
			}
		}

		UserRepository.getUser(users,function(u){
			users = u;

			store.suspendEvents(true);
			Ext.each(records,apply);
			store.resumeEvents();

		});
	}
}, function(){
	window.StoreUtils = this;
});