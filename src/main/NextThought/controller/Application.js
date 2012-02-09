Ext.define('NextThought.controller.Application', {
	extend: 'Ext.app.Controller',
	requires: [
		'NextThought.Library'
	],
	
	views: ['Viewport'],

	refs: [{ ref: 'viewport', selector: 'master-view' }],

	statics: {
		launch: function(){
			console.groupCollapsed('Launch');

			Ext.create('NextThought.view.Viewport');
			try{
				Library.load();
			}
			catch(e){ console.error('Loading Library: ', e, e.message, e.stack); }
		}
	},

	init: function() {
	   Library.on('loaded', this.restore, this);
	},

	restore: function(){
		try{
			this.getViewport().fireEvent('restore',PREVIOUS_STATE);
		}
		catch(e){//restoring state
			console.error('Restoring State: ', e, e.message, e.stack);
			Ext.getCmp('home').activate();
		}

		console.groupEnd();
		NextThought.isInitialised = true;
	}
});
