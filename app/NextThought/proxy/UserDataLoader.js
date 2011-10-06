/**
 * TODO: Move the search functions & stores into controllers.
 * @deprecated
 */
Ext.define('NextThought.proxy.UserDataLoader',{
    alternateClassName: 'UserDataLoader',
    requires: [
        'NextThought.util.ParseUtils',
        'NextThought.cache.UserRepository'
    ],
    statics:{

        searchUserData: function(containerId, searchString, callback) {
            var h = _AppConfig.server.host,
                d = _AppConfig.server.data,
                c = containerId ? containerId : 'prealgebra',
                u = _AppConfig.server.username,
                url = h+d+'users/' +u+ '/Search/RecursiveUserGeneratedData/'+searchString;

            if(this._searchUserData){
                Ext.Ajax.abort(this._searchUserData);
            }

            this._searchUserData = Ext.Ajax.request({
                url: url,
                scope: this,
                async: !!callback,
                callback: function(o,success,r){
                    this._searchUserData = null;
                    if(!success){
                        console.log('There was an error searching for user generated data', arguments);
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
            var h = _AppConfig.server.host,
                c = containerId ? containerId : 'prealgebra',
                url = h+'/'+c+'/Search/'+searchString;

            if(this._searchContent){
                Ext.Ajax.abort(this._searchContent);
            }

            this._searchContent = Ext.Ajax.request({
                url: url,
                scope: this,
                async: !!callback,
                callback: function(o,success,r){
                    this._searchContent = null;
                    if(!success){
                        console.log('There was an error searching', arguments);
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
                            property : 'realname',
                            direction: 'ASC'
                        }
                    ]
                });
            }

            return this._friendsListsStore;

        },


        getStreamStore: function(){
            var h = _AppConfig.server.host,
                d = _AppConfig.server.data,
                u = _AppConfig.server.username,
                containerId = 'aops-prealgebra-129',
                url = h+d+'users/'+u+'/Pages/' + containerId + '/RecursiveStream/';

            if(!this._streamStore) {
                this._streamStore = Ext.create('Ext.data.Store', {
                    model: 'NextThought.model.Change',
                    autoLoad: true,
                    proxy: {
                        type: 'rest',
                        url: url,
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
            var h = _AppConfig.server.host,
                d = _AppConfig.server.data,
                u = _AppConfig.server.username;
            url = h+d+'users/'+u+(postFix ? postFix : ""),
                request = '_requestOf:'+url;

            if (request in this){
                console.log('canceling request ' + request);
                Ext.Ajax.abort(this[request]);
            }

            this[request] = Ext.Ajax.request({
                url: url,
                scope: this,
                callback: function() {
                    delete this[request];
                },
                failure: function() {
                    console.log('There was an error getting data', 'Will attempt to call failure callback', arguments);
                    if(callbacks && callbacks.failure) {
                        callbacks.failure.apply(callbacks.scope || this, arguments);
                    }
                },
                success: function(r,o) {
                    var json = Ext.decode(r.responseText),
                        bins = ParseUtils.iterateAndCollect(json);

                    if(callbacks && callbacks.success){
                        callbacks.success.call(callbacks.scope || this, bins);
                    }
                    else if(NextThought.isDebug){
                        console.log('WARNING: no success callback');
                    }
                }
            });
        }

    }
});
