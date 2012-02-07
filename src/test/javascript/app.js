// Config stubbing
var _AppConfig = {
	userObject: null,//construct this mock user on launch
	username: 'test@nextthought.com',
	server: {
		host: './src/test/mock',
		data: '/dataserver/'
	}
};

var mockUser = {
	"Class": "User",
	"Links": [
		{
			"href": "fill-this-in",
			"Class": "Link",
			"rel": "edit"
		}
	],
	"OID": "oid-2",
	"Presence": "Online",
	"Username": "test@nextthought.com",

	"alias": "John",
	"realname": "John Doe",

	"Communities": [
		{
			"alias": "Public",
			"Class": "Community",
			"Username": "Everyone",
			"ID": "Everyone",
			"OID": "oid-0"
		}
	],
	"accepting": [],
	"following": [
		{
			"alias": "NTI",
			"Class": "Community",
			"Username": "NextThought",
			"ID": "NextThought",
			"OID": "oid-1"
		}
	],
	"ignoring": []
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
	};}
};


var mockService = {
	"Items": [
		{
			"Items": [],
			"Title": "test@nextthought.com"
		},
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

	requires: [
		'NextThought.util.StacktraceUtils',
		'NextThought.util.MD5',
		'NextThought.util.Globals'
	],

	controllers: [
		'Account',
		'Annotations',
		'Application',
		'Chat',
		'Classroom',
		'FilterControl',
		'Google',
		'Groups',
		'Home',
		'Modes',
		'ObjectExplorer',
		'Reader',
		'Search',
		'Session',
		'State',
		'Stream',
		'Whiteboard'
	],

	launch: function() {
		NextThought.phantomRender = true;

		_AppConfig.service = Ext.create('NextThought.model.Service', mockService, _AppConfig.username);

		_AppConfig.userObject = Ext.create('NextThought.model.User', mockUser, _AppConfig.username, mockUser);

		Globals.applyHooks();

		//include the tests in the test.html head
		jasmine.getEnv().addReporter(new jasmine.TrivialReporter());
		jasmine.getEnv().execute();
	}
});
