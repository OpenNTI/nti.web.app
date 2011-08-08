

Ext.define('NextThought.proxy.UserDataLoader',{
	alternateClassName: 'UserDataLoader',
	statics:{
		
		
		
		getFriends: function(callbacks) {
			this.getGroups({success: success, faulure: failure});
			
			function success(bins) {
				var set = {};
				Ext.each(bins, function(o){
					Ext.each(o.friends, function(f){
						set[f.ID] = true;
					},
					this);
				},
				this);
				if(callbacks && callbacks.success){
						callbacks.success.call(callbacks.scope || this, set);
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
				
			console.log("inside getGroups", url);	
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
				
					var bins = this._binItems(json);
					if (!bins || !bins.FriendsList) {
						if(NextThought.isDebug){
							console.log('Response sucked:', r, 'bad json:', json);
						}
						return;
					}
					
					if(callbacks && callbacks.success){
						callbacks.success.call(callbacks.scope || this, bins);
					}
					else if(NextThought.isDebug){
						console.log('WARNING: I haz groupz dataz 4 u, but u no giv meh callbax');
					}
					
				}
			});
			
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

					var bins = this._binItems(json.Items);
					
					for(var key in bins){
						if(!bins.hasOwnProperty(key)) continue;
						var cls = 'NextThought.model.'+key;
						var reader = Ext.create('NextThought.reader.Json',{model: cls, proxy: 'nti'});
						
						bins[key]= reader.read(bins[key]).records;
					}
					
					if(callbacks && callbacks.success){
						callbacks.success.call(callbacks.scope || this, bins);
					}
					else if(NextThought.isDebug){
						console.log('WARNING: I haz dataz 4 u, but u no giv meh callbax');
					}
				}
			});
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
		}
	}
	
});
