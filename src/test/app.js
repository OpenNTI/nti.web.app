// Config stubbing
var _AppConfig = {
    userObject: null,//construct this mock user on launch
	username: 'test@nextthought.com',
    server: {
        host: './src/test/mock',
        data: '/dataserver/'
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


var mockService = {
	"Items": [
		{
			"Items": [
				{
					"href": "/Library/library.json",
					"accepts": [],
					"Class": "Collection",
					"Title": "Main"
				}
			],
			"Class": "Workspace",
			"Title": "Library"
		}
	],
	"Class": "Service"
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

		_AppConfig.service = Ext.create('NextThought.model.Service', mockService);

		applyHooks();

        //include the tests in the test.html head
        jasmine.getEnv().addReporter(new jasmine.TrivialReporter());
        jasmine.getEnv().execute();
    }
});
