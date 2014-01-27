//$AppConfig.server.host = location.toString().split(/[?#]/)[0].split('/').slice(0, -1).join('/') + '/base/mock';
window.testRoot = '/base/';
Ext.Loader.setPath('NextThought', '/base/javascript/NextThought').syncModeEnabled = true;
Ext.require([
	'Ext.ux.ajax.SimManager',
	'NextThought.util.*',
	'NextThought.overrides.*',
	'NextThought.controller.*'
]);

//requires config.js to be already included this
$AppConfig.userObject = NextThought.model.User.create(mockUser, 'test@nextthought.com');
ObjectUtils.defineAttributes($AppConfig, {
	username: {
		getter: function() { try { return this.userObject.getId(); } catch (e) {console.error(e.stack);} },
		setter: function() { throw 'readonly'; }
	}
});
window.Service = NextThought.model.Service.create(mockService, $AppConfig.username);
