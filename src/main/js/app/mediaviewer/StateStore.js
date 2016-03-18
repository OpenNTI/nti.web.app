var Ext = require('extjs');
var CommonStateStore = require('../../common/StateStore');
var UserdataActions = require('../userdata/Actions');


module.exports = exports = Ext.define('NextThought.app.mediaviewer.StateStore', {
    extend: 'NextThought.common.StateStore',
    obj_map: {},
    cmpMap: {},
    DEFAULT_SHARING: {},

    constructor: function(){
		this.callParent(arguments);
		this.UserDataActions = NextThought.app.userdata.Actions.create();
	},

    cacheTranscriptObject: function(id, content) {
		this.obj_map[id] = content;
	},

    getTranscriptObject: function(id) {
		return this.obj_map[id];
	},

    addComponentForStore: function(cmp, store) {
		var id = store && store.getId ? store.getId() : store,
			v = this.cmpMap[id] || [];

		v.push(cmp);
		this.cmpMap[id] = v;
	},

    getComponentsForStore: function(store) {
		var id = store && store.getId ? store.getId() : store;
		return this.cmpMap[id] || [];
	},

    getContext: function(cmp) {
		if (!this.pageContextMap) {
			this.pageContextMap = {};
		}

		if (cmp) {
			var c = this.pageContextMap;

			if (!c.hasOwnProperty(cmp.id)) {
				cmp.on('destroy', function() {
					delete c[cmp.id];
				});
			}
		
			c[cmp.id] = c[cmp.id] || {};

			return c[cmp.id];
		}

		return this.currentContext;
	},

    cacheSharingPreferences: function(ntiid, prefs) {
		this.DEFAULT_SHARING[ntiid] = prefs;
	},

    getSharingPreferences: function(ntiid, currentBundle) {
		var prefs = this.DEFAULT_SHARING[ntiid],
			me = this;

		if (prefs) {
			return Promise.resolve(prefs);
		}

		return new Promise(function(fulfill) {
			me.UserDataActions.getPreferences(ntiid, currentBundle)
				.then(function(prefs){
					me.cacheSharingPreferences(ntiid, prefs);
					fulfill(prefs);
				});
		});
	}
});
