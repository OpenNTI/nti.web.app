

Ext.define('NextThought.proxy.UserDataLoader',{
	alternateClassName: 'UserDataLoader',
	statics:{
		
		
		getPageItems: function(pageId, callbacks){
			var h = _AppConfig.server.host,
				d = _AppConfig.server.data,
				u = _AppConfig.server.username;
				url = h+d+'users/'+u+'/Pages/'+pageId+'/UserGeneratedData';
				
			this._req = Ext.Ajax.request({
				url: url,
				scope: this,
				failure: callbacks && callbacks.failure
					? callbacks.failure 
					: function() {
						if(NextThought.isDebug)
							console.log('Could not load data',arguments)
					},
				success: function(r,o) {
					var json = Ext.decode(r.responseText);
					if(!json || !json.Items){
						if(callbacks && callbacks.failure){
							callbacks.failure('bad dataz');
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
						callbacks.success(bins);
					}
					else if(NextThought.isDebug){
						console.log('WARNING: I haz dataz 4 u, but u no giv meh callbax');
					}
				}
			});
		},
		
		
		_binItems: function(items){
			var bins = {};
			Ext.each(items, function(o){
				if(!bins[o.Class]){
					bins[o.Class] = [];
				}
				bins[o.Class].push(o);
			}, 
			this);
			
			return bins;
		}
		
	}
	
});
