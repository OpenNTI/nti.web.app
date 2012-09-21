Ext.define('NextThought.model.Base', {
	extend: 'Ext.data.Model',
	requires: [
		'NextThought.mixins.HasLinks',
		'NextThought.model.converters.Links',
		'NextThought.model.converters.Items',
		'NextThought.model.converters.Users',
		'NextThought.util.Parsing',
		'NextThought.proxy.Rest'
	],

	mixins: {
		hasLinks: 'NextThought.mixins.HasLinks'
	},

	idProperty: 'NTIID',
	mimeType: 'application/vnd.nextthought',
	proxy: { type: 'nti' },
	fields: [
		{ name: 'Class', type: 'string', persist: false },
		{ name: 'ContainerId', type: 'string' },
		{ name: 'CreatedTime', type: 'date', persist: false, dateFormat: 'timestamp', defaultValue: new Date() },
		{ name: 'Creator', type: 'string', persist: false },
		{ name: 'ID', type: 'string', persist: false },
		{ name: 'Last Modified', type: 'date', persist: false, dateFormat: 'timestamp', defaultValue: new Date() },
		{ name: 'Links', type: 'links', persist: false, defaultValue: [] },
		{ name: 'MimeType', type: 'string' },
		{ name: 'NTIID', type: 'string' },
		{ name: 'OID', type: 'string', persist: false },
		{ name: 'accepts', type: 'auto', persist: false, defaultValue: [] },
		{ name: 'href', type: 'string', persist: false },
		{ name: 'LikeCount', type: 'int', persist: false }
	],

	onClassExtended: function(cls, data) {
		data.proxy = {type:'nti', model: cls};
	},


	constructor: function(data,id,raw){
		var c, f = this.fields,
			cName = this.self.getName().split('.').pop(),
			mimeExtension = this.self.getName().replace(/^.*?model\./,'').toLowerCase(),
			cField = f.getByKey('Class');
//			openedGroup = false;


		cField.defaultValue = cName;
		cField.value = cName;

		if(!(new RegExp(cName,'i')).test(this.mimeType)){
			this.mimeType += '.'+mimeExtension;
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

		this.callParent(arguments);
		this.addEvents('changed','child-added','parent-set');
		this.enableBubble('changed','child-added','parent-set');
		return this;
	},


	tearDownLinks: function(){
		var p = this.parent, cn = (this.children||[]),
			i, splice = Array.prototype.splice;
		delete this.parent;
		delete this.children;

		Ext.each(cn,function(c){c.parent=p;});

		if(p && p.children){
			i = Ext.Array.indexOf(p.children,this);
			if(i!==-1){
				cn.unshift(i,1);//add the index to our children list so it now looks like [i, 1, note, note, ...]
				splice.apply(p.children,cn);//use cn as the args of splice
			}
		}

		this.fireEvent('destroy', this);
	},


	getBubbleParent: function(){
		return this.parent;
	},


	getRoot: function() {
		var current = this,
			currentParent = current.parent;

		while(currentParent && currentParent.parent){
			current = currentParent;
			currentParent = currentParent.parent;
		}

		return current;
	},


	destroy: function(){
		this.tearDownLinks();
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
		return this.get('Class');
	},


	getFriendlyLikeCount: function(){
		var c = this.get('LikeCount');
		if (c <= 0) {return '';}
		else if (c >= 1000){ return '999+';}
		return String(c);
	},


	isFavorited: function(){
		return Boolean(this.getLink('unfavorite'));
	},


	isLiked: function(){
		return Boolean(this.getLink('unlike'));
	},


	isFlagged: function(){
		return Boolean(this.getLink('flag.metoo'));
	},


	flag: function(widget){
		var action = this.isFlagged() ? 'flag.metoo' : 'flag',
			prePost = action === 'flag' ? 'addCls' : 'removeCls',
			postPost = action === 'flag' ? 'removeCls' : 'addCls';

		if (this.activePostTos && this.activePostTos[action]){return;}

		widget[prePost]('on');

		this.postTo(action, function(s){
			if (!s) {
				widget[postPost]('on');
			}
		});
	},



	favorite: function(widget){
		var action = this.isFavorited() ? 'unfavorite' : 'favorite',
			prePost = action === 'favorite' ? 'addCls' : 'removeCls',
			postPost = action === 'favorite' ? 'removeCls' : 'addCls';

		if (this.activePostTos && this.activePostTos[action]){return;}

		widget[prePost]('on');

		this.postTo(action, function(s){
			if (!s) {
				widget[postPost]('on');
			}
		});
	},


	like: function(widget){
		var me = this,
			lc = this.get('LikeCount'),
			action = this.isLiked() ? 'unlike' : 'like',
			prePost = action === 'like' ? 'addCls' : 'removeCls',
			postPost = action === 'like' ? 'removeCls' : 'addCls',
			polarity = action === 'like' ? 1 : -1;

		if (this.activePostTos && this.activePostTos[action]){return;}

		widget[prePost]('on');
		me.set('LikeCount', lc + polarity);
		widget.update(me.getFriendlyLikeCount());

		this.postTo(action, function(s){
			if (!s) {
				widget[postPost]('on');
				me.set('LikeCount', lc);
				widget.update(me.getFriendlyLikeCount());
			}
		});
	},


	postTo: function(link, callback){
		this.activePostTos = this.activePostTos || {};
		var me = this,
			l = this.getLink(link);



		if (l && !this.activePostTos[link]) {
			this.activePostTos[link] = Ext.Ajax.request({
				url: l,
				jsonData: '',
				method: 'POST',
				scope: this,
				callback: function(r, s, response){
					me.set(Ext.JSON.decode(response.responseText));
					delete this.activePostTos[link];
					Ext.callback(callback, null, [s]);
					if(s){
						this.fireEvent('updated',this);
					}
				}
			});
		}
		return this.activePostTos[link];
	},


	isModifiable: function(){
		try{
			return this.phantom||(this.getLink('edit')!==null&&isMe(this.get('Creator')));
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
		if (!fieldName || !this.hasField(fieldName)){
			console.error('Cannot save field', this, arguments);
			Ext.Error.raise('Cannot save field, issues with model?');
		}

		//If there's a value, set it on the model
		//Do explicit check so you can set values to 0 or ''
		if (value !== null) {
			this.set(fieldName, value);
		}

		//put together the json we want to save.
		var json = Ext.JSON.encode(value||this.get(fieldName)),
			me=this;

		Ext.Ajax.request({
			url: $AppConfig.service.getObjectURL(this.get('NTIID'), fieldName),
			jsonData: json,
			method: 'PUT',
			headers: {
				Accept: 'application/json'
			},
			scope: me,
			callback: function(){ },
			failure: function(){
				console.error("field save fail", arguments);
			},
			success: function(resp){
				var newMe = ParseUtils.parseItems( Ext.decode(resp.responseText))[0],
					sanitizedValue = newMe.get(fieldName);

				me.set(fieldName,sanitizedValue);

				//it worked, reset the dirty flag, and reset the field
				//because the server may have sanitized it.
				this.dirty = false;

				if (successCallback){
					Ext.callback(successCallback, me, [fieldName, sanitizedValue, me, newMe]);
				}

				me.fireEvent('changed',me);
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
			url: getURL(href),
			async: false,
			callback: function(req, success, resp){
				if(!success){
					console.error('Resolving model failed');
					return;
				}
				me.set(Ext.JSON.decode(resp.responseText));
				me.enforceMutability();
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
				if(!f.persist){return;}
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
	},

	getRelativeTimeString: function(){
		//yanked & modifed from: http://stackoverflow.com/questions/6108819/javascript-timestamp-to-relative-time-eg-2-seconds-ago-one-week-ago-etc-best
		function timeDifference(current, previous) {
		    var msPerMinute = 60 * 1000;
		    var msPerHour = msPerMinute * 60;
		    var msPerDay = msPerHour * 24;
		    var msPerMonth = msPerDay * 30;
		    var elapsed = current - previous;

		    if (elapsed < msPerMinute) {
		         return Math.round(elapsed/1000) + ' seconds ago';
		    }

		    else if (elapsed < msPerHour) {
		         return Math.round(elapsed/msPerMinute) + ' minutes ago';
		    }

		    else if (elapsed < msPerDay ) {
		         return Math.round(elapsed/msPerHour ) + ' hours ago';
		    }

		    else if (elapsed < msPerMonth) {
		        return Math.round(elapsed/msPerDay) + ' days ago';
		    }

			return Ext.Date.format(previous, 'M j, Y, g:i a');
		}

		return timeDifference(Ext.Date.now(),this.get('CreatedTime'));
	}
});
