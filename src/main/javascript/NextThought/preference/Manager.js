Ext.define('NextThought.preference.Manager', {

	requires: [
		'NextThought.proxy.Preference',
		'NextThought.model.preference.*'
	],

	constructor: function(config) {
		this.baseUrl = config.href;
		this.root = NextThought.model.preference.Root.create({Class: 'preference', href: this.baseUrl});
	},

	/*
	*	Loads the preference from the server or returns the value for it we alread have
	* @param key {String} a / delimited list of which preference to get ex ChatPresence/Available
	* @param cb {Function} what to do after we get the value, takes the value as a parameter
	* @param scope {Object} the scope to use when calling the callback
	*/
	getPreference: function(key, cb, scope) {
		var value = this.getSubPreference(key);

		if (value && (value.isFuture || this.hasFutures(value))) {
			//we haven't loaded it yet or it has sub preferences that haven't been loaded
			this.loadSubPreference(key, cb, scope);
		}else {
			//either we have loaded it or it wasn't a valid preference
			Ext.callback(cb, scope, [value]);
		}
	},

	getSubPreference: function(key) {
		var i, keys = key.split('/'),
			value = this.root;

		for (i = 0; i < keys.length; i++) {
			//if we haven't loaded the value return it
			if (value.isFuture) { return value; }

			if (value.get(keys[i])) {
				value = value.get(keys[i]);
			}else {
				console.log('Invalid preference');
				return false;
			}
		}

		return value;
	},

	hasFutures: function(value) {
		var i, cur, hasFuture = false,
			subs = value.subPreferences;

		if (Ext.isEmpty(subs)) { return false; }

		for (i = 0; i < subs.length; i++) {
			cur = value.get(subs[i]);

			if (cur && cur.isFuture) {
				return true;
			}else if (cur) {
				hasFuture = hasFuture || this.hasFutures(cur);
			}
		}

		return hasFuture;
	},

	urlToClassName: function(url) {
		var i, className = 'NextThought.model.preference',
			urls = url.split('/'),
			startingIndex = Ext.Array.indexOf(urls, '++preferences++') + 1;

		for (i = startingIndex; i < urls.length; i++) {
			if (i + 1 > length) {
				className += '.' + urls[i];
			}else {
				className += '.' + urls[i].toLowerCase();
			}
		}

		return className;
	},

	classNameToModel: function(className) {
		var i, model = NextThought,
			names = className.split('.');

		for (i = 1; i < names.length; i++) {
			model = model[names[i]];
		}

		return model;
	},

	loadSubPreference: function(key, cb, scope) {
		var request,
			url = this.baseUrl + '/' + key;

		NextThought.model.preference.Base.load(url, {
			scope: this,
			failure: function(rec, op) {
				Ext.callback(cb, scope, [false]);
			},
			success: function(rec, op) {
				var model, json = op.response.responseText;

				json = Ext.JSON.decode(json);
				//mostly because we get an array back with the testing sim
				json = (Ext.isArray(json)) ? json[0] : json;
				model = this.setSubPreference(json);
				Ext.callback(cb, scope, [model]);
			}
		});
	},

	setSubPreference: function(json) {
		var me = this, i, result, name = 'NextThought.model',
			cls = json.Class,
			path = cls.split('_'),
			value = this.root, nextValue;

		function sp(name) {
			if (json[name]) {
				me.setSubPreference(json[name]);
			}
		}

		for (i = 0; i < path.length; i++) {
			if (i + 1 < path.length) {
					if (value.get(path[i])) {
						nextValue = value.get(path[i]);

						//if a parent preference isn't load yet, init it to an empty one
						if (nextValue.isFuture) {
							result = Ext.create(name + '.' + path[i]);
							value.set(path[i], result);
							value = result;
						}else {
							value = nextValue;
						}
					}

					name = name + '.' + path[i].toLowerCase();
			}else {
				name = name + '.' + path[i];

				result = Ext.create(name, json);
				value.set(path[i], result);

				value = value.get(path[i]);
				//set any sub preferences while we have them
				Ext.each(value.subPreferences, sp);

				return result;
			}
		}
	}
});
