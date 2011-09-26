Ext.define('NextThought.proxy.Socket', {
    extend: 'Ext.util.Observable',
    singleton: true,

    constructor: function() {
        var me = this;
        Ext.apply(me, {
            socket: null,
            control: {
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
            socket.disconnect();
            delete this.socket;
        }


        var socket = io.connect(_AppConfig.server.host),
            me = this;

        socket.on('connect', function() {
            socket.emit( 'message', username, password );
            socket.emit( 'message', 'json' );
        });

        for (k in this.control) {
            if (!this.control.hasOwnProperty(k)) continue;
            socket.on(k, this.control[k]);
        }

        this.control = null;

        this.socket = socket;
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
                    this.setupSocket(username, password);
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
        this.socket.disconnect();
        delete this.socket;
    },

    register: function(control) {
        for (var k in control) {
            if (!control.hasOwnProperty(k)) continue;

            if(!this.socket) {
                if (k in this.control) {
                    console.log('WARN: found existing control for', k, 'in', this.control);
                    continue;
                }

                this.control[k] = control[k];
            }
            else {
                this.socket.on(k, control[k]);
            }
        }
    },

    onDisconnect: function() {
        this.activeRooms = {};
        console.log('disconnect', arguments);
    },

    onError: function() {
        console.log('error',arguments);
    },

    onKill: function() {
        console.log( 'asked to die' );
        this.activeRooms = {};
        this.socket.disconnect();
    }

},
function() {
    window.Socket = NextThought.proxy.Socket;
}
);
