const Ext = require('extjs');
const B64 = require('../util/Base64');

function prefix (v) {
	if (!prefix.val) {
		prefix.val = B64.encode($AppConfig.username).concat('-');
	}
	return prefix.val.concat(v);
}


function AbstractStorage (storage, noPrefix) {
	this.currentVersion = 2;
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
}

Object.assign(AbstractStorage.prototype, {
	prefix (v) {return v;},


	setItem (key, value) {
		return this.set(key, value);
	},


	getItem (key) {
		return this.get(key);
	},


	set (key, value) {
		let old = this.get(key);
		let encKey = this.prefix(key);
		let encVal = Ext.encode(value);

		try {
			this.backingStore.setItem(encKey, encVal);
		}
		catch (e) {
			this.removeAll();
			try {
				this.backingStore.setItem(encKey, encVal);
			} catch (er) {
				console.error('Trouble setting a value in storage: %o', er, key, value);
			}
		}
		return old;
	},


	get (key) {
		//Migrate:
		let old = this.backingStore.getItem(key);
		if (old && this.prefix(key) !== key) {
			this.backingStore.setItem(this.prefix(key), old);
			this.backingStore.removeItem(key);
		}
		//End Migrate
		try {
			return JSON.parse(this.backingStore.getItem(this.prefix(key)));
		} catch (e) {
			return null;
		}
	},


	getProperty (key, property, defaultValue) {
		let o = this.get(key) || {};

		property = property.split('/');

		//comment this loop out if property-paths are causing problems.
		while (o && property.length > 1) {
			o = o[property.shift()];
		}

		return (o && o[property[0]]) || defaultValue;
	},


	updateProperty (key, property, value) {
		let o = this.get(key) || {};
		let v = o;

		try {
			property = property.split('/');

			//comment this loop out if property-paths are causing problems.
			while (o && property.length > 1) {
				let p = property.shift();
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


	removeProperty (key, property) {
		return this.updateProperty(key, property, undefined);
	},


	remove (key) {
		this.backingStore.removeItem(key);
	},


	removeAll () {
		this.backingStore.clear();
	}

});


const fallback = {
	data: {},
	removeItem (k) {delete this.data[k];},
	setItem (k, v) {this.data[k] = v; console.warn('[WARNING] Using fake storage to workaround missing broswer support for Storage API');},
	getItem (k) {return this.data[k];},
	clear () {this.data = {};}
};

function isStorageSupported (storage) {
	let testKey = 'test';
	try {
		storage.setItem(testKey, '1');
		storage.removeItem(testKey);
		return true;
	} catch (error) {
		return false;
	}
}

let ss, ls;
try {
	ss = global.sessionStorage;
	ls = global.localStorage;
	if (!isStorageSupported(ss)) { ss = null; }
	if (!isStorageSupported(ls)) { ls = ss; }
} catch (e) {
	console.error('Could not acces browser storage %o', e.stack || e.message || e);
}


const TemporaryStorage = new AbstractStorage(ss || fallback, true);
const PersistentStorage = new AbstractStorage(ls || fallback);

Object.assign(exports, {
	TemporaryStorage,
	PersistentStorage,

	getLocalStorage () {
		return PersistentStorage;
	},


	getSessionStorage () {
		return TemporaryStorage;
	}
});
