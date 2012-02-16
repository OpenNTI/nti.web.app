// Config stubbing
var $AppConfig = {
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
	"NTIID": "oid-2",
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
			"NTIID": "oid-0"
		}
	],
	"accepting": [],
	"following": [
		{
			"alias": "NTI",
			"Class": "Community",
			"Username": "NextThought",
			"ID": "NextThought",
			"NTIID": "oid-1"
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

console.group = console.groupCollapsed = console.groupEnd = function(){};

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
		function go(){
			$AppConfig.service = Ext.create('NextThought.model.Service', mockService, $AppConfig.username);
			$AppConfig.userObject = Ext.create('NextThought.model.User', mockUser, $AppConfig.username, mockUser);

			jasmine.getEnv().addReporter(new jasmine.TrivialReporter());
			jasmine.getEnv().execute();
		}

		NextThought.phantomRender = true;


		Globals.loadScripts(['src/test/javascript/specs/example.spec.js',
			'src/test/javascript/specs/Library.spec.js',
			'src/test/javascript/specs/view/widgets/draw/Whiteboard.spec.js',
			'src/test/javascript/specs/view/widgets/draw/Path.spec.js',
			'src/test/javascript/specs/cache/UserRepository.spec.js',
			'src/test/javascript/specs/util/AnnotationUtils.spec.js',
			'src/test/javascript/specs/ext-draw.spec.js'],
		go);
	}
});
