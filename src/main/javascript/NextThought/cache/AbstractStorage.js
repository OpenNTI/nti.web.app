Ext.define('NextThought.cache.AbstractStorage',{

	constructor: function(storage){
		if(!storage
		|| !Ext.isFunction(storage.removeItem)
		|| !Ext.isFunction(storage.setItem)
		|| !Ext.isFunction(storage.getItem)
		|| !Ext.isFunction(storage.clear)) {
			Ext.Error.raise('Given storage object does not implement Storage api');
		}

		this.backingStore = storage;
	},


	set: function(key,value){
		var old = this.get(key);
		this.backingStore.setItem(key,Ext.encode(value));
		return old;
	},


	get: function(key){
		return Ext.decode(this.backingStore.getItem(key),true);
	},


	getProperty: function(key, property, defaultValue){
		var o = this.get(key)||{};

		property = property.split('/');

		//comment this loop out if property-paths are causing problems.
		while(o && property.length > 1) {
			o = o[property.shift()];
		}

		return o[property[0]] || defaultValue;
	},


	updateProperty: function(key,property,value){
		var o = this.get(key)||{}, v = o;


		property = property.split('/');

		//comment this loop out if property-paths are causing problems.
		while(o && property.length > 1) {
			o = o[property.shift()];
		}

		o[property[0]] = value;
		if(value === undefined){
			delete o[property[0]];
		}

		return this.set(key,v);
	},


	removeProperty: function(key, property){
		return this.updateProperty(key,property,undefined);
	},


	remove: function(key){
		this.backingStore.removeItem(key);
	},


	removeAll: function(){
		this.backingStore.clear();
	}


},function(){
	var w = window,
		Cls = this,
		fallback = {
			removeItem: Ext.emptyFn,
			setItem: Ext.emptyFn,
			getItem: Ext.emptyFn,
			clear: Ext.emptyFn
		};

	window.TemporaryStorage = new Cls(w.sessionStorage || fallback);
	window.PersistentStorage = new Cls(w.localStorage || fallback);
});
