/**
 * This controller is intended to provide instrumentation to the reader.  The messy singletons will need to be migrated
 * into this controller and deprecated.
 */
Ext.define('NextThought.controller.Reader', {
	extend: 'Ext.app.Controller',


	requires: [
		'NextThought.providers.Location'
	],


	models: [
		'PageInfo'
	],


	stores: [],


	views: [
		'content.Reader',
		'content.PageWidgets',
		'cards.Card'
	],


	refs: [],


	init: function() {
		this.listen({
			component:{
				'reader-panel':{},
				'content-card':{
					'show-target':'showCardTarget'
				}
			}
		});
	},


	showCardTarget: function(card, data){
		var reader = card.up('reader-panel');

	}

});
