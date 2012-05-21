Ext.define('NextThought.controller.Application', {
	extend: 'Ext.app.Controller',
	requires: [
		'NextThought.Library'
	],
	
	views: ['Main'],

	statics: {
		launchToken: {},

		launch: function(){
			try{
				Ext.widget({xtype: 'master-view'});
			}
			catch(e){
				console.error('Loading View: ', Globals.getError(e));
			}
			try{
				Library.load();
			}
			catch(e){
				console.error('Loading Library: ', Globals.getError(e));
			}
		}
	},

	init: function() {
		this.application.registerInitializeTask(this.self.launchToken);

		Library.on('loaded', this.restore, this);
		this.application.on('finished-loading', function(){
			NextThought.isInitialised = true;
			Globals.removeLoaderSplash();
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
