Ext.define('NextThought.controller.Application', {
	extend: 'Ext.app.Controller',
	requires: [
		'NextThought.Library'
	],
	
	views: ['Viewport'],

	statics: {
		launchToken: {},

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
		this.application.registerInitializeTask(this.self.launchToken);

		Library.on('loaded', this.restore, this);
		this.application.on('finished-loading', function(){
			console.groupEnd();
			window.stopTrackingModelConstruction = true;
			NextThought.isInitialised = true;
		});
	},

	restore: function(){
		try{
			this.getController('State').fireEvent('restore',PREVIOUS_STATE);
		}
		catch(e){//restoring state
			console.error('Restoring State: ', e, e.message, e.stack);
			Ext.getCmp('home').activate();
		}
		this.application.finishInitializeTask(this.self.launchToken);

	}
});
