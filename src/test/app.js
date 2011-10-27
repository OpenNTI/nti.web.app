// Config stubbing
var _AppConfig = {
    userObject: null,//construct this mock user on launch
    server: {
        host: './src/test/mock',
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
    appFolder: 'src/main/NextThought',

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
        'Stream',
		'Whiteboard'
    ],

    launch: function() {
        NextThought.phantomRender = true;

		applyHooks();

        //include the tests in the test.html head
        jasmine.getEnv().addReporter(new jasmine.TrivialReporter());
        jasmine.getEnv().execute();
    }
});
