Ext.define('NextThought.preference.Manager',{

	constructor: function(config){
		this.baseUrl = config.href;
		this.root = Ext.create('NextThought.model.preference.Root',{href: this.baseUrl});
	},

	/*
	*	Loads the preference from the server or returns the value for it we alread have
	* @param key {String} a / delimited list of which preference to get ex ChatPresence/Available
	* @param cb {Function} what to do after we get the value, takes the value as a parameter
	* @param scope {Object} the scope to use when calling the callback
	*/
	getPreference: function(key, cb, scope){
		debugger;
		var value = this.getSubPreference(key);

		if(value && value.isFuture){
			//we haven't loaded it yet
			this.loadSubPreference(key, cb, scope);
		}else{
			//either we have loaded it or it wasn't a valid preference
			Ext.callback(cb, scope, [value]);
		}
	},

	getSubPreference: function(key){
		var i, keys = key.split('/'),
			value = this.root;

		for(i = 0; i < keys.length; i++){
			//if we haven't loaded the value return it
			if(value.isFuture){ return value; }

			if(value.get(keys[i])){
				value = value.get(keys[i]);
			}else{
				console.log('Invalid preference');
				return false;
			}
		}

		return value;
	},

	loadSubPreference: function(key, cb, scope){
		var request,
			url = this.baseUrl + '/' + key;

		request = {
			url: url,
			method: 'GET',
			scope: this,
			callback: function(q, success, response){
				var model, json = response.responseText;

				json = Ext.JSON.decode(json);

				if(!success){
					//something went wrong
					Ext.callback(cb, scope, [false]);
				}

				model = this.setSubPreference(json);
				debugger;
			}
		};

		Ext.Ajax.request(request);
	},

	setSubPreference: function(json){
		var me = this, i, result, name = 'NextThought.model',
			cls = json.Class,
			path = cls.split('_'),
			value = this.root, nextValue;

		for(i = 0; i < path.length; i++){
			if(i+1 < path.length){
					if(value.get(path[i])){
						nextValue = value.get(path[i]);
						
						//if a parent preference isn't load yet, init it to an empty one
						if(nextValue.isFuture){
							result = Ext.create(name + '.' + path[i]);
							value.set(path[i],result);
							value = result;
						}else{
							value = nextValue;
						}
					}

					name = name + '.' + path[i].toLowerCase();
			}else{
				name = name + '.' + path[i];

				result = Ext.create(name,json);
				value.set(path[i], result);

				value = value.get(path[i]);
				//set any sub preferences while we have them
				Ext.each(value.subPreferences, function(name){
					if(json[name]){
						me.setSubPreference(json[name]);
					}
				});

				return result;
			}
		}
	}
});