

Ext.define('NextThought.proxy.UserDataLoader',{
    alternateClassName: 'UserDataLoader',
    requires: [
        'NextThought.model.Community',
        'NextThought.model.Change',
        'NextThought.model.Note',
        'NextThought.model.Highlight',
        'NextThought.model.FriendsList',
        'NextThought.model.User',
        'NextThought.model.UserSearch',
        'NextThought.model.UnresolvedFriend',
        'NextThought.model.Hit',
        'NextThought.model.QuizResult',
        'NextThought.model.RoomInfo',
        'NextThought.model.MessageInfo',
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
                        bins = this._binAndParseItems(json.Items);

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
                        bins = this._binAndParseItems(json.Items);

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
                    autoLoad: true
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


        getGroups: function(callbacks) {
            var h = _AppConfig.server.host,
                d = _AppConfig.server.data,
                u = _AppConfig.server.username;
            url = h+d+'users/'+u+'/FriendsLists/';

            this._groupsRequest = Ext.Ajax.request({
                url: url,
                scope: this,
                callback: function() {
                    this._groupsRequest = null;
                },
                failure: function() {
                    console.log('There was an error getting groups', 'Will attempt to call failure callback', arguments);
                    if(callbacks && callbacks.failure) {
                        callbacks.failure.apply(callbacks.scope || this, arguments);
                    }
                },
                success: function(r, o) {
                    var json = Ext.decode(r.responseText);
                    // if(!json || !json.Items){
                    if(!json){
                        if(callbacks && callbacks.failure){
                            callbacks.failure.call(callbacks.scope || this, 'bad group dataz');
                        }
                        else if(NextThought.isDebug){
                            console.log('Response sucked:', r, 'bad json:', json);
                        }
                        return;
                    }

                    var bins = this._binAndParseItems(json);
                    if (!bins || !bins.FriendsList) {
                        if(NextThought.isDebug){
                            console.log('Response sucked:', r, 'bad json:', json);
                        }
                        return;
                    }

                    if(callbacks && callbacks.success){
                        callbacks.success.call(callbacks.scope || this, bins.FriendsList);
                    }
                    else if(NextThought.isDebug){
                        console.log('WARNING: I haz groupz dataz 4 u, but u no giv meh callbax');
                    }

                }
            });

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

            if (this[request]){
                console.log('canceling request ' + request);
                Ext.Ajax.abort(this[request]);
            }

            this[request] = Ext.Ajax.request({
                url: url,
                scope: this,
                callback: function() {
                    this[request] = null;
                },
                failure: function() {
                    console.log('There was an error getting data', 'Will attempt to call failure callback', arguments);
                    if(callbacks && callbacks.failure) {
                        callbacks.failure.apply(callbacks.scope || this, arguments);
                    }
                },
                success: function(r,o) {
                    var json = Ext.decode(r.responseText),
                        bins = this._iterateAndCollect(json);

                    if(callbacks && callbacks.success){
                        callbacks.success.call(callbacks.scope || this, bins);
                    }
                    else if(NextThought.isDebug){
                        console.log('WARNING: I haz dataz 4 u, but u no giv meh callbax');
                    }
                }
            });
        },


        _getReaderForModel: function(modelClass) {
            this._readers = this._readers || [];

            if (!NextThought.model.hasOwnProperty(modelClass)){
                console.log('no model for NextThought.model.' + modelClass);
                return;
            }

            if (!this._readers[modelClass]) {
                this._readers[modelClass] = Ext.create('NextThought.proxy.reader.Json',{
                    model: 'NextThought.model.'+modelClass, proxy: 'nti'
                });
            }

            return this._readers[modelClass];

        },


        _iterateAndCollect: function(json) {
            var bins = {},
                me = this;

            if (Ext.isArray(json)) {
                Ext.each(json, function(o, key){
                        collect(o, key);
                    },
                    me);
            }
            else {
                for (var key in json) {
                    if (!json.hasOwnProperty(key)) continue;
                    collect(json[key], key);
                }
            }

            me._binAndParseItems([], bins);
            return bins;

            function collect(o, key) {
                if (/FriendsLists/i.test(key) || typeof(o) != 'object') return;
                me._binItems(o, bins)
            }
        },


        _toArray: function(s){
            var r=[],k;
            for(k in s){if(!s.hasOwnProperty(k))continue;r.push(s[k]);}
            return r;
        },


        _binItems: function(items, existingBins, applySuppl){
            var bins = existingBins || {};
            if (Ext.isArray(items)) {
                Ext.each(items, function(o){
                        addToBin(o);
                    },
                    this);
            }
            else {
                for (var key in items) {
                    if (!items.hasOwnProperty(key)) continue;
                    addToBin(items[key]);
                }
            }
            return bins;


            function addToBin(o) {
                if(!o || !o.Class) return;
                if(!bins[o.Class]){
                    bins[o.Class] = [];
                }

                if(applySuppl){
                    o = Ext.applyIf(o, applySuppl);
                }

                bins[o.Class].push(o);
            }
        },


        _binAndParseItems: function(items, existingBins, applySuppl){
            var bins = this._binItems(items, existingBins, applySuppl), key;
            for(key in bins){
                if(!bins.hasOwnProperty(key)) continue;

                var reader = this._getReaderForModel(key);
                if(!reader) {
                    console.log('No reader for key', key, 'objects: ', bins[key]);
                    continue;
                }

                try{
                    bins[key] = reader.read(bins[key]).records;
                }
                catch(e){
                    if(/user/i.test(key))
                        bins[key] = UserRepository.getUser(bins[key].Username);
                    else
                        throw e;
                }

            }
            return bins;
        },


        flattenBins: function(bins){
            var result = [], key;
            for(key in bins){
                if(!bins.hasOwnProperty(key)) continue;
                result = result.concat(bins[key]);
            }
            return result;
        },


        parseItems: function(items){
            return this.flattenBins(this._binAndParseItems(items));
        }
    }



});
