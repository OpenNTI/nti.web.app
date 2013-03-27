Ext.define('NextThought.proxy.reader.Base', {
	extend: 'Ext.data.reader.Json',
	alias : 'reader.nti-base',

	preresolveUserList: function(record, field){
		var users = (record.raw || {})[field], userCount;

		if(!Ext.isEmpty(users)){
			userCount = users.length;
			//console.debug('Need to preresolve userlist for' , record.getId(), field, users);
			Ext.Array.each(users, function(user){
				//User could be a string, model, or obj
				var name = Ext.isString(user) ?
								user : user.get ?
									user.get('Username') : user.Username ?
										user.Username : null;
				if(!user){
					console.warn("WARNING: Could not handle Object: ", user);
				}
				else{
					UserRepository.getUser(name, function(){
						userCount--;
						if(userCount === 0){
							record.fireEvent('preResolvingUsersComplete', record);
//							console.debug('Fired preResolvingUsersComplete event for ', record);
						}
					});
				}
			});
		}
	},

	//TODO The fact we are doing this may play into why we run into issues
	//with LastModified caching and friends lists.  Need to look into that
	fillCacheWithUserList: function(record, field){
		var users = (record.raw || {})[field];

		if(!Ext.isEmpty(users)){
			//console.debug('Need to fill cache with userlist for' , record.getId(), field, users);
			Ext.Array.each(users, function(user){
				if(user.isModel || Ext.isObject(user)){
					UserRepository.precacheUser(user);
				}
			});
		}
	},

	precacheUserLists: function(record){
		//When we consume records if they have the flag
		//resolveUser set to true we will loop through looking for UserLists
		//doing a pre resolve of those users.  If the flag is not set we still look for UserLists
		//so we can prefil the cache with any user summaries that come back in say friends lists.
		//This replicates the old behavior that was in UserList converter but in a more sane
		//place.

		if(record.resolveUsers){
			//So when resolving a user we resolve any referenced users
			//upfront.  That seems like a lot of upfront work we really don't
			//need to do.  No wonder failing to pre cache users from friendslists
			//leads to a gajillion resolve user requests on load.  Additionally
			//this resolves the user even if it comes as an object from the server
			//in that case maybe we should just call precacheUser to update the cache.  Seems
			//like we are throwing away a bunch of stuff here.
			//
			//TODO Ideally this goes away all together. We shoudl defer user resolution until
			//we need to display the user. Unfortunately there are still so many views taht get created up
			//front so we actually don't defer this very much.

			//asynchronously resolve users this record references
			record.fields.each(function(f){
				if(f.type === Ext.data.Types.USERLIST){
					this.preresolveUserList(record, f.name);
				}
			}, this);
		}
		else{
			//If we were given a model from the server go ahead and cache it
			//so we don't have to resolve it again.  Failure to do this leads to hundreds
			//of user resolutions (in accounts with lots of data) up front (see todo above)
			record.fields.each(function(f){
				if(f.type === Ext.data.Types.USERLIST){
					this.fillCacheWithUserList(record, f.name);
				}
			}, this);
		}
	},

	//Read records and do any prefilling/prefetching of user objects
	readRecords: function(data) {
		var result = this.callParent([data]),
			records = result.records;
		try{
			Ext.Array.each(records || [], function(record){
				this.precacheUserLists(record);
			}, this);

			return result;
		}
		catch (e) {
			console.error(e.stack||e, records);
			return Ext.data.ResultSet.create({
				total  : 0,
				count  : 0,
				records: [],
				success: false
			});
		}
	}
 });
