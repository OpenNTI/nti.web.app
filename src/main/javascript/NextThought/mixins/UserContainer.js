Ext.define('NextThought.mixins.UserContainer', {
	/*
	*  We assume that the component that mixes in with this should implement 'createUserComponent' and
	*  the its children should implement 'getUserObject' method.
	*/

	//Users isn't very big here so do the naive thing
	indexToInsertAt: function(users, newUser){
		var idx = 0, me = this;
		Ext.Array.each(users, function(u){
			if(me.userSorterFunction(u, newUser) < 0){
				idx++;
				return true;
			}
			return false;
		});
		return idx;
	},

	addUser: function(user){
		var existing = this.down('[username='+user.get('Username')+']'), users;
		if(!existing){
			//Figure out where we need to insert it
			users = Ext.Array.map(this.query('[username]')||[], function(u){return u.getUserObject();});
			this.insert(this.indexToInsertAt(users, user), this.createUserComponent(user));
			if(Ext.isFunction(this.afterUserAdd)){
				this.afterUserAdd(user);
			}
			return true;
		}
		return false;
	},

	removeUser: function(user) {
		var name = (user && user.isModel) ? user.get('Username') : user,
			existing = this.down('[username='+name+']');
		if (existing){
			this.remove(existing, true);
			if(Ext.isFunction(this.afterUserRemoved)){
				this.afterUserRemoved(name);
			}
			return true;
		}
		return false;
	},

	//Sort the users first by presense (online, offline) then
	//alphabetically withing that
	userSorterFunction: function(a, b){
		var aPresence = a.get('Presence'),
			bPresence = b.get('Presence'),
			aName = a.get('displayName'),
			bName = b.get('displayName'),
			presenceResult, nameResult;

		presenceResult = bPresence.localeCompare(aPresence);
		if(presenceResult !== 0){
			return presenceResult;
		}

		return aName.localeCompare(bName);
	}

});