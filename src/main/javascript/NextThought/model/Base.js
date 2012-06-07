Ext.define('NextThought.model.Base', {
	extend: 'Ext.data.Model',
	requires: [
		'NextThought.model.converters.Links',
		'NextThought.model.converters.Items',
		'NextThought.model.converters.Users',
		'NextThought.util.Parsing',
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
		{ name: 'OID', type: 'string' },
		{ name: 'accepts', type: 'auto', defaultValue: [] },
		{ name: 'href', type: 'string' }
	],


	constructor: function(data,id,raw){
		var c, f = this.fields,
			cName = this.self.getName().split('.').pop(),
			cField = f.getByKey('Class');
//			openedGroup = false;

		if(!cField.defaultValue) {
			cField.defaultValue = cName;
		}

		if(!(new RegExp(cName,'i')).test(this.mimeType)){
			this.mimeType += '.'+cName.toLowerCase();
		}
		else{
			console.warn('using self declared mimeTime:', this.mimeType);
		}

		//Workaround for objects that don't have an NTIID yet.
		if (data && this.idProperty==='NTIID' && id && raw) {
			if (!data.NTIID){
				if (data.ID) {this.idProperty='ID';}
				else if (data.OID){this.idProperty='OID';}
				else {console.error('Model has no id field');}
			}
		}

		f.getByKey('MimeType').defaultValue = this.mimeType;

		c = this.callParent(arguments);
		this.enforceMutability();

		return c;
	},


	destroy: function(){
		this.fireEvent('destroy', this);
		return this.callParent(arguments);
	},


	enforceMutability: function(){
		if(!this.isModifiable()){
			Ext.apply(this,{
				destroy: Ext.emptyFn(),
				save: Ext.emptyFn()
			});
		}
	},


	getModelName: function() {
		return this.fields.getByKey('Class').defaultValue;
	},


	getLink: function(rel){
		var links = this.get('Links') || Ext.data.Types.LINKS.convert( this.raw.Links || [] ),
			ref = links ? links.getRelHref(rel) : null;
		return ref? $AppConfig.server.host + Globals.ensureSlash(ref, true) : null;
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
	 * Save a specific field of this model, optionally set a value and save it if value is sent.
	 *
	 * @param fieldName - name of the field that we want to save
	 * @param [value] - optional value to save (also set it on model)
	 */
	saveField: function(fieldName, value, successCallback) {
		//check to make sure we can do this, and we have the info we need
		if (!this.isModifiable() || !fieldName || !this.hasField(fieldName)){
			console.error('Cannot save field', this, arguments);
			Ext.Error.raise('Cannot save field, issues with model?');
		}

		//If there's a value, set it on the model
		//Do explicit check so you can set values to 0 or ''
		if (value !== null) {
			this.set(fieldName, value);
		}

		//put together the json we want to save.
		var json = {}, me=this;
		json[fieldName] = this.get(fieldName);
		json = Ext.JSON.encode(json);

		Ext.Ajax.request({
			url: this.getLink('edit'),
			jsonData: json,
			method: 'PUT',
			scope: me,
			callback: function(){ },
			failure: function(){
				console.error("field save fail", arguments);
			},
			success: function(resp){
				//it worked, reset the dirty flag, and reset the field
				//because the server may have sanitized it.
				this.dirty = false;
				var sanitizedValue = Ext.JSON.decode(resp.responseText)[fieldName];
				if (successCallback){
					Ext.callback(successCallback, me, [fieldName, sanitizedValue, me]);
				}
			}
		});
	},


	hasField: function(fieldName) {
		var result = false;
		this.fields.each(
			function(f){
				if (f.name === fieldName){
					result = true;
					return false;
				}
		});

		return result;
	},


	/**
	 * Calls the href and fills in the values missing.
	 */
	resolve: function(){
		console.error("still called?");
		var me = this,
			href = this.get('href');

		if(!href){
			Ext.Error.raise('No HREF!');
		}

		Ext.Ajax.request({
			url: $AppConfig.server.host + href,
			async: false,
			callback: function(req, success, resp){
				if(!success){
					console.error('Resolving model failed');
					return;
				}
				me.set(Ext.JSON.decode(resp.responseText));
//				me.enforceMutability();
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