const Ext = require('@nti/extjs');
const PreferenceBase = require('internal/legacy/model/preference/Base');
const PreferenceRoot = require('internal/legacy/model/preference/Root');

require('internal/legacy/model/preference/Badges');
require('internal/legacy/model/preference/badges/Base');
require('internal/legacy/model/preference/badges/Course');
require('internal/legacy/model/preference/ChatPresence');
require('internal/legacy/model/preference/chatpresence/Active');
require('internal/legacy/model/preference/chatpresence/Available');
require('internal/legacy/model/preference/chatpresence/Away');
require('internal/legacy/model/preference/chatpresence/Base');
require('internal/legacy/model/preference/chatpresence/DND');
require('internal/legacy/model/preference/Gradebook');
require('internal/legacy/model/preference/PushNotifications');
require('internal/legacy/model/preference/pushnotifications/Base');
require('internal/legacy/model/preference/pushnotifications/Email');
require('internal/legacy/model/preference/WebApp');
require('internal/legacy/proxy/Preference');

module.exports = exports = Ext.define('NextThought.preference.Manager', {
	constructor: function (config) {
		this.baseUrl = config.href;
		this.root = PreferenceRoot.create({
			Class: 'preference',
			href: this.baseUrl,
		});
	},

	/*
	 *	Loads the preference from the server or returns the value for it we alread have
	 * @param key {String} a / delimited list of which preference to get ex ChatPresence/Available
	 * @param cb {Function} what to do after we get the value, takes the value as a parameter
	 * @param scope {Object} the scope to use when calling the callback
	 */
	getPreference: function (key, cb, scope) {
		var value = this.getSubPreference(key);

		if (value && (value.isFuture || this.hasFutures(value))) {
			//we haven't loaded it yet or it has sub preferences that haven't been loaded
			return this.loadSubPreference(key, cb, scope);
		}

		//either we have loaded it or it wasn't a valid preference
		Ext.callback(cb, scope, [value]);
		if (!value) {
			return Promise.reject('Invalid Preference');
		}
		return Promise.resolve(value);
	},

	getSubPreference: function (key) {
		var i,
			keys = key.split('/'),
			value = this.root;

		for (i = 0; i < keys.length; i++) {
			//if we haven't loaded the value return it
			if (value && value.isFuture) {
				return value;
			}

			if (value && value.get(keys[i])) {
				value = value.get(keys[i]);
			} else {
				console.log('Invalid preference');
				return false;
			}
		}

		return value;
	},

	hasFutures: function (value) {
		var i,
			cur,
			hasFuture = false,
			subs = value.subPreferences;

		if (Ext.isEmpty(subs)) {
			return false;
		}

		for (i = 0; i < subs.length; i++) {
			cur = value.get(subs[i]);

			if (cur && cur.isFuture) {
				return true;
			}

			if (cur) {
				hasFuture = hasFuture || this.hasFutures(cur);
			}
		}

		return hasFuture;
	},

	urlToClassName: function (url) {
		var i,
			className = 'NextThought.model.preference',
			urls = url.split('/'),
			startingIndex = Ext.Array.indexOf(urls, '++preferences++') + 1;

		for (i = startingIndex; i < urls.length; i++) {
			if (i + 1 > urls.length) {
				className += '.' + urls[i];
			} else {
				className += '.' + urls[i].toLowerCase();
			}
		}

		return className;
	},

	classNameToModel: function (className) {
		//This should be rewritten to create an array at the top of the file instead
		//Tof using the "Magic" ExtJS class namespace object...
		var i,
			//eslint-disable-next-line no-undef
			model = NextThought,
			names = className.split('.');

		for (i = 1; i < names.length; i++) {
			model = model[names[i]];
		}

		return model;
	},

	loadSubPreference: function (key, cb, scope) {
		var me = this,
			url = me.baseUrl + '/' + key;

		return new Promise(function (fulfill, reject) {
			PreferenceBase.load(url, {
				failure(rec, op) {
					if (op.error?.status === 404) fulfill();
					else reject(op.error);

					Ext.callback(cb, scope, [false]);
				},
				success(rec, op) {
					var model,
						json = op.response.responseText;

					json = Ext.JSON.decode(json);
					//mostly because we get an array back with the testing sim
					json = Ext.isArray(json) ? json[0] : json;
					model = me.setSubPreference(json);

					fulfill(model);

					Ext.callback(cb, scope, [model]);
				},
			});
		});
	},

	setSubPreference: function (json) {
		var me = this,
			i,
			result,
			name = 'NextThought.model',
			cls = json.Class,
			path = cls.split('_'),
			value = this.root,
			nextValue;

		function sp(key) {
			if (json[key]) {
				me.setSubPreference(json[key]);
			}
		}

		for (i = 0; i < path.length; i++) {
			if (i + 1 < path.length) {
				if (value.get(path[i])) {
					nextValue = value.get(path[i]);

					//if a parent preference isn't load yet, init it to an empty one
					if (nextValue && nextValue.isFuture) {
						result = Ext.create(name + '.' + path[i]);
						value.set(path[i], result);
						value = result;
					} else {
						value = nextValue;
					}
				}

				name = name + '.' + path[i].toLowerCase();
			} else {
				name = name + '.' + path[i];

				result = Ext.create(name, json);
				value.set(path[i], result);

				value = value.get(path[i]);
				//set any sub preferences while we have them
				Ext.each(value.subPreferences, sp);

				return result;
			}
		}
	},
});
