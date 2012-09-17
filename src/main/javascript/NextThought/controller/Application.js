Ext.define('NextThought.controller.Application', {
	extend: 'Ext.app.Controller',
	requires: [
		'NextThought.Library'
	],
	
	views: ['Main'],

	launchToken: {},

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

	},


	openViewport: function(){
		try{
			Ext.widget('master-view');
		}
		catch(e1){
			console.error('Loading View: ', Globals.getError(e1));
		}
		try{
			Ext.getCmp('readerPanel').on('iframe-ready', Library.load, Library, {single: true});
		}
		catch(e2){
			console.error('Loading Library: ', Globals.getError(e2));
		}
	}

});
