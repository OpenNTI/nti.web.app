Ext.define('NextThought.cache.UserRepository', {
    alias: 'UserRepository',
    singleton: true,

    constructor: function() {
        Ext.apply(this,{
            _store: null,
            _task: {
                scope: this,
                run: this.refresh,
                interval: 120000
            }
        });

        Ext.TaskManager.start(this._task);
    },

    getStore: function() {
        return this._store || (this._store = Ext.create('Ext.data.Store', {model: 'NextThought.model.User'}));
    },

    refresh: function() {
        var s = this._store;
        if (!s) return;

        s.each(function(u){
            this._makeRequest(u.getId(), {
                scope:this,
                success: Ext.emptyFn, //loading into the store happens automatically because of the User model constructor.
                failure: function(){
                    console.log('ERROR: something went wrong making request', arguments, u);
                }
            });
        },
        this);
    },

    updateUser: function(refreshedUser) {
        var s = this.getStore(),
            u = s.getById(refreshedUser.getId()),
            ignoreNewInstance = (refreshedUser.raw && 'ignoreIfExists' in refreshedUser.raw);

        //console.log('updateUser',ignoreNewInstance, refreshedUser.getId(), u, refreshedUser);

        if (u && (!ignoreNewInstance || !u.equal(refreshedUser))) {
            if (u.getId() == _AppConfig.userObject.getId() ){
                if(u !== _AppConfig.userObject)
                    _AppConfig.userObject.fireEvent('changed', refreshedUser);
                _AppConfig.userObject = refreshedUser;
            }

            u.fireEvent('changed', refreshedUser);
            s.remove(u);
            //console.log('updateUser: refreshing...',refreshedUser.getId());
            u=null;
        }

        if(!u){
            //console.log('updateUser: adding...',refreshedUser.getId());
            s.add(refreshedUser);
        }
    },

    prefetchUser: function(username, callback, scope) {
        if (typeof(username) == 'string') username = [username];

        var s = this.getStore(),
            result = [],
            l = username.length,
            async = false;

        Ext.each(
            username,
            function(name){
                var r = s.getById(name);
                if (r){
                    result.push(r);
                    return;
                }
                //must make a request, finish in callback so set async flag
                async = true;
                this._makeRequest(name, {
                    scope: this,
                    failure: function(){
                        l--; //dec length so we still hit our finish state when a failure occurs.
                        if (l == 0) finish();
                    },
                    success: function(u){
                        s.add(u);
                        result.push(u);

                        //our list of results is as expected, finish
                        if (result.length = l) {
                            finish();
                        }
                    }
                });
            },
            this);

        if (!async) {
            finish();//we finish linerally, everything is in the store already
        }


        function finish() {
            if (callback) callback.call(scope || window, result);
        }
    },


    getUser: function(username, raw) {
        var user = this.getStore().getById(username);

        
        if (!user) {
            user = raw? UserDataLoader.parseItems([raw])[0] : this._makeRequest(username);
            //user's constructor adds the user to the repo, so do the following only if the user is different somehow,
            //this is more of an assertion.  The reason we have to do this is because things are listening to events
            //on user instances in this repository so we cant just replace them.
            if (user && user !== this.getStore().getById(username))
                console.log('user does not equal user in store', user);
                //this.getStore().add(user);
        }

        return user;
    },


    _makeRequest: function(username, callbacks) {
        var h = _AppConfig.server.host,
            d = _AppConfig.server.data,
            u = _AppConfig.server.username,
            url = h+d+'UserSearch/'+username,
            result = null;

        Ext.Ajax.request({
            url: url,
            scope: this,
            async: !!callbacks,
            callback: function userRepository_makeRequestCallback(o,success,r)
            {
                if(!success){
                    console.log('WARNING: There was an error resolving user:', username, arguments);
                    if (callbacks && callbacks.failure) callbacks.failure.call(callbacks.scope || this);
                    return;
                }

                var json = Ext.decode(r.responseText),
                    bins = UserDataLoader._binAndParseItems(json.Items, undefined, {ignoreIfExists: true}),
                    list = bins ? bins.User || bins.Community : [];

                if(list && list.length>1){
                    console.log('WARNING: many matching users: "', userId, '"', list);
                }

                result = list ? list[0] : null;

                if(result && callbacks && callbacks.success){
                    callbacks.success.call(callbacks.scope || this, result);
                }

                if (!result) {
                    if (callbacks && callbacks.failure) callbacks.failure.call(callbacks.scope || this);
                    console.log('ERROR: result is null', username, bins);
                }
            }
        });

        return result;
    },

    _presenceChanged: function(username, presence) {
        var u = this.getStore().getById(username);
        if (u) {
            u.set('Presence', presence);
            u.fireEvent('changed', u);
        }
    },

    isOnline: function(username) {
        var u = this.getUser(username);

        return u && !/offline/i.test(u.get('Presence'));
    }

},
function(){
    window.UserRepository = NextThought.cache.UserRepository;
});