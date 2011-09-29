Ext.define('NextThought.proxy.Socket', {
    extend: 'Ext.util.Observable',
    singleton: true,

    isDebug: false,

    constructor: function() {
        var me = this;
        Ext.apply(me, {
            disconnectStats: {
                count:0,
                timer: null
            },
            socket: null,
            control: {
                'connect': function(){me.onConnect.apply(me, arguments);},
                'serverkill': function() {me.onKill.apply(me, arguments);},
                'error': function() {me.onError.apply(me, arguments);},
                'disconnect': function() {me.onDisconnect.apply(me, arguments);}
            }
        });
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

    register: function(control) {
        for (var k in control) {
            if (!control.hasOwnProperty(k)) continue;


            //if there's already a callback registered, sequence it.
            var x = this.control[k];
            this.control[k] = x ? Ext.Function.createSequence(x, control[k]) : control[k];

            if(this.socket) {
                this.socket.on(k, control[k]);
            }
        }
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

        this.tearDownSocket();

        this.auth = Array.prototype.slice.call(arguments,0);

        var opts =  this.disconnectStats.reconfigure ? {transports: ["xhr-polling"], 'force new connection':true} : undefined,
            socket = io.connect(_AppConfig.server.host, opts),
            me = this;

        if(opts && this.isDebug){
            console.log('Connect called with options:', opts);
        }

        if(NextThought.isDebug || this.isDebug){
            socket.emit = Ext.Function.createSequence(
                socket.emit,
                function(){console.log('socket.emit:',arguments)}
            );

//            socket.onPacket = Ext.Function.createSequence(
//                function(){console.log('socket.onPacket',arguments)},
//                socket.onPacket
//            );
        }

        for (k in this.control) {
            if(this.control.hasOwnProperty(k))
                socket.on(k, this.control[k]);
        }

        this.socket = socket;
    },

    emit: function() {
        if (this.socket)
            this.socket.emit.apply(this.socket, arguments);
        else if(this.isDebug) {
            console.log('dropping emit, socket is down');
        }
    },

    getSocket: function() {
        return io.sockets[_AppConfig.server.host];
    },

    /**
     * Destroy the socket.
     */
    tearDownSocket: function(){
        var s = this.socket,
            m = this;

        if(s){
            delete this.socket;
            for(var e in s.$events){ s.removeAllListeners(e); }

            s.disconnect();

            //we were asked to shut down... if we reconnect, just shutdown again.
            s.onPacket = function(){ try{
                if(m.isDebug) {
                    console.log('onPacket from a dead socket???',arguments, this);
                }
                s.disconnect();
                s.socket.disconnectSync();
            } catch(e){ console.log('potential leaking sockets'); } };
        }
    },


    maybeReconfigureSocket: function() {
        var ds = this.disconnectStats;

        ds.count ++;
        ds.reconfigure = true;

        if(this.isDebug) {
            console.log('maybeReconfigureSocket',ds.count);
        }

        clearTimeout(ds.timer);
        ds.timer = setTimeout(reset,30000);

        if (ds.count > 3){
            this.tearDownSocket();
            this.setup.apply(this, this.auth);
            reset();
        }

        function reset(){
            if(this.isDebug) {
                console.log('reset disconnect counter');
            }
            clearTimeout(ds.timer);
            ds.count = 0;
            ds.timer = null;
            delete ds.reconfigure;
        }
    },

    onConnect: function() {
        if(this.isDebug) {
            var msg = printStackTrace().slice(3);
            msg.unshift('connect event');
            console.log(msg.join(('\n\t')));
        }
        var args = ['message'].concat(this.auth);
        this.emit.apply(this, args);
    },

    onError: function() {
        if(this.isDebug) {
            console.log('error',arguments);
        }
    },

    onKill: function() {
        if(this.isDebug){
            console.log( 'server kill' );
        }
        this.tearDownSocket();
    },

    onDisconnect: function() {
        if(this.isDebug) {
            var msg = printStackTrace().slice(3);
            msg.unshift('disconnect event');
            console.log(msg.join(('\n\t')));
        }
        this.maybeReconfigureSocket();
    }

},
function() {
    window.Socket = NextThought.proxy.Socket;
}
);
