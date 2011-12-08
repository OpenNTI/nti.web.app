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
	},


	getUserSearchStore: function(){

		if(!this._userSearchStore) {
			this._userSearchStore = Ext.create('Ext.data.Store', {
				model: 'NextThought.model.UserSearch',
				proxy: {
					type: 'usersearch',
					model: 'NextThought.model.UserSearch'
				}
			});
		}

		return this._userSearchStore;

	},


	getFriendsListsStore: function(){

		if(!this._friendsListsStore) {
			this._friendsListsStore = Ext.create('Ext.data.Store', {
				model: 'NextThought.model.FriendsList',
				autoLoad: true,
				sorters: [
					{
						sorterFn: function(o1, o2){
							var a = /@/.test(o1.get('Username')),
								b = /@/.test(o2.get('Username'));
							return a==b ? 0 : a ? -1 : 1;
						}
					},{
						property : 'realname',
						direction: 'ASC'
					}
				]
			});
		}

		return this._friendsListsStore;

	},


	getStreamStore: function(){
		if(!this._streamStore) {
			this._streamStore = Ext.create('Ext.data.Store', {
				model: 'NextThought.model.Change',
				autoLoad: true,
				proxy: {
					type: 'rest',
					url: _AppConfig.service.getStreamURL(),
					reader: {
						type: 'json',
						root: 'Items'
					},
					model: 'NextThought.model.Change'
				},
				sorters: [
					{
						property : 'Last Modified',
						direction: 'ASC'
					}
				]
			});
		}

		return this._streamStore;
	},


	getPageItems: function(pageId, callbacks){
		return this.getItems(callbacks, '/Pages/'+pageId+'/UserGeneratedData');
	},


	getItems: function(callbacks, postFix){
		var url = _AppConfig.service.getPageItemURL(postFix),
			request = '_requestOf:'+url;

		if (request in this){
			console.debug('canceling request ' + request);
			Ext.Ajax.abort(this[request]);
		}

		this[request] = Ext.Ajax.request({
			url: url,
			scope: this,
			callback: function() {
				delete this[request];
			},
			failure: function() {
				console.error('There was an error getting data', 'Will attempt to call failure callback', arguments);
				if(callbacks && callbacks.failure) {
					callbacks.failure.apply(callbacks.scope || this, arguments);
				}
			},
			success: function(r) {
				var json = Ext.decode(r.responseText),
					bins = ParseUtils.iterateAndCollect(json);

				if(callbacks && callbacks.success){
					callbacks.success.call(callbacks.scope || this, bins);
				}
				else console.warn('no success callback');
			}
		});
	}
},
	function(){
		window.UserDataLoader = this;
	}
);
