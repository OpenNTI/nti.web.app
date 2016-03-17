export default Ext.define('NextThought.cache.AbstractStorage', function() {

	var prefix = function prefix(v) {
		if (!prefix.val) {
			prefix.val = B64.encode($AppConfig.username).concat('-');
		}
		return prefix.val.concat(v);
	};

	return {

		statics: {
			getLocalStorage: function() {
				return PersistentStorage;
			},


			getSessionStorage: function() {
				return TemporaryStorage;
			}
		},

		currentVersion: 2,

		constructor: function(storage, noPrefix) {
			if (!storage ||
				!Ext.isFunction(storage.removeItem) ||
				!Ext.isFunction(storage.setItem) ||
				!Ext.isFunction(storage.getItem) ||
				!Ext.isFunction(storage.clear)) {
				Ext.Error.raise('Given storage object does not implement Storage api');
			}

			this.backingStore = storage;

			if (this.get('version') !== this.currentVersion) {
				this.removeAll();
			}

			this.set('version', this.currentVersion);

			if (noPrefix !== true) {
				this.prefix = prefix;
			}
		},


		prefix: function(v) {return v;},


		setItem: function(key, value) {
			return this.set(key, value);
		},


		getItem: function(key) {
			return this.get(key);
		},


		set: function(key, value) {
			var old = this.get(key),
				encKey = this.prefix(key),
				encVal = Ext.encode(value);
			try {
				this.backingStore.setItem(encKey, encVal);
			} catch (e) {
				this.removeAll();
				try {
					this.backingStore.setItem(encKey, encVal);
				} catch (er) {
					console.error('Trouble setting a value in storage: %o', er, key, value);
				}
			}
			return old;
		},


		get: function(key) {
			//Migrate:
			var old = this.backingStore.getItem(key);
			if (old && this.prefix(key) !== key) {
				this.backingStore.setItem(this.prefix(key), old);
				this.backingStore.removeItem(key);
			}
			//End Migrate
			return Ext.decode(this.backingStore.getItem(this.prefix(key)), true);
		},


		getProperty: function(key, property, defaultValue) {
			var o = this.get(key) || {};

			property = property.split('/');

			//comment this loop out if property-paths are causing problems.
			while (o && property.length > 1) {
				o = o[property.shift()];
			}

			return (o && o[property[0]]) || defaultValue;
		},


		updateProperty: function(key, property, value) {
			var o = this.get(key) || {}, v = o, p;

			try {
				property = property.split('/');

				//comment this loop out if property-paths are causing problems.
				while (o && property.length > 1) {
					p = property.shift();
					o = (o[p] = (o[p] || {}));//ensure the path exits
				}

				o[property[0]] = value;
				if (value === undefined) {
					delete o[property[0]];
				}

				return this.set(key, v);
			} catch (e) {
				console.warn('Storage property did not get set.', arguments, e.stack || e.message || e);
			}
		},


		removeProperty: function(key, property) {
			return this.updateProperty(key, property, undefined);
		},


		remove: function(key) {
			this.backingStore.removeItem(key);
		},


		removeAll: function() {
			this.backingStore.clear();
		}
	};

},function() {
	var w = window,
		Cls = this,
		ss,
		ls,
		fallback = {
			data: {},
			removeItem: function(k) {delete this.data[k];},
			setItem: function(k, v) {this.data[k] = v; console.warn('[WARNING] Using fake storage to workaround missing broswer support for Storage API');},
			getItem: function(k) {return this.data[k];},
			clear: function() {this.data = {};}
		};

	function isStorageSupported(storage) {
		var testKey = 'test';
		try {
			storage.setItem(testKey, '1');
			storage.removeItem(testKey);
			return true;
		} catch (error) {
			return false;
		}
	}

	try {
		ss = w.sessionStorage;
		ls = w.localStorage;
		if (!isStorageSupported(ss)) { ss = null; }
		if (!isStorageSupported(ls)) { ls = ss; }
	} catch (e) {
		console.error('Could not acces browser storage %o', e.stack || e.message || e);
	}

	//TODO: figure out how to handle this since it puts two classes on the window...
	window.TemporaryStorage = new Cls(ss || fallback, true);
	window.PersistentStorage = new Cls(ls || fallback);
});
