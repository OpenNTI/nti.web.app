Ext.define('NextThought.model.events.Bus',{
	extend: 'Ext.util.Observable',
	singleton: true,


	constructor: function(){
		this.callParent(arguments);
		this.addEvents({
			//Known events we fire around the application on models:

			'item-destroyed': 1,

			'favorate-changed': 1
		});
	}

});
