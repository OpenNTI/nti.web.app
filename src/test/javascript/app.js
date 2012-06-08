// Config stubbing
var $AppConfig = {
	userObject: null,//construct this mock user on launch
	username: 'test@nextthought.com',
	server: {
		host: 'mock',
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

Ext.application({
	name: 'NextThought',
	appFolder: 'javascript/NextThought',

	requires: [
		'NextThought.util.Globals',
		'NextThought.util.shared.Anchors',
		'NextThought.model.anchorables.ContentAnchor'
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
		'Navigation',
		'Library',
		'Search',
		'Session',
		'State',
		'Stream'
	],

	launch: function() {
		function go(){
			$AppConfig.service = Ext.create('NextThought.model.Service', mockService, $AppConfig.username);
			$AppConfig.userObject = Ext.create('NextThought.model.User', mockUser, $AppConfig.username, mockUser);

			jasmine.getEnv().addReporter(new jasmine.TrivialReporter());
			jasmine.getEnv().execute();
		}

		NextThought.phantomRender = true;


		Globals.loadScripts([
			'javascript/specs/example.spec.js',
			'javascript/specs/Library.spec.js',
			'javascript/specs/view/widgets/draw/Whiteboard.spec.js',
			'javascript/specs/cache/UserRepository.spec.js',
			'javascript/specs/util/AnnotationUtils.spec.js',
			'javascript/specs/util/ParseUtils.spec.js',
			'javascript/specs/util/Color.spec.js',
			'javascript/specs/util/shared/Anchors.spec.js'],
		go);
	}
});
