// Config stubbing
var _AppConfig = {
    userObject: null,//construct this mock user on launch
    server: {
        host: 'http://localhost',
        data: '/dataserver/',
        library: '/library/library.json',
        username: 'test@nextthought.com',
        password: 'irrelevant'
    }
};

//mock socketio
var io = {
    connect: function(){ return {
        on: function(){},
        emit: function(){},
        disconnect: function(){},
        onPacket: function(){},
        socket: {
            disconnectSync: function(){}
        }
    }}
};

Ext.application({
    name: 'NextThought',
    appFolder: 'app/NextThought',

    controllers: [
        'State',
        'Chat',
        'Account',
        'Annotations',
        'Application',
        'FilterControl',
        'Groups',
        'Home',
        'Session',
        'Modes',
        'ObjectExplorer',
        'Reader',
        'Search',
        'Stream'
    ],

    launch: function() {
        Ext.JSON.encodeDate = encodeDate;

        //either include the tests in the test.html head, or dynamically** load them before the execute()

        jasmine.getEnv().addReporter(new jasmine.TrivialReporter());
        jasmine.getEnv().execute();
    }
});


/*
    Ideas for dynamically loading tests....

    TODO: make tests load dynamically.
 */