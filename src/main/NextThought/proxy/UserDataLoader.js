/**
 * TODO: Move the search functions & stores into controllers.
 * @deprecated
 */
Ext.define('NextThought.proxy.UserDataLoader',{
    alternateClassName: 'UserDataLoader',
	singleton: true,
    requires: [
        'NextThought.util.ParseUtils',
        'NextThought.cache.UserRepository'
    ],

	searchUserData: function(containerId, searchString, callback) {
		var me = this;
		if(me._searchUserData){
			Ext.Ajax.abort(me._searchUserData);
		}

		this._searchUserData = Ext.Ajax.request({
			url: _AppConfig.service.getUserDataSearchURL() + searchString,
			scope: me,
			async: !!callback,
			callback: function(o,success,r){
				me._searchUserData = null;
				if(!success){
					console.error('There was an error searching for user generated data', arguments);
					if (callback) callback();
					return;
				}

				var json = Ext.decode(r.responseText),
					bins = ParseUtils.binAndParseItems(json.Items);

				if(!callback)return;
				callback(bins.Hit);
			}
		});
	},


	searchContent: function(containerId, searchString, callback) {
		var me = this;

		if(me._searchContent){
			Ext.Ajax.abort(me._searchContent);
		}

		this._searchContent = Ext.Ajax.request({
			url: _AppConfig.service.getSearchURL(containerId) + searchString,
			scope: me,
			async: !!callback,
			callback: function(o,success,r){
				me._searchContent = null;
				if(!success){
					console.error('There was an error searching', arguments);
					if (callback) callback();
					return;
				}

				var json = Ext.decode(r.responseText),
					bins = ParseUtils.binAndParseItems(json.Items);

				if(!callback)return;
				callback(bins.Hit);
			}
		});
	}

},
	function(){
		window.UserDataLoader = this;
	}
);
