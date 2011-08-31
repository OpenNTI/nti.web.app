

Ext.define('NextThought.proxy.UserDataLoader',{
	alternateClassName: 'UserDataLoader',
	requires: [
			'NextThought.model.Community',
			'NextThought.model.Change',
			'NextThought.model.Note',
			'NextThought.model.Highlight',
			'NextThought.model.FriendsList',
			'NextThought.model.User',
    		'NextThought.model.UnresolvedFriend',
            'NextThought.model.Hit'
    		],
	statics:{
		
		search: function(containerId, searchString, callback) {
            var h = _AppConfig.server.host,
                c = containerId ? containerId : 'prealgebra',
				url = h+'/'+c+'/Search/'+searchString;
            Ext.Ajax.request({
				url: url,
				scope: this,
				async: !!callback,
				callback: function(o,success,r){

					if(!success){
						if(callback)callback();
                        console.log('ERROR: searching');
						return;
					}

					var json = Ext.decode(r.responseText),
						bins = this._binAndParseItems(json.Items);

					if(!callback)return;
						callback(bins.Hit);
				}
			});
        },

		resolveUser: function(userId, callback, force){
			this.resolvedUsers = this.resolvedUsers || {};
			
			var h = _AppConfig.server.host,
				d = _AppConfig.server.data,
				u = _AppConfig.server.username,
				url = h+d+'UserSearch/'+userId,
				cache = this.resolvedUsers;

            if(!userId || Ext.String.trim(userId)==''){
                Ext.Error.raise('Bad user id');
            }
				
			if(cache[userId] && !force){
				if(callback)
					callback(cache[userId]);
			}
			else
			Ext.Ajax.request({
				url: url,
				scope: this,
				async: !!callback,
				callback: function(o,success,r){
					
					if(!success){
						if(callback)callback();
						return;
					}
					
					var json = Ext.decode(r.responseText),
						bins = this._binAndParseItems(json.Items);
						
					if(bins.User.length>1){
						console.log('WARNING: many matching users: "', userId, '"', bins.User);
                    }

					cache[userId] = bins.User[0];

					if(!callback)return;
						callback(cache[userId]);
				}
			});

			return cache[userId];
		},
		
		
		userSearch: function(userQuery, callbacks){
			var h = _AppConfig.server.host,
				d = _AppConfig.server.data,
				url = h+d+'UserSearch/'+userQuery;
			
			if(this._userSearch){
				Ext.Ajax.abort(this._userSearch);
			}
			
			this._userSearch = Ext.Ajax.request({
				url: url,
				scope: this,
				callback: function(){
					this._userSearch = null;
				},
				failure: function(){
					if(callbacks && callbacks.failure) {
						callbacks.failure.apply(callbacks.scope || this, arguments);
					} 
					else if(NextThought.isDebug)
						console.log('Could not load user search',arguments);
				},
				success: function(r){
					var json = Ext.decode(r.responseText),
						bins;
						
					if(!json){
						if(callbacks && callbacks.failure){
							callbacks.failure.call(callbacks.scope || this, 'bad dataz');
						} 
						else if(NextThought.isDebug){
							console.log('Response sucked:', r, 'bad json:', json);
						}
						return;
					}
					
					bins = this._binAndParseItems(json.Items);
					
					if(callbacks && callbacks.success){
						callbacks.success.call(callbacks.scope || this, bins.User);
					}
					else if(NextThought.isDebug){
						console.log('WARNING: I haz dataz 4 u, but u no giv meh callbax');
					}
				}
			});
		},
		
		
		
		getUserSearchStore: function(){
			
			if(!this._userSearchStore) {
				this._userSearchStore = Ext.create('Ext.data.Store', {
			        model: 'NextThought.model.User',
                    proxy: {
    	                type: 'usersearch',
    	                model: 'NextThought.model.User'
                    }
			    });
		   	}
			
			return this._userSearchStore;
			
		},
		getFriendsListsStore: function(){
			
			if(!this._friendsListsStore) {
				this._friendsListsStore = Ext.create('Ext.data.Store', {
				    model: 'NextThought.model.FriendsList',
				    autoLoad: true
				});
				
				this._friendsListsStore.filter([{
		            fn: function(record) {
		                return ! /^everyone$/i.test(record.get('Username'));
		            }
		        }]);
		   	}
			
			return this._friendsListsStore;
			
		},
		
		
		
		getFriends: function(callbacks) {
			this.getGroups({success: success, faulure: failure});
			
			function success(bins) {
				var set = {}, key;
				
				Ext.each(bins, function(o){
					Ext.each(o.get('friends'), function(f){
						var u = f.get('Username'),
							c = set[u];
						if(c && /unresolved/i.test(c)) return;
						set[u] = f;
					},
					this);
				},
				this);
				
				if(callbacks && callbacks.success){
						callbacks.success.call(callbacks.scope || this, this._toArray(set));
					}
					else if(NextThought.isDebug){
						console.log('WARNING: I haz friends dataz 4 u, but u no giv meh callbax');
					}
			}
			
			function failure() {
				if(callbacks && callbacks.failure) 
					callbacks.failure.call(callbacks.scope || this);
				else if (NextThought.isDebug)
					console.log('Could not load groups',arguments);
			}
		},
		
		
		
		
		
		getGroups: function(callbacks) {
			var h = _AppConfig.server.host,
				d = _AppConfig.server.data,
				u = _AppConfig.server.username;
				url = h+d+'users/'+u+'/FriendsLists/';

			this._groupsRequest = Ext.Ajax.request({
				url: url,
				scope: this,
				callback: function() {
					this._groupsRequest = null;
				},
				failure: function() {
					if(callbacks && callbacks.failure) {
						callbacks.failure.apply(callbacks.scope || this, arguments);
					} 
					else if(NextThought.isDebug)
						console.log('Could not load groups',arguments);
				},
				success: function(r, o) {
					var json = Ext.decode(r.responseText);
					// if(!json || !json.Items){
					if(!json){
						if(callbacks && callbacks.failure){
							callbacks.failure.call(callbacks.scope || this, 'bad group dataz');
						} 
						else if(NextThought.isDebug){
							console.log('Response sucked:', r, 'bad json:', json);
						}
						return;
					}

					var bins = this._binAndParseItems(json);
					if (!bins || !bins.FriendsList) {
						if(NextThought.isDebug){
							console.log('Response sucked:', r, 'bad json:', json);
						}
						return;
					}
					
					if(callbacks && callbacks.success){
						callbacks.success.call(callbacks.scope || this, bins.FriendsList);
					}
					else if(NextThought.isDebug){
						console.log('WARNING: I haz groupz dataz 4 u, but u no giv meh callbax');
					}
					
				}
			});
			
		},

        /*
        Returns the date in GMT formatted as 'Tue, 15 Nov 1994 08:12:31 GMT'
        use this in the request:  headers: {'If-Modified-Since': this.getUTC(new Date())},
         */
        getUTC: function(date) {
            var offset = Ext.Date.getGMTOffset(date, true),
                  cmps = offset.split(':'),
                  hour = parseInt(cmps[0],10),
                   min =  parseInt(cmps[1],10),
                absSum = (Math.abs(hour*60) + min)*60000,
                  mult = (hour < 0) ? 1 : -1,
               gmtDate = +date + (mult * absSum);
            return Ext.Date.format(new Date(gmtDate), 'D, d M Y H:i:s \\G\\M\\T');
        },

        getRecursiveStreamSince: function(containerId, sinceDate, callbacks) {
			if (!containerId) containerId = 'aops-prealgebra-129';
			return this.getStream(containerId, sinceDate, callbacks, "RecursiveStream");
		},

		getRecursiveStream: function(containerId, callbacks) {
			if (!containerId) containerId = 'aops-prealgebra-129';
			return this.getStream(containerId, null, callbacks, "RecursiveStream");
		},
				
		getStream: function(containerId, sinceDate, callbacks, stream) {
			var h = _AppConfig.server.host,
				d = _AppConfig.server.data,
				u = _AppConfig.server.username,
                headers = (sinceDate) ? {'If-Modified-Since': this.getUTC(sinceDate)} : {};
				url = h+d+'users/'+u+'/Pages/' + containerId + '/' + (stream? stream : "Stream") + '/';
				
			this._streamRequest = Ext.Ajax.request({
				url: url,
				scope: this,
                headers: headers,
				callback: function() {
					this._streamRequest = null;
				},
				failure: function() {
					if(callbacks && callbacks.failure) {
						callbacks.failure.apply(callbacks.scope || this, arguments);
					} 
					else if(NextThought.isDebug)
						console.log('Could not load stream',arguments);
				},
				success: function(r, o) {

					var json = (!r.responseText) ? {} : Ext.decode(r.responseText);
					if(!json || !json.Items){
						if(callbacks && callbacks.failure){
							callbacks.failure.call(callbacks.scope || this, 'bad group dataz');
						} 
						else if(NextThought.isDebug && !sinceDate){
							console.log('Response sucked:', r, 'bad json:', json);
						}
						return;
					}
					var cReader = this._getReaderForModel('Change');
					Ext.each(json.Items, function(i, x){
						var reader = this._getReaderForModel(i.Item.Class);
						i.Item = reader.read(i.Item).records[0];
						
						json.Items[x] = cReader.read(i).records[0];
					},
					this);
					
					if(callbacks && callbacks.success){
						callbacks.success.call(callbacks.scope || this, json.Items);
					}
					else if(NextThought.isDebug){
						console.log('WARNING: I haz change dataz 4 u, but u no giv meh callbax');
					}
				}
			});
			
		},
		
		_getReaderForModel: function(modelClass) {
			this._readers = this._readers || [];

            if (!NextThought.model.hasOwnProperty(modelClass)){
                console.log('no model for NextThought.model.' + modelClass);
                return;
            }

            if (!this._readers[modelClass]) {
				this._readers[modelClass] = Ext.create('NextThought.proxy.reader.Json',{model: 'NextThought.model.'+modelClass, proxy: 'nti'});
			}
			
			return this._readers[modelClass];
			
		},

        getPageItems: function(pageId, callbacks){
            return this.getItems(callbacks, '/Pages/'+pageId+'/UserGeneratedData');
        },

		getItems: function(callbacks, postFix){
			var h = _AppConfig.server.host,
				d = _AppConfig.server.data,
				u = _AppConfig.server.username;
				url = h+d+'users/'+u+(postFix ? postFix : "") ;
				
			this._pageItemsRequest = Ext.Ajax.request({
				url: url,
				scope: this,
				callback: function() {
					this._pageItemsRequest = null;
				},
				failure: function() {
					if(callbacks && callbacks.failure) {
						callbacks.failure.apply(callbacks.scope || this, arguments);
					} 
					else if(NextThought.isDebug)
						console.log('Could not load items',arguments);
				},
				success: function(r,o) {
					var json = Ext.decode(r.responseText),
                        bins = this._iterateAndCollect(json);

					if(callbacks && callbacks.success){
						callbacks.success.call(callbacks.scope || this, bins);
					}
					else if(NextThought.isDebug){
						console.log('WARNING: I haz dataz 4 u, but u no giv meh callbax');
					}
				}
			});
		},
		
		_iterateAndCollect: function(json) {
            var bins = {},
                me = this;

            if (Ext.isArray(json)) {
				Ext.each(json, function(o, key){
					collect(o, key);
				},
				me);
			}
			else {
				for (var key in json) {
					if (!json.hasOwnProperty(key)) continue;
					collect(json[key], key);
				}
			}

            me._binAndParseItems([], bins);
			return bins;

            function collect(o, key) {
                if (/FriendsLists/i.test(key) || typeof(o) != 'object') return;
                me._binItems(o, bins)
			}
        },

		_toArray: function(s){
			var r=[],k;
			for(k in s){if(!s.hasOwnProperty(k))continue;r.push(s[k]);}
			return r;
		},
		
		
		_binItems: function(items, existingBins){
			var bins = existingBins || {};
			if (Ext.isArray(items)) {
				Ext.each(items, function(o){
					addToBin(o);
				}, 
				this);
			}			
			else {
				for (var key in items) {
					if (!items.hasOwnProperty(key)) continue;
					addToBin(items[key]);
				}
			}
			return bins;
			
			
			function addToBin(o) {
			    if(!o.Class) return;
                if(!bins[o.Class]){
					bins[o.Class] = [];
				}
				bins[o.Class].push(o);
			}
		},

		_binAndParseItems: function(items, existingBins){
			var bins = this._binItems(items, existingBins), key;
			for(key in bins){
                var reader = this._getReaderForModel(key);
				if(!bins.hasOwnProperty(key)) continue;
                if(!reader) {
                    console.log('No reader for key', key, 'objects: ', bins[key]);
                    continue;
                }

				bins[key] = reader.read(bins[key]).records;
			}
			return bins;
		},
		
		
		flattenBins: function(bins){
			var result = [], key;
			for(key in bins){
				if(!bins.hasOwnProperty(key)) continue;
				result = result.concat(bins[key]);
			}
			return result;
		},
		
		
		parseItems: function(items){
			return this.flattenBins(this._binAndParseItems(items));
		}
	}
	
	
	
});
