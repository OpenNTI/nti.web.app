//We are only declaring this here for this file... do not use the global "NextThought" in new code.
/*globals NextThought*/
const Ext = require('@nti/extjs');

const JSONProxy = require('../proxy/reader/Json');

const ObjectUtils = require('./Object');


module.exports = exports = Ext.define('NextThought.util.Parsing', {
	COMMON_PREFIX: 'tag:nextthought.com,2011-10:',

	/**
	 * @param {String|String[]|Object|Object[]} items items
	 * @param {Object} [supplemental] Properties to add to the parsed items (such as flags)
	 * @returns {Object[]} Parsed models.
	 */
	parseItems: function (items, supplemental) {
		var key, item, reader, results = [];

		if (!Ext.isArray(items)) {
			items = (items && items.Items) || [items];
		}

		for (key in items) {
			if (items.hasOwnProperty(key)) {
				item = items[key] || {};

				if (typeof item === 'string') {item = Ext.JSON.decode(item);}

				if (item instanceof Ext.data.Model) {
					results.push(item);
					continue;
				}

				reader = this.getReaderFor(item);
				if (!reader) {
					if (typeof console !== 'undefined' && console.debug) {
						console.debug('No reader for item: ', item);
					}
					continue;
				}

				if (supplemental) {
					Ext.applyIf(item, supplemental);
				}

				results.push(reader.read(item).records[0]);
			}
		}

		return results;
	},

	findModel: function (data) {
		function recurse (dir, modelName) {
			var sub, o = dir[modelName];

			if (o) {
				return o;
			}

			for (sub in dir) {
				if (dir.hasOwnProperty(sub) && sub !== 'MAP') {
					if (!dir[sub].$isClass && !dir[sub].singleton) {
						o = recurse(dir[sub], modelName);
						if (o) {return o;}
					}
				}
			}

			return null;
		}

		var name, m;

		if (data.MimeType) {
			m = NextThought.model.MAP[data.MimeType];
			m = m && Ext.ClassManager.get(m);
			if (m) {
				return m;
			}

			console.warn('No model for mimeType: ' + data.MimeType + '. Falling back to classname resolution: ' + data.Class);
		}

		if (Ext.isString(data)) {
			name = data;
		} else if (data.Class) {
			name = data.Class;
		}

		return recurse(NextThought.model, name);
	},

	getReaderFor: function (item) {
		this.readers = this.readers || [];

		var o = this.findModel(item);
		if (!o) {
			console.debug('no model found for ', item);
			return;
		}

		if (!this.readers[o.$className]) {
			this.readers[o.$className] = NextThought.proxy.reader.Base.create({
				model: o.$className, proxy: 'nti'
			});
		}

		return this.readers[o.$className];

	},

	isNTIID: function (id) {
		return Boolean(this.parseNTIID(id));
	},

	/**
	 * Parses an id and returns an object containing the split portions
	 * See http://excelsior.nextthought.com/server-docs/ntiid-structure/

	 * @param {String} id id
	 * @return {Object} an object containing the components of the id
	 */
	parseNTIID: function (id) {
		var parts = (typeof id !== 'string' ? (id || '').toString() : id).split(':'),
			authority, specific,
			result = {};

		if (parts.length < 3 || parts[0] !== 'tag') {
			//console.warn('"'+id+'" is not an NTIID');
			return null;
		}

		//First part is tag, second is authority, third is specific portion

		//authority gets split by comma into name and date
		authority = parts[1].split(',');
		if (authority.length !== 2) {
			//invalid authority chunk
			return null;
		}

		result.authority = {
			name: authority[0],
			date: authority[1]
		};

		//join any parts after the 2nd into the specific portion that will
		//then be split back out into the specific parts.
		//TODO yank the fragment off the end
		specific = parts.slice(2).join(':');
		specific = specific.split('-');

		result.specific = {
			type: specific.length === 3 ? specific[1] : specific[0],
			typeSpecific: specific.length === 3 ? specific[2] : specific[1]
		};

		//Define a setter on provider property so we can match the ds escaping of '-' to '_'
		ObjectUtils.defineAttributes(result.specific, {
			provider: {
				getter: function () {return this.$$provider;},
				setter: function (p) {
					if (p && p.replace) {
						p = p.replace(/-/g, '_');
					}
					this.$$provider = p;
				}
			}
		});

		result.specific.provider = specific.length === 3 ? specific[0] : null;

		result.toString = function () {
			var m = this,
				a = [
					m.authority.name,
					m.authority.date
				],
				s = [
					m.specific.provider,
					m.specific.type,
					m.specific.typeSpecific
				];
			if (!m.specific.provider) {
				s.splice(0, 1);
			}

			return ['tag', a.join(','), s.join('-')].join(':');
		};

		//FIXME include authority?
		result.toURLSuffix = function () {
			//#!html/mathcounts/mathcounts2013.warm_up_7
			var m = this, components = [];

			components.push(m.specific.type);
			if (m.specific.provider) {
				components.push(m.specific.provider);
			}
			components.push(m.specific.typeSpecific);

			return '#!' + Ext.Array.map(components, encodeURIComponent).join('/');
		};

		return result;
	},

	/**
	 * CSS escape ids
	 * @param {string} id id
	 * @return {string} CSS-friendly string to use in a selector
	 */
	escapeId: function (id) {
		return id.replace(/:/g, '\\3a ') //no colons
			.replace(/,/g, '\\2c ')//no commas
			.replace(/\./g, '\\2e ');//no periods
	},

	/**
	 * Returns the prefix of the content ntiid we think this ntiid would reside beneath
	 * @param {String} id id
	 * @return {String} see description
	 */
	ntiidPrefix: function (id) {
		var ntiid = this.parseNTIID(id);
		if (ntiid) {
			ntiid.specific.type = 'HTML';
			ntiid.specific.typeSpecific = ntiid.specific.typeSpecific.split('.').first();
		}
		return ntiid && ntiid.toString();
	},

	parseNtiFragment: function (fragment) {
		var authority = 'nextthought.com,2011-10',
			parts, type, provider, typeSpecific, s;

		if (Ext.isEmpty(fragment) || fragment.indexOf('#!') !== 0) {
			return null;
		}
		fragment = fragment.slice(2);
		parts = fragment.split('/');
		if (parts.length < 2 || parts.length > 3) {
			return null;
		}

		type = parts[0];
		provider = parts.length === 3 ? parts[1] : '';
		typeSpecific = parts.length === 3 ? parts[2] : parts[1];

		s = Ext.Array.map([provider, type, typeSpecific], decodeURIComponent);
		if (Ext.isEmpty(provider)) {
			s.splice(0, 1);
		}

		return ['tag', authority, s.join('-')].join(':');
	},

	parseQueryString: function (qStr) {
		if (Ext.isEmpty(qStr)) {
			return null;
		}
		var r = {};

		Ext.each(qStr.split('&'), function (kv) {
			kv = kv.split('=');
			r[kv[0]] = decodeURIComponent(kv[1]);
		});

		r.toString = function () {
			var out = [], k;
			for (k in this) {
				if (this.hasOwnProperty(k)) {
					out.push([k, encodeURIComponent(this[k])].join('='));
				}
			}
			return out.join('&');
		};
		return r;
	},

	isEncodedNTIID: function (component) {
		var decoded = this.decodeFromURI(component);

		return this.isNTIID(decoded) && !this.isEncodedNTIIMimeType(component);
	},

	isEncodedNTIIMimeType: function (component) {
		var decoded = decodeURIComponent(component),
			index = decoded.indexOf('application/vnd.nextthought');

		return index > -1;
	},

	encodeForURI: function (ntiid) {
		var cut = this.COMMON_PREFIX.length;

		console.error('This is deprecated. Use @nti/lib-ntiids encodeForURI instead.');

		if (ntiid && ntiid.substr(0, cut) === this.COMMON_PREFIX) {
			ntiid = ntiid.substr(cut);
		}

		return encodeURIComponent(ntiid);
	},

	decodeFromURI: function (component) {
		var ntiid = decodeURIComponent(component);

		console.error('This is deprecated. Use @nti/lib-ntiids decodeFromURI instead.');

		if (!this.isNTIID(ntiid) && ntiid.substr(0,3) !== 'tag') {
			ntiid = this.COMMON_PREFIX + ntiid;
		}

		return ntiid;
	}
}).create();


JSONProxy.findModel =
JSONProxy.prototype.findModel = exports.findModel.bind(exports);

/*
 * DOMParser HTML extension
 * 2012-02-02
 *
 * By Eli Grey, http://eligrey.com
 * Public domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*! @source https://gist.github.com/1129031 */
(function (DOMParser) {
	//eslint-disable-next-line strict
	'use strict';
	var DOMParserProto = DOMParser.prototype,
		RealParseFromString = DOMParserProto.parseFromString;

	// Firefox/Opera/IE throw errors on unsupported types
	try {
		// WebKit returns null on unsupported types
		if ((new DOMParser()).parseFromString('', 'text/html')) {
			// text/html parsing is natively supported
			return;
		}
	} catch (ex) {/*ignore*/}

	DOMParserProto.parseFromString = function (markup, type) {
		if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
			var doc = document.implementation.createHTMLDocument(''),
				docElement = doc.documentElement,
				firstElement;

			try {
				docElement.innerHTML = markup;
				firstElement = docElement.firstElementChild;

				if (docElement.childElementCount === 1 && firstElement.localName.toLowerCase() === 'html') {
					doc.replaceChild(firstElement, docElement);
				}
			}
			catch (IE_SUCKS) {
				console.warn('Head tags may not be returned from queries, due to polyfill/browser shortcomings');
				doc.body.innerHTML = markup;
			}

			return doc;
		}
		return RealParseFromString.apply(this, arguments);
	};
}(global.DOMParser));
