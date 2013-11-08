$AppConfig.server.host ='/base/mock';
window.testRoot = '/base/';
Ext.Loader.syncModeEnabled = true;
Ext.Loader.setPath('NextThought','/base/javascript/NextThought');
Ext.require('NextThought.util.*');
Ext.require('NextThought.overrides.*');
Ext.require('NextThought.controller.*');

/*requires config.js to be already included this*/
$AppConfig.userObject = Ext.create('NextThought.model.User', mockUser, 'test@nextthought.com', mockUser);
ObjectUtils.defineAttributes($AppConfig,{
	username: {
		getter: function(){ try { return this.userObject.getId(); } catch(e){console.error(e.stack);} },
		setter: function(){ throw 'readonly'; }
	}
});
$AppConfig.service = Ext.create('NextThought.model.Service', mockService, $AppConfig.username);
