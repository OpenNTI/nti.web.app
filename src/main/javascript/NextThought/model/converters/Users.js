Ext.define('NextThought.model.converters.Users', {
	override: 'Ext.data.Types',
	USERLIST: {
		type: 'UserList',
		convert: function(v,record) {
			var a = arguments,
				u = [];
			try {
				if(v) {
					Ext.each(v, function(o){
						var p =
							typeof(o)==='string' ?
								o : o.get ?
									o.get('Username') : o.Username ?
										o.Username : null;
						if(!p) {
							console.warn("WARNING: Could not handle Object: ", o, a);
						}
						else  {
							u.push(p);

							/*
							//On top of all the commments below, this is a terrible place to do this.
							//The intent for this logic is for it to happen when loading from the server
							//however this will be called anytime 'set' gets called on a field of this type.
							if(record.resolveUsers){
								//So when resolving a user we resolve any referenced users
								//upfront.  That seems like a lot of upfront work we really don't
								//need to do.  No wonder failing to pre cache users from friendslists
								//leads to a gajillion resolve user requests on load.  Additionally
								//this resolves the user even if it comes as an object from the server
								//in that case should we just call updateUser to update the cache.  Seems
								//like we are throwing away a bunch of stuff here.
								//
								//TODO I think we should try and make this go away, defering user resolution until
								//we need to display the user. CMU

								//asynchronously resolve this user so its cached and ready
								console.log('Resolving user '+p+' when parsing', record, o);
								UserRepository.getUser(o);
							}
							else if(o.isModel || Ext.isObject(o)){
								//If we were given a model from the server go ahead and cache it
								//so we don't have to resolve it again.
								console.log('Updating user '+p+' when parsing', record, o);
								UserRepository.updateUser(o);
							}
							*/
						}
					});
				}
			}
			catch (e) {
				console.error('USERLIST: Parsing Error: ',e.message, e.stack);
				u = v;
			}

			return u;
		},
		sortType: Ext.data.SortTypes.none
	},


	AVATARURL: {
		type: 'AvatarURL',
		sortType: Ext.data.SortTypes.asUCString,
		convert: function convert(v){
			var re = convert.re = (convert.re || /https/i);
			function c(v,i,a){
				v = v.replace('www.gravatar.com','secure.gravatar.com').replace('http:','https:');
				if(a){a[i] = v;}
				return v;
			}
			if(re.test(location.protocol)){
				if(!Ext.isArray(v)){ v = c(v,0,null); }
				else { Ext.each(v,c); }
				return v;
			}
			return v;
		}
	},


	AVATARURLLIST: {
		type: 'AvatarURLList',
		sortType: Ext.data.SortTypes.asUCString,
		convert: function convert(v){
			Ext.each(v,function(o,i,a){
				a[i] = Ext.data.Types.AVATARURL.convert(o);
			});
			return v;
		}
	}
});
