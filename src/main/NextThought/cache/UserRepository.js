Ext.define('NextThought.cache.UserRepository', {
    alias: 'UserRepository',
    singleton: true,
    requires: [
        'NextThought.util.ParseUtils'
    ],

    constructor: function() {
        Ext.apply(this,{
            _store: null
        });
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
                    console.error('something went wrong making request', arguments, u);
                }
            });
        },
        this);
    },

    updateUser: function(refreshedUser) {
        var s = this.getStore(),
            u = s.getById(refreshedUser.getId()),
            ignoreNewInstance = (refreshedUser.raw && 'ignoreIfExists' in refreshedUser.raw);

        //console.debug('updateUser',ignoreNewInstance, refreshedUser.getId(), u, refreshedUser);

        if (u && (!ignoreNewInstance || !u.equal(refreshedUser))) {
            if (_AppConfig.userObject && u.getId() == _AppConfig.userObject.getId() ){
                if(u !== _AppConfig.userObject)
                    _AppConfig.userObject.fireEvent('changed', refreshedUser);
                _AppConfig.userObject = refreshedUser;
            }

            u.fireEvent('changed', refreshedUser);
            s.remove(u);
            //console.debug('updateUser: refreshing...',refreshedUser.getId());
            u=null;
        }

        if(!u){
            //console.debug('updateUser: adding...',refreshedUser.getId());
            s.add(refreshedUser);
        }
    },

    prefetchUser: function(username, callback, scope) {
        if (!Ext.isArray(username)) username = [username];



        var s = this.getStore(),
            result = [],
            l = username.length,
            async = false;

        Ext.each(
            username,
            function(o){


                var name,
					r;

				if(typeof(o)==='string'){
					name = o;
				}
				else if(o.getId){
					console.trace('This is not good');
					name = o.getId();
				}
				else {
					//JSON representation of User
					r = ParseUtils.parseItems([o], {ignoreIfExists: true})[0];
					if(!r || !r.getModelName){
						Ext.Error.raise({message: 'Unknown result', object: r});
					}

					//Users models are very tightly coupled to this repository and add/update themselves, however,
					// community models while still resolved like users (because they are user-like) are not auto-magically
					// added to the repo, so we add them here.
					if(r.getModelName() === 'Community'){
						s.add(r);
					}

					name = r.getId();
				}

				r = s.getById(name);
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
                        if (l === 0) finish();
                    },
                    success: function(u){
                        //s.add(u); not necessary since the user model calls update
                        result.push(u);

                        //our list of results is as expected, finish
                        if (result.length == l) {
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
            user = raw? ParseUtils.parseItems([raw])[0] : this._makeRequest(username);
            //user's constructor adds the user to the repo, so do the following only if the user is different somehow,
            //this is more of an assertion.  The reason we have to do this is because things are listening to events
            //on user instances in this repository so we cant just replace them.
            if (user && user !== this.getStore().getById(username))
                console.warn('user does not equal user in store', user, this.getStore().getById(username));
                //this.getStore().add(user);
        }

        return user;
    },


    _makeRequest: function(username, callbacks) {
        var result = null,
			url = _AppConfig.service.getUserSearchURL(username);

        Ext.Ajax.request({
            url: url,
            scope: this,
            async: !!callbacks,
            callback: function userRepository_makeRequestCallback(o,success,r)
            {
                if(!success){
                    console.warn('There was an error resolving user:', username, arguments);
                    if (callbacks && callbacks.failure) callbacks.failure.call(callbacks.scope || this);
                    return;
                }

                var json = Ext.decode(r.responseText),
                    list = ParseUtils.parseItems(json.Items, {ignoreIfExists: true});

                if(list && list.length>1){
                    console.warn('many matching users: "', username, '"', list);
                }

                result = list ? list[0] : null;

                if(result && callbacks && callbacks.success){
                    callbacks.success.call(callbacks.scope || this, result);
                }

                if (!result) {
                    if (callbacks && callbacks.failure) callbacks.failure.call(callbacks.scope || this);
                    console.error('result is null', username, list, url, json);
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
