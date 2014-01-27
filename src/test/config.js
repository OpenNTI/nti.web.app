// Config stubbing
var $AppConfig = {
	enableLogging: true,
	debug: true,
	debugDelegation: true,
	debugSocket: true,
	debugSocketVerbosely: true,
	server: {
		host: location.toString().split(/[?#]/)[0].split('/').slice(0, -1).join('/') + (window.testRoot || '/') + 'mock',
		data: '/dataserver/'
	},
	Preferences: {
		getPreference: function(key, cb, scope) {
			if (cb && cb.call) {
				cb.call(scope || this);
			}
		}
	}
};

var mockUser = {
	'Class': 'User',
	'Links': [
		{
			'href': 'fill-this-in',
			'Class': 'Link',
			'rel': 'edit'
		}
	],
	'NTIID': 'oid-2',
	'Presence': 'Online',
	'Username': 'test@nextthought.com',

	'alias': 'John',
	'realname': 'John Doe',

	'Communities': [
		{
			'alias': 'Public',
			'Class': 'Community',
			'Username': 'Everyone',
			'ID': 'Everyone',
			'NTIID': 'oid-0'
		}
	],
	'accepting': [],
	'following': [
		{
			'alias': 'NTI',
			'Class': 'Community',
			'Username': 'NextThought',
			'ID': 'NextThought',
			'NTIID': 'oid-1'
		}
	],
	'ignoring': []
};

//mock socketio
var io = {
	connect: function() { return {
		on: function() {},
		emit: function() {},
		disconnect: function() {},
		onPacket: function() {},
		socket: {
			disconnectSync: function() {}
		}
	};}
};


var mockService = {
	'Items': [
		{
			'Items': [],
			'Title': 'test@nextthought.com'
		},
		{
			'Items': [
				{
					'href': '/library/library.json',
					'accepts': [],
					'Class': 'Collection',
					'Title': 'Main'
				}
			],
			'Class': 'Workspace',
			'Title': 'Library'
		},
		{
			'Items': [
				{
					//'href': '/courses/.json',
					'accepts': [],
					'Class': 'Collection',
					'Title': 'AdministeredCourses'
				},
				{
					//'href': '/courses/.json',
					'accepts': [],
					'Class': 'Collection',
					'Title': 'AllCourses'
				},
				{
					//'href': '/courses/.json',
					'accepts': [],
					'Class': 'Collection',
					'Title': 'EnrolledCourses'
				}
			],
			'Class': 'Workspace',
			'Title': 'Courses'
		},
		{
			'Links': [
				{
					Class: 'Link',
					href: '/dataserver2/ResolveUser/',
					rel: 'ResolveUser',
					type: 'application/vnd.nextthought.link'
				},{
					Class: 'Link',
					href: '/dataserver2/ResolveUsers',
					rel: 'ResolveUsers',
					type: 'application/vnd.nextthought.link'
				}
			],
			'Class': 'Workspace',
			'Title': 'Global'
		}
	],
	'Class': 'Service'
};

var NTITestUtils = {
	newInstanceOfSingleton: function(singleton) {
		return Ext.Object.chain(singleton);
	}
};
