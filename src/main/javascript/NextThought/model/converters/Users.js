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
							if(record.resolveUsers){
	//							//asynchronously resolve this user so its cached and ready
								UserRepository.getUser(o);
							}
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
		sortType: function(v) {
			console.warn('sort by UserList:',arguments);
			return '';
		}
	},


	AVATAR_URL: {
		type: 'AvatarURL',
		sortType: Ext.data.SortTypes.asUCString,
		convert: function convert(v,record){
			var re = convert.re = (convert.re || /https/i);
			function c(v,i,a){
				v = v.replace('www.gravatar.com','secure.gravatar.com');
				if(a){a[i] = v;}
				return v;
			}
	//		if(re.test(location.protocol)){
				if(!Ext.isArray(v)){ v = c(v,0,null); }
				else { Ext.each(v,c); }
				return v;
	//		}
	//		return v;
		}
	}
});
