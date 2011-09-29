Ext.define('NextThought.proxy.Socket', {
    extend: 'Ext.util.Observable',
    singleton: true,

    constructor: function() {
        var me = this;
        Ext.apply(me, {
            disconnectStats: {
                count:0,
                lastDisconnect: null
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

        var opts =  this.disconnectStats.reconfigure ? {transports: ["xhr-polling"], 'force new connection':true} : undefined,
            socket = io.connect(_AppConfig.server.host, opts),
            me = this,
            e = socket.emit;

        console.log();

        socket.emit = function(){
            console.log('socket.emit:',arguments);
            e.apply(this, arguments);
        };

        for (k in this.control) {
            if(this.control.hasOwnProperty(k))
                socket.on(k, this.control[k]);
        }

        //this.control = null;

        this.socket = socket;
    },

    emit: function() {
        this.socket.emit.apply(this.socket, arguments);
    },

    getSocket: function() {
        return io.sockets[_AppConfig.server.host];
    },

    /**
     * Destroy the socket.
     */
    tearDownSocket: function(){
        var s = this.socket;

        if(s){
            delete this.socket;
//            delete io.sockets[_AppConfig.server.host];
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


    reconfigureSocketToPoll: function() {
        this.tearDownSocket();
        this.setup.apply(this, this.auth);
        this.disconnectStats.count = 0;
        delete this.disconnectStats.reconfigure;
    },

    shouldReconfigureSocket: function() {
        var timeoutThresholdInMillis = 60 * 1000, //60 seconds
            maxSeqDisconnectsUnderThreshhold = 3,
            time = new Date().getTime();

        if (!this.disconnectStats.lastDisconnect){
            console.log('first disconnect, initializing counter');
            //never been disconnected before:
            this.disconnectStats.count++;
            this.disconnectStats.lastDisconnect = time;
            return false;
        }


        if ((time - this.disconnectStats.lastDisconnect) < timeoutThresholdInMillis) {
            //timeout under the threshhold occurred
            console.log('disconnect occured under threshhold');
            this.disconnectStats.count++;
            this.disconnectStats.lastDisconnect = time;
            if (this.disconnectStats.count > maxSeqDisconnectsUnderThreshhold) {
                this.disconnectStats.reconfigure = true;
                return true;
            }
        }
        else {
            console.log('disconnect occured outside of threshhold, resetting counter');
            this.disconnectStats.count = 0;
            this.disconnectStats.lastDisconnect = time;
        }

        return false;
    },

    onConnect: function() {
        var args = ['message'].concat(this.auth);
        this.socket.emit.apply(this.socket, args);
    },

    onError: function() {
        console.log('error',arguments);
    },

    onKill: function() {
        if(NextThought.isDebug)
            console.log( 'server kill' );
        this.tearDownSocket();
    },

    onDisconnect: function() {
        if(NextThought.isDebug)
        console.log('disconnect event');
        if (this.shouldReconfigureSocket()){
            console.log('time to reconfigure');
            this.reconfigureSocketToPoll();
        }
    }

},
function() {
    window.Socket = NextThought.proxy.Socket;
}
);
