

Ext.define('NextThought.proxy.UserDataLoader',{
	alternateClassName: 'UserDataLoader',
	requires: [
			'NextThought.model.Note',
			'NextThought.model.Highlight',
			'NextThought.model.FriendsList',
			'NextThought.model.User',
    		'NextThought.model.UnresolvedFriend'
    		],
	statics:{
		
		
		
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
				
			// console.log("inside getGroups", url);	
			// debugger;	
				
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
		
				
		getRecursiveStream: function(containerId, callbacks) {
			if (!containerId) containerId = 'aops-prealgebra-129';
			var h = _AppConfig.server.host,
				d = _AppConfig.server.data,
				u = _AppConfig.server.username;
				url = h+d+'users/'+u+'/Pages/' + containerId + "/RecursiveStream/";
				
			console.log("inside getRecursivyStream", url);	
				
			this._streamRequest = Ext.Ajax.request({
				url: url,
				scope: this,
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
					var json = Ext.decode(r.responseText);
					if(!json || !json.Items){
						if(callbacks && callbacks.failure){
							callbacks.failure.call(callbacks.scope || this, 'bad group dataz');
						} 
						else if(NextThought.isDebug){
							console.log('Response sucked:', r, 'bad json:', json);
						}
						return;
					}
					
					Ext.each(json.Items, function(i, x){
						var reader = this._getReaderForModel('NextThought.model.'+i.Item.Class);
						json.Items[x] = reader.read(i.Item).records[0];						
						console.log('recursive stream items', json.Items[x], i.Item);
					},
					this);
				}
			});
			
		},
		
		_getReaderForModel: function(modelClass) {
			this._readers = this._readers || [];
			if (!this._readers[modelClass]) {
				this._readers[modelClass] = Ext.create('NextThought.reader.Json',{model: modelClass, proxy: 'nti'});
			}
			
			return this._readers[modelClass];
			
		},
		getPageItems: function(pageId, callbacks){
			var h = _AppConfig.server.host,
				d = _AppConfig.server.data,
				u = _AppConfig.server.username;
				url = h+d+'users/'+u+'/Pages/'+pageId+'/UserGeneratedData';
				
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
					var json = Ext.decode(r.responseText);
					if(!json || !json.Items){
						if(callbacks && callbacks.failure){
							callbacks.failure.call(callbacks.scope || this, 'bad dataz');
						} 
						else if(NextThought.isDebug){
							console.log('Response sucked:', r, 'bad json:', json);
						}
						return;
					}

					var bins = this._binAndParseItems(json.Items);
					
					if(callbacks && callbacks.success){
						callbacks.success.call(callbacks.scope || this, bins);
					}
					else if(NextThought.isDebug){
						console.log('WARNING: I haz dataz 4 u, but u no giv meh callbax');
					}
				}
			});
		},
		
		
		_toArray: function(s){
			var r=[],k;
			for(k in s){if(!s.hasOwnProperty(k))continue;r.push(s[k]);}
			return r;
		},
		
		
		_binItems: function(items){
			var bins = {};
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

		_binAndParseItems: function(items){
			var bins = this._binItems(items), key;
			for(key in bins){
				if(!bins.hasOwnProperty(key)) continue;
				bins[key] = this._getReaderForModel('NextThought.model.'+key).read(bins[key]).records;
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
