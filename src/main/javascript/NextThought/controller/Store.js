Ext.define('NextThought.controller.Store', {
	extend: 'Ext.app.Controller',

	models: [
		'store.Purchasable',
		'store.PurchaseAttempt'
	],

	stores: [
		'Purchasable'
	],

	views: [

	],

	init: function(){
		this.callParent(arguments);
		this.application.on('session-ready', this.onSessionReady, this);
	},

	onSessionReady: function(){
		var app = this.application,
			store = this.getPurchasableStore(),
			token = {};

		app.registerInitializeTask(token);
		store.on('load', function(){ app.finishInitializeTask(token); }, this, {single: true});
		store.proxy.url = $AppConfig.service.getPurchasableItemURL();
		store.load();
	}
});
