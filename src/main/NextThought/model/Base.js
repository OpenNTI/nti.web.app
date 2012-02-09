Ext.data.Types.LINKS = {
	type: 'links',
	sortType: function(){ return ''; },

	convert: function(v){
		return {
			links: v,
			asJSON: function(){return v;},
			getRelHref: function(rel){
				var i, c = this.links,len = c.length;
				if(typeof(c) === 'object'){
					for(i=len-1; i>=0; i--){
						if(c[i].rel === rel) {
							return c[i].href;
						}
					}
				}
				else {
					console.warn('bad Links value: "', c, '" it is a', typeof(c), 'instead of an array');
				}

				return null;
			},
			getLinksForRel: function(rel) {
				var i, c = this.links,len = c.length, results = [];
				if(typeof(c) === 'object'){

					for(i=len-1; i>=0; i--){
						if(c[i].rel === rel) {
							results.push(c[i]);
						}
					}
				}
				else {
					console.warn('bad Links value: "', c, '" it is a', typeof(c), 'instead of an array');
				}
				return results;
			}
		};
	}
};


Ext.define('NextThought.model.Base', {
	extend: 'Ext.data.Model',
	requires: [
		'NextThought.util.ParseUtils',
		'NextThought.proxy.Rest'
	],
	idProperty: 'NTIID',
	mimeType: 'application/vnd.nextthought',
	proxy: { type: 'nti' },
	fields: [
		{ name: 'Class', type: 'string' },
		{ name: 'ContainerId', type: 'string' },
		{ name: 'CreatedTime', type: 'date', dateFormat: 'timestamp', defaultValue: new Date() },
		{ name: 'Creator', type: 'string' },
		{ name: 'ID', type: 'string' },
		{ name: 'Last Modified', type: 'date', dateFormat: 'timestamp', defaultValue: new Date() },
		{ name: 'Links', type: 'links', defaultValue: [] },
		{ name: 'MimeType', type: 'string' },
		{ name: 'NTIID', type: 'string' },
		{ name: 'accepts', type: 'auto', defaultValue: [] },
		{ name: 'href', type: 'string' }
	],


	constructor: function(data,id,raw){
		var c, f = this.fields,
			cName = this.self.getName().split('.').pop(),
			cField = f.getByKey('Class');


		if(!cField.defaultValue) {
			cField.defaultValue = cName;
		}

		if(!(new RegExp(cName,'i')).test(this.mimeType)){
			this.mimeType += '.'+cName.toLowerCase();
		}
		else{
			console.warn('using self declared mimeTime:', this.mimeType);
		}

		f.getByKey('MimeType').defaultValue = this.mimeType;
		console.group("Model",cName,id || data? data[this.idProperty] : 'new?');
		c = this.callParent(arguments);
		console.groupEnd();
		this._enforceMutability();

		return c;
	},


	_enforceMutability: function(){
		if(!this.isModifiable()){
			this.destroy = Ext.emptyFn();
			this.save = Ext.emptyFn();
		}
		else if(this.hasOwnProperty('destroy')){
			this.destroy = this.self.prototype.destroy;
			this.save = this.self.prototype.save;
		}
	},


	getModelName: function() {
		return this.fields.getByKey('Class').defaultValue;
	},


	getLink: function(rel){
		var ref = this.get('Links').getRelHref(rel);
		return ref? _AppConfig.server.host + Globals.ensureSlash(ref, true) : null;
	},


	getLinks: function(rel){
		return this.get('Links').getLinksForRel(rel);
	},


	isModifiable: function(){
		try{
			return this.phantom||this.getLink('edit')!==null;
		}
		catch(e){
			console.warn('No getLink()!');
		}
		return false;
	},


	/**
	 * Calls the href and fills in the values missing.
	 */
	resolve: function(){
		var me = this,
			href = this.get('href');

		if(!href){
			Ext.Error.raise('No HREF!');
		}

		Ext.Ajax.request({
			url: _AppConfig.server.host + href,
			async: false,
			callback: function(req, success, resp){
				if(!success){
					console.error('Resolving model failed');
					return;
				}
				me.set(Ext.JSON.decode(resp.responseText));
				me._enforceMutability();
				me.dirty = false;
				me.modified = {};
			}
		});


	},


	getParent: function(callback, scope) {
		var href = this.getLink('parent');

		if (!callback) {
			Ext.Error.raise('this method requires a callback');
		}

		if(!href){
			//Ext.Error.raise('No parent HREF!');
			callback.call(scope || window, null);
			return;
		}

		Ext.Ajax.request({
			url: href,
			callback: function(req, success, resp){
				if(!success){
					console.error('Resolving parent model failed');
					return;
				}
				callback.call(scope || window, ParseUtils.parseItems(Ext.JSON.decode(resp.responseText))[0]);
			}
		});

	},


	equal: function(b) {
		var a = this,
			r = true;

		a.fields.each(
			function(f){
				var fa = a.get(f.name),
					fb = b.get(f.name);

				if (fa !== fb){

					if(Ext.isArray(fa) && Ext.isArray(fb) && Globals.arrayEquals(fa, fb)){
						return;
					}

					if(Ext.isDate(fa) && Ext.isDate(fb) && (+fa) === (+fb)){
						return;
					}


					r=false;
					return false;
				}
			}
		);

		return r;
	},


	asJSON: function() {
		var data = {},
			me = this;

		this.fields.each(
			function(f){
				var x = me.get(f.name);
				if (Ext.isDate(x)) {
					x = x.getTime()/1000;
				}
				else if (x && x.asJSON) {
					x = x.asJSON();
				}
				else if(x && Ext.isArray(x)) {
					x = x.slice();
					Ext.each(x, function(o, i){
						x[i] = o.asJSON ? o.asJSON() : o;
					});
				}

				data[f.name] = Ext.clone(x);
			}
		);
		return data;
	}
});




/* converters for models which reference other models*/
Ext.data.Types.SINGLEITEM = {
	type: 'singleItem',
	convert: function(v) {
		if (v instanceof Object) {
			return !v ? null : ParseUtils.parseItems([v])[0];
		}
		else {
			console.warn('unexpected value', v);
			return null;
		}
	},
	sortType: function(v) {
		console.warn('sort by Item:',arguments);
		return '';
	}
};

Ext.data.Types.ARRAYITEM = {
	type: 'arrayItem',
	convert: function(v) {
		if (Ext.isArray(v)) {
			return ParseUtils.parseItems(v);
		}
		else {
			console.warn('unexpected value', v);
			return null;
		}
	},
	sortType: function(v) {
		console.warn('sort by Item:',arguments);
		return '';
	}
};

Ext.data.Types.COLLECTIONITEM = {
	type: 'collectionItem',
	convert: function(v) {
		var values = [], key;
		if (v instanceof Object) {
			for(key in v) {
				if (v.hasOwnProperty(key) && v[key] instanceof Object) {
					values.push(v[key]);
				}
			}
			return ParseUtils.parseItems(values) ;
		}
		else {
			console.warn('unexpected value', v);
			return null;
		}
	},
	sortType: function(v) {
		console.warn('sort by Item:',arguments);
		return '';
	}
};

Ext.data.Types.USERLIST = {
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
						if(typeof(o) === 'string' && !UserRepository.has(o)) {
							console.warn("Will resolve UserId because we don't have an object to parse:", record.get('Class'), '@', record.getId(), o);
						}
						//asynchronously resolve this user so its cached and ready
						UserRepository.prefetchUser(o);
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
};
