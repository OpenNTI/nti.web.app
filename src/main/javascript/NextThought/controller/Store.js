Ext.define('NextThought.controller.Store', {
	extend: 'Ext.app.Controller',

	models: [
		'store.Purchasable',
		'store.PurchaseAttempt'
	],

	stores: [
		'NTI'
	],

	views: [

	]
});
