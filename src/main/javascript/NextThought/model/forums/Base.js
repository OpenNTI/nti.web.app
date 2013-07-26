Ext.define('NextThought.model.forums.Base',{
	extend: 'NextThought.model.Base',


	getContentsStoreId: function(){
		return this.get('Class')+'-'+this.get('NTIID');
	},


	buildContentsStore: function(cfg, extraParams){
		var store = NextThought.store.NTI.create(Ext.apply({
			storeId: this.getContentsStoreId(),
			url: this.getLink('contents'),
			sorters: [{
				property: 'CreatedTime',
				direction: 'DESC'
			}]
		}, cfg || {}));

		store.proxy.extraParams = Ext.apply(
			store.proxy.extraParams || {},
			Ext.apply({
				sortOn: 'CreatedTime',
				sortOrder: 'descending'
			}, extraParams));

		//Because the View is tied to the store and its events, any change to
		// records trigger a refresh. :)  So we don't have to impl. any special logic filling in. Just replace the
		// Creator string with the user model and presto!
		store.on('load',this.fillInUsers,this);

		return store;
	},


	fillInUsers: function(store, records){
		var users = Ext.Array.map(records,function(r){return r.get('Creator');});

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
	},


	getParentHref: function(){
		var path = this.get('href');
		path = path.split('/');
		path.pop();
		return path.join('/');
	}
});
