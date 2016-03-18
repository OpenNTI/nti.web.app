var Ext = require('extjs');
var Globals = require('../util/Globals');
var ParseUtils = require('../util/Parsing');
var TimeUtils = require('../util/Time');
var MixinsHasLinks = require('../mixins/HasLinks');
var MixinsHasLinks = require('../mixins/HasLinks');
var ConvertersContentRangeDescription = require('./converters/ContentRangeDescription');
var ConvertersDCCreatorToAuthor = require('./converters/DCCreatorToAuthor');
var ConvertersDate = require('./converters/Date');
var ConvertersFuture = require('./converters/Future');
var ConvertersGroupByTime = require('./converters/GroupByTime');
var ConvertersItems = require('./converters/Items');
var ConvertersLinks = require('./converters/Links');
var ConvertersPresenceInfo = require('./converters/PresenceInfo');
var ConvertersSynthetic = require('./converters/Synthetic');
var ConvertersUsers = require('./converters/Users');
var ConvertersVideoSources = require('./converters/VideoSources');
var UtilTime = require('../util/Time');
var UtilParsing = require('../util/Parsing');
var ProxyRest = require('../proxy/Rest');


module.exports = exports = Ext.define('NextThought.model.Base', {
    extend: 'Ext.data.Model',

    mixins: {
		hasLinks: 'NextThought.mixins.HasLinks'
	},

    inheritableStatics: {
		idsBeingGloballyUpdated: {},

		isInstanceOf: function(instance) {
			return instance instanceof this;
		}
	},

    statics: {
		/**
		 * Fact: creating elements is *kind of* expensive.
		 * Fact: JavaScript is thread-safe, because its not threaded. Its Evented. No more than one block of code runs at a time.
		 * Fact: Anchor tags implement the Location API. Setting a value to the href attribute populates:
		 *  #host, #hostname, #protocol, #port, #pathname, #search, #hash and #origin
		 *  AND modifiying those attribute updates #href.
		 *
		 *  Given those, we can safely make a single instance and share it for use of URL normalization and parsing.
		 *
		 *  ALWAYS set the href before using. NEVER rely on its previous value. Think of this the same way you would the return value of Ext.fly().
		 *  As in temporary!  Assume once your 'atomic' like action is finished, the value is useless. Reaquire, or re-init.
		 */
		__SHARED_LOCATION_INTERFACE: document.createElement('a'),

		/**
		 * Gives you the shared location interface intialized to a given ref.
		 *
		 * ALWAYS set the href before using. NEVER rely on its previous value. Think of this the same way you would the return value of Ext.fly().
		 * As in temporary!  Assume once your 'atomic' like action is finished, the value is useless. Reaquire.
		 *
		 * @param {String} ref
		 * @return {Location}
		 */
		getLocationInterfaceAt: function(ref) {
			var a = this.__SHARED_LOCATION_INTERFACE;
			a.setAttribute('href', ref);
			return a;
		}
	},

    idProperty: 'NTIID',
    proxy: { type: 'nti' },

    fields: [
		{ name: 'Class', type: 'string', persist: false },
		{ name: 'ContainerId', type: 'string', useNull: true, convert: function(v) {
			if (v && v.isModel) { v = v.getId(); }
			if (!Ext.isString(v)) {console.error('The ContainerId value is unacceptable:', v);v = null;}
			return v; }
		},
		{ name: 'CreatedTime', type: 'date', persist: false, dateFormat: 'timestamp', defaultValue: new Date(0) },
		{ name: 'Creator', type: 'auto', persist: false },
		{ name: 'ID', type: 'string', persist: false },
		{ name: 'Last Modified', type: 'date', persist: false, dateFormat: 'timestamp', defaultValue: new Date(0) },
		{ name: 'LikeCount', type: 'int', persist: false },
		{ name: 'Links', type: 'links', persist: false, defaultValue: [], useInRaw: true},
		{ name: 'MimeType', type: 'string', useNull: true },
		{ name: 'NTIID', type: 'string', useNull: true },
		{ name: 'OID', type: 'string', persist: false },
		{ name: 'accepts', type: 'auto', persist: false, defaultValue: [] },
		{ name: 'href', type: 'string', persist: false, convert: function(v) {
			if (!v) { return ''; }

			var a = NextThought.model.Base.getLocationInterfaceAt(v), q;

			if (a.search) {
				q = Ext.Object.fromQueryString(a.search);
				delete q._dc;
				a.search = Ext.Object.toQueryString(q);
			}

			//do we ever want fragments in the model href??
			//if (a.hash) {
				//a.hash = '';
			//}

			//if the value wasn't absolute, it is now.
			return a.href
					//trim empty search & fragment tokens
					.replace(/[\?&#]+$/, '');
		} },
		{ name: 'tags', type: 'auto', defaultValue: [] },
		{ name: 'editied', type: 'bool', persist: false, convert: function(v, r) {
			var cd = r.get('CreatedTime'), lm = r.get('Last Modified');
			return ((cd && cd.getTime()) || 0) !== ((lm && lm.getTime()) || 0);
		}},

		//For templates
		{ name: 'isModifiable', persist: false, convert: function(v, r) {return r.phantom || r.getLink('edit') !== null;} },
		{ name: 'favoriteState', persist: false, type: 'auto', convert: function(o, r) { return r.getLink('unfavorite') ? 'on' : 'off'; }},
		{ name: 'likeState', persist: false, type: 'auto', convert: function(o, r) { return r.getLink('unlike') ? 'on' : 'off'; }}
	],

    //TODO: move into model event domain??
	observer: new Ext.util.Observable(),

    onClassExtended: function(cls, data) {
		var map,
			type,
			mime = {mimeType: 'application/vnd.nextthought.' + data.$className.replace(/^.*?model\./, '').toLowerCase()};
		data.proxy = {type: 'nti', model: cls};
		Ext.applyIf(cls, mime);//Allow overriding
		Ext.applyIf(data, mime);//Allow overriding

		type = data.mimeType || cls.mimeType;

		map = NextThought.model.MAP = NextThought.model.MAP || {};
		//console.log(type);
		if (map[type] !== undefined) {
			Ext.Error.raise('Cannot have more than one model per mimetype: ' + type);
		}

		map[type] = data.$className || cls.$className;

		//We don't want to be turning null into empty strings so we must set useNull
		//Failure to do so creates havok with server side validation and also
		//results in us potentially unexpectedly changing fields.

		//This will only effect subclasses, so note above where we manually set useNull on the base set of fields where
		// we do not set persist:false
		Ext.each(data.fields, function(f) {
			//If the field has not set this flag, and its going to be sent to the server... then set flag on the
			// fields behalf.
			if (f && !f.hasOwnProperty('useNull') && f.persist !== false) {
				f.useNull = true;
			}
		});
	},

    getClassForModel: function(aliasPrefix, fallback) {
		var c = this,
			cls = null,
			name;

		while (c && !cls) {
			name = ((c.$className || '').split('.').last() || '').toLowerCase();
			cls = Ext.ClassManager.getByAlias(aliasPrefix + name);
			c = c.superclass;
		}

		return cls || fallback;
	},

    is: function(selector) {
		return selector === '*';
	},

    //Override isEqual so we can test more complex equality and
	//avoid resetting fields that haven't changed
	isEqual: function(a, b) {
		//Super checks === so if it is equal by that
		//return true
		if (this.callParent(arguments)) {
			return true;
		}

		//If one is an array, to be equal they must both
		//be arrays and they must contain equal objects in the proper order
		if (Ext.isArray(a) || Ext.isArray(b)) {
			return Ext.isArray(a) && Ext.isArray(b) && Globals.arrayEquals(a, b, Ext.bind(this.isEqual, this));
		}

		//if a defines an equals method return the result of that
		if (a && Ext.isFunction(a.equal)) {
			return a.equal(b);
		}

		//TODO Do anything for "normal" js object here

		return false;
	},

    /**
	 * A list of keys to not include when syncing a record
	 * @type {Array}
	 */
	SYNC_BLACKLIST: [],

    /**
	 * Given another instance of the same class, update this values.
	 *
	 * @param  {Model} record the instance to update with
	 */
	syncWith: function(record) {
		if (!this.self.isInstanceOf(record)) {
			consle.error('Trying to sync records or two different classes');
			return;
		}

		var newData = record.getData();

		this.SYNC_BLACKLIST.forEach(function(key) {
			delete newData[key];
		});

		this.set(newData);

		if (this.onSync) {
			this.onSync();
		}

		this.fireEvent('update', this);
	},

    /**
	 * Given a response from the server, update my values
	 * @param  {String} response server response
	 */
	syncWithResponse: function(response) {
		var json = JSON.parse(response),
			newRecord;

		json = Ext.applyIf(json, this.getRaw());

		newRecord = ParseUtils.parseItems([json])[0];

		return this.syncWith(newRecord);
	},

    /**
	 * Get the link to request updated values from on the server
	 *
	 * @return {String} the link
	 */
	__getLinkForUpdate: function() {
		return this.get('href');
	},

    /**
	 * Update this record from the server.
	 *
	 * If we are unable to find a href or the update fails, just return
	 * the record with the same values.
	 *
	 * @return {Promise} fulfills with the record after it is updated
	 */
	updateFromServer: function() {
		var me = this,
			link = this.__getLinkForUpdate(),
			update;

		if (link) {
			update = Service.request(link)
				.then(function(response) {
					me.syncWithResponse(response);

					return me;
				});
		} else {
			console.warn('No link to update record from server with. ', this);
			update = Service.getObject(this.getId())
				.then(function(object) {
					me.syncWith(object);

					return me;
				});
		}

		return update
			.fail(function(reason) {
				console.error('Failed to update record from server.', reason);

				return me;
			});
	},

    constructor: function(data, id, raw) {
		var fs = this.fields,
			cName = this.self.getName().split('.').pop(),
			cField = fs.getByKey('Class'), me = this;

		//Workaround for objects that don't have an NTIID yet.
		if (data && this.idProperty === 'NTIID' && id && raw) {
			if (!data.NTIID) {
				if (data.ID) {this.idProperty = 'ID';}
				else if (data.OID) {this.idProperty = 'OID';}
				else {console.error('Model has no id field');}
			}
		}

		cField.defaultValue = cName;
		cField.value = cName;
		fs.getByKey('MimeType').defaultValue = this.mimeType;

		this.callParent(arguments);
		this.addEvents('changed', 'destroy', 'child-added', 'parent-set', 'modified');
		this.enableBubble('changed', 'child-added', 'parent-set');

		//Piggyback on field events to support reconverting dependent readonly fields.
		//Fields  marked with affectedBy that also have a converter will be reset
		//when their affectedBy fields change
		fs.each(function(f) {
			var affectedBy = f.affectedBy,
				fnName = f.name + '-affectedByHandler';
			if (affectedBy && Ext.isFunction(f.convert)) {
				if (!Ext.isArray(affectedBy)) {
					affectedBy = [affectedBy];
				}


				me.observer[fnName] = function() {
					//Note set will end up calling the necessary converter
					this.set(f.name, this.get(f.mapping || f.name));
				};

				Ext.each(affectedBy, function(a) {
					me.addObserverForField(me.observer, a, me.observer[fnName], me);
				});
			}
		});
	},

    getFieldItem: function(field, key) {
		var f = this.get(field) || [];
		// let not having an INDEX_KEYMAP throw an exception so we KNOW we don't have one
		// so that we can fallback to search... if it just doesn't have the key, we can take its word.
		return f[f.INDEX_KEYMAP[key]];
	},

    //A model may have some derived fields that
	//are readonly values.  These values depend on other traditional fields.
	//one such property is 'flagged', it isn't a real field but
	//it is derived from Links.  We support getting those values by
	//looking for a properly named getter
	//
	//First we look for a traditional field with the given name
	//Second we look for a properly named getter function. ie. isField or getField
	get: function(f) {
		var capitalizedFieldName, possibleGetters,
			val;//undefined

		if (!f || this.fields.map[f]) {
			return this.callParent(arguments);
		}

		capitalizedFieldName = Ext.String.capitalize(f);
		possibleGetters = ['get' + capitalizedFieldName, 'is' + capitalizedFieldName];

		Ext.each(possibleGetters, function(g) {
			if (Ext.isFunction(this[g])) {
				val = this[g]();
				return false;
			}
			return true;
		}, this);

		return val;
	},

    valuesAffectedByLinks: function() {
		return ['flagged', 'favorited', 'liked', 'published'];
	},

    isTopLevel: function() {
		var notAReply = !this.get('inReplyTo'),
			noReferences = (this.get('references') || []).length === 0,
			noParent = !this.parent;

		//console.log('record is toplevel? ', notAReply, noReferences, noParent, this.raw);

		return notAReply && noReferences && noParent;
	},

    /**
	 * Caller should wrap in beginEdit() and endEdit()
	 * @param {Ext.data.Model} recordSrc
	 * @param {String...} fields
	 */
	copyFields: function(recordSrc, fields) {
		var me = this, maybeFields = fields;

		if (!Ext.isArray(fields)) {
			maybeFields = Array.prototype.slice.call(arguments, 1) || [];
		}

		Ext.each(maybeFields, function(f) {
			if (Ext.isObject(f)) {
				Ext.Object.each(f, function(dest, src) {
					if (me.hasField(dest) && recordSrc.hasField(src)) {
						me.set(dest, recordSrc.get(src));
					} else {
						console.warn('fields are not declared:\n', me, '(dest)', dest, '\n', recordSrc, '(src)', src);
					}
				});
			}
			else {
				me.set(f, recordSrc.get(f));
			}
		});
	},

    hasField: function(fieldName) {
		return this.data.hasOwnProperty(fieldName);
	},

    tearDownLinks: function() {
		var p = this.parent, cn = (this.children || []),
			i, splice = Array.prototype.splice;
		delete this.parent;
		delete this.children;

		Ext.each(cn, function(c) {c.parent = p;});

		if (p && p.children) {
			i = Ext.Array.indexOf(p.children, this);
			if (i !== -1) {
				cn.unshift(i, 1);//add the index to our children list so it now looks like [i, 1, note, note, ...]
				splice.apply(p.children, cn);//use cn as the args of splice
			}
		}

		this.fireEvent('links-destroyed', this);

	},

    getBubbleParent: function() {
		return this.parent;
	},

    getRoot: function() {
		var current = this,
			currentParent = current.parent;

		while (currentParent && currentParent.parent) {
			current = currentParent;
			currentParent = currentParent.parent;
		}

		return current;
	},

    wouldBePlaceholderOnDelete: function() {
		return (this.children !== undefined && this.get('RecursiveReferenceCount')) || (!Ext.isEmpty(this.children));
	},

    convertToPlaceholder: function() {
		var me = this, keepList = {
			'Class': 1,
			'ContainerId': 1,
			'ID': 1,
			'MimeType': 1,
			'NTIID': 1,
			'OID': 1,
			'inReplyTo': 1,
			'references': 1
		};
		me.placeholder = true;
		me.fields.each(function(f) {
			if (!keepList[f.name]) {
				me.set(f.name, f.defaultValue);
			}
		});

		me.fireEvent('convertedToPlaceholder');
		me.fireEvent('updated', me);
		me.fireEvent('changed');
		me.maybeCallOnAllObjects('convertToPlaceholder', me, arguments);
	},

    destroy: function(options) {
		var me = this,
			successCallback = (options || {}).success || Ext.emptyFn,
			failureCallback = (options || {}).failure || Ext.emptyFn;

		if (me.placeholder) {
			console.debug('Firing destroy because destroying placeholder', me);
			me.fireEvent('destroy', me);
			if (me.stores) {
				Ext.each(me.stores.slice(), function(s) { s.remove(me); });
			}
			return;
		}

		if (!me.isModifiable()) {return;}

		function clearFlag() {
			if (me.destroyDoesNotClearListeners) {
				console.log('clearing flag');
			}
			delete me.destroyDoesNotClearListeners;
		}

		function announce() {
			me.fireEvent('deleted', me);
		}

		options = Ext.apply(options || {},{
			success: Ext.Function.createSequence(clearFlag,
					Ext.Function.createSequence(announce, successCallback, null), null),
			failure: Ext.Function.createSequence(clearFlag, failureCallback, null)
		});


		if (me.wouldBePlaceholderOnDelete()) {
			me.destroyDoesNotClearListeners = true;
		}
		me.callParent([options]);
	},

    enforceMutability: function() {
		if (!this.isModifiable()) {
			Ext.apply(this, {
				destroy: Ext.emptyFn(),
				save: Ext.emptyFn()
			});
		}
	},

    getModelName: function() {
		return this.get('Class');
	},

    getFriendlyLikeCount: function() {
		var c = this.get('LikeCount');
		if (c <= 0) {return '';}
		if (c >= 1000) { return '999+';}
		return String(c);
	},

    isLikeable: function() {
		return Boolean(this.getLink('like') || this.getLink('unlike'));
	},

    isFavoritable: function() {
		return Boolean(this.getLink('favorite') || this.getLink('unfavorite'));
	},

    isFavorited: function() {
		return Boolean(this.getLink('unfavorite'));
	},

    isLiked: function() {
		return Boolean(this.getLink('unlike'));
	},

    isFlagged: function() {
		return Boolean(this.getLink('flag.metoo'));
	},

    flag: function(widget) {
		var action = this.isFlagged() ? 'flag.metoo' : 'flag',
			prePost = action === 'flag' ? 'addCls' : 'removeCls',
			postPost = action === 'flag' ? 'removeCls' : 'addCls';

		if (this.activePostTos && this.activePostTos[action]) {return;}

		widget = widget || {};
		Ext.callback(widget[prePost], widget, ['on']);

		this.postTo(action, function(s) {
			if (!s) {
				Ext.callback(widget[postPost], widget, ['on']);
			}
		});
	},

    favorite: function(widget) {
		var me = this,
			currentValue = this.isFavorited(),
			action = currentValue ? 'unfavorite' : 'favorite';

		if (me.activePostTos && me.activePostTos[action]) {return;}

		//We will assume it completes and then update it if it actually fails
		widget = widget || {};
		Ext.callback(widget.markAsFavorited, widget, [!currentValue]);

		me.postTo(action, function(s) {
			if (s) {
				//put "me" in the bookmark view?
				me.set('favoriteState', currentValue ? 'on' : 'off');
			}
			else {
				Ext.callback(widget.markAsFavorited, widget, [currentValue]);
			}
			me.set('favoriteState', s);//it doesn't matter what we pass as the value, the converter returns its own value
		}, 'favorite');
	},

    like: function(widget) {
		var me = this,
			lc = this.get('LikeCount'),
			currentValue = this.isLiked(),
			action = currentValue ? 'unlike' : 'like',
			polarity = action === 'like' ? 1 : -1;

		if (this.activePostTos && this.activePostTos[action]) {return;}

		widget = widget || {};
		Ext.callback(widget.markAsLiked, widget, [!currentValue]);
		me.set('LikeCount', lc + polarity);

		this.postTo(action, function(s) {
			var r;
			if (!s) {
				Ext.callback(widget.markAsLiked, widget, [currentValue]);
				me.set('LikeCount', lc);
			}
			else {
				//Find the root if we are in a tree and update its recursive
				//like count
				r = me;
				while (r.parent) {r = r.parent;}

				if (r.getTotalLikeCount) {
					r.set('RecursiveLikeCount', (r.get('RecursiveLikeCount') || 0) + polarity);
				}
			}
			me.set('likeState', s);//it doesn't matter what we pass as the value, the converter returns its own value
		}, 'LikeCount');
	},

    postTo: function(link, callback, modifiedFieldName) {
		this.activePostTos = this.activePostTos || {};
		var me = this, req,
			l = this.getLink(link);

		if (!l) {
			console.error('Cannot find link "' + link + ' on this model.', this);
		}

		if (l && !this.activePostTos[link]) {
			req = {
				url: l,
				jsonData: '',
				method: 'POST',
				scope: this,
				callback: function(r, s, response) {
					delete me.activePostTos[link];
					if (s) {
						var o = Ext.JSON.decode(response.responseText, true);
						delete o.Creator;//ignore this, we don't want to lose the Record that is potentially there.
						me.set(o);
						this.fireEvent('updated', me, modifiedFieldName);
					}
					Ext.callback(callback, null, [s]);
				}
			};

			this.activePostTos[link] = Ext.Ajax.request(req);
		}
		return this.activePostTos[link];
	},

    isModifiable: function() {
		try {
			//This isn't necessarily true for all objects. For instance anyone's blog comments
			//can be edited or deleted by the blogs author.  I notice the field logic is correct
			//and different from this.
			return this.phantom || (this.getLink('edit') !== null && this.isMine());
		}
		catch (e) {
			console.warn('No getLink()!');
		}
		return false;
	},

    isMine: function() {
		return isMe(this.get('Creator'));
	},

    getFieldEditURL: function(editLink, field) {
		if (/.*\+\+fields\+\+.*/.test(editLink)) {
			//edit link is already edit link for that field
			return editLink;
		}

		var f = Ext.String.format('/++fields++{0}', field);

		return getURL(Ext.String.format('{0}{1}',
				editLink, f));
	},

    /**
	 * Save a specific field off this model, optionally set a value and save it if value is sent.
	 *
	 * @param {String} fieldName - name of the field that we want to save
	 * @param {*} [value] - if undefined the field from the model will be saved.  If not undefined the field
	 *					will be set on the model prior to saving
	 * @param {Function} successCallback
	 * @param {Function} failCallback
	 * @param {String} [optionalLinkName] = provide if you want a specific link other than the edit link
	 */
	saveField: function(fieldName, value, successCallback, failCallback, optionalLinkName) {
		var editLink = this.getLink(optionalLinkName || 'edit'),
			json, me = this, req;

		//special case, pageInfos are not editable (no link), but can take sharedPrefs
		if (!editLink && /^PageInfo$/.test(this.get('Class')) && fieldName && fieldName === 'sharingPreference') {
			editLink = Service.getObjectURL(this.getId());
		}

		//check to make sure we can do this, and we have the info we need
		if (!fieldName || (!this.hasField(fieldName) && !new RegExp('.*' + fieldName + '$').test(fieldName))) {
			console.error('Cannot save field', this, arguments);
			Ext.Error.raise('Cannot save field, issues with model?');
		}
		if (!editLink) {
			console.error('Can\'t save field on uneditable object', this);
			Ext.Error.raise('Can\'t save field on uneditable object');
		}

		//If there's a value, set it on the model
		//Do explicit check so you can set values to 0 or ''
		if (value !== undefined) {
			this.set(fieldName, value);
		}

		//put together the json we want to save.
		json = Ext.JSON.encode(value === undefined ? this.get(fieldName) : value);
		req = {
			url: this.getFieldEditURL(editLink, fieldName),
			jsonData: json,
			method: 'PUT',
			headers: {
				Accept: 'application/json'
			},
			scope: me,
			callback: function() { },
			failure: function() {
				console.error('field save fail', arguments);
				Ext.callback(failCallback, this, arguments);
			},
			success: function(resp) {
				var newMe = ParseUtils.parseItems(Ext.decode(resp.responseText))[0],
					sanitizedValue = newMe && newMe.get(fieldName);
				if (!newMe) {
					console.warn('Could not parse response... %o', resp.responseText);
				} else {
					me.set(fieldName, sanitizedValue);
				}

				//it worked, reset the dirty flag, and reset the field
				//because the server may have sanitized it.
				this.commit();

				if (successCallback) {
					Ext.callback(successCallback, null, [fieldName, sanitizedValue, me, newMe]);
				}

				me.fireEvent('changed', me);
			}
		};

		Ext.Ajax.request(req);
	},

    /**
	 * Calls the href and fills in the values missing.
	 */
	resolve: function() {
		console.error('still called?');
		var me = this,
			href = this.get('href'),
			req;

		if (!href) {
			Ext.Error.raise('No HREF!');
		}

		req = {
			url: getURL(href),
			async: false,
			callback: function(req, success, resp) {
				if (!success) {
					console.error('Resolving model failed');
					return;
				}
				me.set(Ext.JSON.decode(resp.responseText));
				me.enforceMutability();
				me.dirty = false;
				me.modified = {};
			}
		};

		Ext.Ajax.request(req);


	},

    //Only seems to be called from legacy classroom stuff
	getParent: function(callback, scope) {
		var href = this.getLink('parent'), req;

		console.error('Still called?');

		if (!callback) {
			Ext.Error.raise('this method requires a callback');
		}

		if (!href) {
			//Ext.Error.raise('No parent HREF!');
			callback.call(scope || window, null);
			return;
		}

		req = {
			url: href,
			callback: function(req, success, resp) {
				if (!success) {
					console.error('Resolving parent model failed');
					return;
				}
				callback.call(scope || window, ParseUtils.parseItems(Ext.JSON.decode(resp.responseText))[0]);
			}
		};

		Ext.Ajax.request(req);

	},

    equal: function(b) {
		var a = this,
			r = true;

		//If they aren't both models
		//they are not equal
		//type check here?
		if (!a.isModel || !b || !b.isModel) {
			return false;
		}

		a.fields.each(
				function(f) {
					var fa = a.get(f.name),
							fb = b.get(f.name);

					if (!a.isEqual(fa, fb)) {
						r = false;
						return false;//break
					}
					return true;
				}
		);

		return r;
	},

    toJSON: function() {
		return this.asJSON();
	},

    asJSON: function() {
		var data = {},
			me = this;

		this.fields.each(
				function(f) {
					if (!f.persist) {return;}
					var x = me.get(f.name);
					if (Ext.isDate(x)) {
						x = x.getTime() / 1000;
					}
					else if (x && x.asJSON) {
						x = x.asJSON();
					}
					else if (x && Ext.isArray(x)) {
						x = x.slice();
						Ext.each(x, function(o, i) {
							x[i] = o && o.asJSON ? o.asJSON() : o;
						});
					}

					data[f.name] = Ext.clone(x);
				}
		);
		return data;
	},

    getRaw: function() {
		var data = {},
			me = this;

		this.fields.each(function(f) {
			if (!f.persist && !f.useInRaw) { return; }

			var x = me.get(f.name);

			if (Ext.isDate(x)) {
				x = x.getTime() / 1000;
			} else if (x && x.getRaw) {
				x = x.getRaw();
			} else if (x && Ext.isArray(x)) {
				x = x.slice();

				Ext.each(x, function(o, i) {
					x[i] = o && o.getRaw ? o.getRaw() : o;
				});
			}

			data[f.mapping || f.name] = Ext.clone(x);
		});

		return data;
	},

    getRelativeTimeString: function() {
		return TimeUtils.timeDifference(Ext.Date.now(), this.get('CreatedTime'));
	},

    /**
	 * @private
	 * property {Boolean} destroyDoesNotClearListeners
	 */
	destroyDoesNotClearListeners: false,

    clearManagedListeners: function() {
		if (!this.destroyDoesNotClearListeners) {
			this.callParent(arguments);
		}
	},

    clearListeners: function() {
		if (!this.destroyDoesNotClearListeners) {
			this.callParent(arguments);
		}
	},

    fieldEvent: function(name) {
		return name + '-changed';
	},

    notifyObserversOfFieldChange: function(f) {
		this.fireEvent(this.fieldEvent(f), f, this.get(f));
	},

    //Fires an event signaling the given field has changed.
	//If there are dependent fields those events are also fired
	//To signal dependent fields implement a function valuesAffectedByField
	//that returns an array of dependent field names
	onFieldChanged: function(f) {
		if (!f) {
			return;
		}

		var dependentFunctionName = 'valuesAffectedBy' + f,
			fn = this[dependentFunctionName];
		this.notifyObserversOfFieldChange(f);
		if (Ext.isFunction(fn)) {
			Ext.each(fn.call(this), this.notifyObserversOfFieldChange, this);
		}
	},

    addObserverForField: function(observer, field, fn, scope, options) {
		if (!observer) {
			return null;
		}
		options = Ext.apply(options || {},{destroyable: true});
		return observer.mon(this, this.fieldEvent(field), fn, scope, options);
	},

    removeObserverForField: function(observer, field, fn, scope) {
		if (!observer) {
			return;
		}
		observer.mun(this, this.fieldEvent(field), fn, scope);
	},

    afterEdit: function(fnames) {
		var me = this, updatedValue;
		//are we getting called by a child record (see converters/Items.js)
		if (fnames instanceof Ext.data.Model) {
			updatedValue = fnames;
			fnames = [];//just in case its not found
			me.fields.each(function(f) {
				var v = me.get(f.name);
				if (v === updatedValue || (Ext.isArray(v) && v.indexOf(updatedValue) >= 0)) {
					fnames = [f.name];
					return false;
				}
			});
		}

		try {
			me.callParent([fnames]);
		}
		finally {
			Ext.each(fnames || [], me.onFieldChanged, me);
		}
	},

    /**
	 *
	 * JSG - Yanked from the Ext.data.Model#callStore() so we can patch it.
	 *
     * @inheritDoc
     */
	callStore: function(fn) {
		var args = Ext.Array.clone(arguments),
			stores = this.stores,
			i = 0,
			len = stores.length,
			store;

		args[0] = this;
		for (i; i < len; ++i) {
			store = stores[i];
			if (store && Ext.isFunction(store[fn])) {

				//Some of our synthetic fields trigger this call before there are groups defined...
				// the store's group updating code does not ensure a group exists before acting on it,
				// so lets fake out the store and let it think that its not groupped yet.
				if (store.isGrouped && store.isGrouped()) {
					store.isGrouped = Ext.emptyFn;
				}

				try {
					store[fn].apply(store, args);
				}
				finally {
					//Remove our fake out.
					if (store.isGrouped === Ext.emptyFn) {
						delete store.isGrouped;
					}
				}
			}
		}
	},

    //Methods for updating all copies of an object in memory when one changes,
	//ideally we have one in memory object that is just referenced everywhere.
	//We are a bit far away from that (mostly because of how we represent threads)
	//so we brute force it by passing these calls
	//through to other in memory objects with the same ids
	maybeCallOnAllObjects: function(fname, rec, args) {

		//Allow a way to turn it off
		if (this.dontNotifyOtherObjects === false) {return;}

		var active = this.self.idsBeingGloballyUpdated[fname],
			recId = rec.getId(),
			fnHook = Ext.emptyFn;


		if (!recId) {return;}

		if (!active) {
			this.self.idsBeingGloballyUpdated[fname] = active = {};
		}

		if (active[recId]) {
			return;
		}

		//If we haven't already started calling fname on other in memory objects
		//set the flag and notify.  Make sure we clear it at the end
		active[recId] = true;
		//console.time('looking for objects');
		//Use the store manager to iterate all stores looking for an object
		//that has the same id.  If it isn't the exact record call the function
		//fname on it with the provided args
		Ext.data.StoreManager.each(function(s) {
			var data = s.snapshot || s.data,
				recById = data && data.getByKey && data.getByKey(recId);

			if (!recById) {
				return true; //keep going
			}

			//This record has been filtered out and may potentially throw an error if we attempt to call store group
			// functions. So, we let this record update and the store think its ungroupped while it updates.
			if (s.isGrouped() && !s.data.contains(recById)) {
				s.isGrouped = fnHook;
			}

			//Ok we found one and it isn't the same object
			if (rec !== recById && rec.get('MimeType') === recById.get('MimeType') && Ext.isFunction(recById[fname])) {
				try {
					recById[fname].apply(recById, args);
				}
				catch (e) {
					console.warn(e.message);
				}
			}

			if (s.isGrouped === fnHook) {
				delete s.isGrouped;//restore the default
			}
		});

		//console.timeEnd('looking for objects');
		delete active[rec.getId()];
	},

    beginEdit: function() {
		this.callParent(arguments);
		this.maybeCallOnAllObjects('beginEdit', this, arguments);
	},

    endEdit: function() {
		this.callParent(arguments);
		this.maybeCallOnAllObjects('endEdit', this, arguments);
	},

    cancelEdit: function() {
		this.callParent(arguments);
		this.maybeCallOnAllObjects('cancelEdit', this, arguments);
	},

    set: function() {
		this.callParent(arguments);
		this.maybeCallOnAllObjects('set', this, arguments);
	}
});
