Ext.define('NextThought.cache.UserRepository', {
    singleton: true,

    constructor: function() {
        Ext.apply(this,{
            _store: null,
            _task: {
                scope: this,
                run: this.refresh,
                interval: 30000
            }
        });

        Ext.TaskManager.start(this._task);
    },

    getStore: function() {
        return this._store || (this._store = Ext.create('Ext.data.Store', {model: 'NextThought.model.User'}));
    },

    refresh: function() {
        console.log('refreshing users');
    },

    prefetchUser: function(username) {
        if (typeof(username) == 'string') username = [username];
        Ext.each(
            username,
            function(name){
            this._makeRequest(name, {
                scope: this,
                success: function(u){
                    this.getStore().add(u);
                }
            });
        },
        this);
    },


    getUser: function(username) {
        var user = this.getStore().getById(username);

        if (!user) {
            user = this._makeRequest(username);
            this.getStore().add(user);
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
                callback: function(o,success,r){

                    if(!success){
                        Logging.logAndAlertError('There was an error resolving users', arguments);
                        return;
                    }

                    var json = Ext.decode(r.responseText),
                        bins = UserDataLoader._binAndParseItems(json.Items),
                        list = bins ? bins.User : [];
                    
                    if(list.length>1){
                        console.log('WARNING: many matching users: "', userId, '"', list);
                    }

                    result = list[0];

                    if(callbacks && callbacks.success){
                        callbacks.success.call(callbacks.scope || this, result);
                    }
                }
            });

        return result;
    }

});