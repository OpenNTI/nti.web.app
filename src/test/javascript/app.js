var tests = [];
for (var file in window.__karma__.files) {
  if (window.__karma__.files.hasOwnProperty(file)) {
    if (/spec\.js$/.test(file)) {
      tests.push(file);
    }
  }
}

// make it async
window.__karma__.loaded = function() {};


Ext.application({
	name: 'NextThought',
	appFolder: (window.testRoot || '') + 'javascript/NextThought',

	requires: [
		'NextThought.overrides.*',
		'NextThought.util.*',

		//Require this early so we have it if we need it
		'NextThought.view.MessageBar',
		'NextThought.view.MessageBox',
		'Ext.ux.ajax.SimManager'
	],


	controllers: [
		'Account',
		'UserData',
		'Application',
		'Assessment',
		'Chat',
		'CourseWare',
		'FilterControl',
		'Forums',
		'Google',
		'Groups',
		'Navigation',
		'Profile',
		'Reader',
		'Search',
		'Session',
		'SlideDeck',
		'State',
		'Store',
		'Stream'
	],

	launch: function() {
		$AppConfig.userObject = NextThought.model.User.create(mockUser, 'test@nextthought.com');
		ObjectUtils.defineAttributes($AppConfig, {
			username: {
				getter: function() { try { return this.userObject.getId(); } catch (e) {console.error(e.stack);} },
				setter: function() { throw 'readonly'; }
			}
		});
		window.Service = NextThought.model.Service.create(mockService, $AppConfig.username);

		NextThought.phantomRender = true;

		window.app = this;
		Globals.loadScripts(tests, window.__karma__.start);
	}
});

var uxCheck = setInterval(function() {
	function fail(a, s, b) {
		if (!s || b.status === 404) {
			console.error('You need to move or link the <ext>/examples/ux directory to <ext>/src/ux');
		}
	}

	var r = {
		url: Ext.Loader.getPath('Ext') + '/ux/ajax/SimManager.js',
		callback: fail
	};

	try {
		Ext.Ajax.request(r);
		clearInterval(uxCheck);
	} catch (e) {}
},1000);
