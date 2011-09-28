Ext.define('NextThought.proxy.Socket', {
    extend: 'Ext.util.Observable',
    singleton: true,

    constructor: function() {
        var me = this;
        Ext.apply(me, {
            socket: null,
            control: {
                'connect': function(){me.onConnect.apply(me, arguments);},
                'serverkill': function() {me.onKill.apply(me, arguments);},
                'error': function() {me.onError.apply(me, arguments);},
                'disconnect': function() {me.onDisconnect.apply(me, arguments);}
            }
        });
    },


    emit: function() {
        this.socket.emit.apply(this.socket, arguments);
    },

    /**
     * Attempts to create a socket connection to the dataserver for this user.
     *
     * @param username
     * @param password
     */
    setup: function(username, password) {
        if (!io) {//if no io, then call ensure to wait until io is available
            this.ensureSocketAvailable(username, password);
            return;
        }

        if (this.socket) {
            this.socket.disconnect();
            delete this.socket;
        }

        this.auth = Array.prototype.slice.call(arguments,0);

        var socket = io.connect(_AppConfig.server.host),
            me = this,
            e = socket.emit;

        socket.emit = function(){
            console.log('socket.emit:',arguments);
            e.apply(this, arguments);
        };

        for (k in this.control) {
            if(this.control.hasOwnProperty(k))
                socket.on(k, this.control[k]);
        }

        this.control = null;

        this.socket = socket;
    },

    getSocket: function() {
        return io.sockets[_AppConfig.server.host];
    },


    /**
     * Set up a task that will check io availability every second until it becomes
     * available, then call setupSocket.
     *
     * @param username
     * @param password
     */
    ensureSocketAvailable: function(username, password) {
        var _task = {
            run: function(){
                if (io) {
                    this.setup(username, password);
                    Ext.TaskManager.stop(_task);
                }
            },
            scope: this,
            interval: 1000
        };

        Ext.TaskManager.start(_task);
    },

    /**
     * Destroy the socket.
     */
    tearDownSocket: function(){
        var s = this.socket;

        if(s){
            delete this.socket;
            s.disconnect();
            for(var e in s.$events){ s.removeAllListeners(e); }

            //we were asked to shut down... if we reconnect, just shutdown again.
            s.on('connect',function(){
                s.disconnect();
                if(NextThought.isDebug)
                    console.log('reconnect,blocked. A refresh is needed to reconnect.');
            });
        }
    },

    register: function(control) {
        for (var k in control) {
            if (!control.hasOwnProperty(k)) continue;

            if(!this.socket) {
                //if there's already a callback registered, sequence it.
                var x = this.control[k],
                    cb = x ? Ext.Function.createSequence(x, control[k]) : control[k];
                this.control[k] = cb;
            }
            else {
                this.socket.on(k, control[k]);
            }
        }
    },

    onConnect: function() {
        var args = ['message'].concat(this.auth);
        this.socket.emit.apply(this.socket, args);
    },

    onError: function() {
        console.log('error',arguments);
    },

    onDisconnect: function() {
        if(NextThought.isDebug)
            console.log('disconnect event');
        this.tearDownSocket();
    },

    onKill: function() {
        if(NextThought.isDebug)
            console.log( 'server kill' );
        this.tearDownSocket();
    }

},
function() {
    window.Socket = NextThought.proxy.Socket;
}
);
