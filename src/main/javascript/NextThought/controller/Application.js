Ext.define('NextThought.controller.Application', {
	extend: 'Ext.app.Controller',
	requires: [
		'swfobject',
		'NextThought.Library',
		'NextThought.view.MessageBar'
	],

	views: ['Main'],

	launchToken: {},

	init: function() {
		this.application.registerInitializeTask(this.self.launchToken);

		Library.on('loaded', this.restore, this);
		this.application.on('finished-loading', function(){
			NextThought.isInitialized = true;
			Globals.removeLoaderSplash();

			//We were doing the flash check just for IE.  But it seems like we need
			//it everywhere b/c apperantly we can't force the youtube video api to use html5,
			//only suggest it.  TODO it would be nice if we didn't have to do this upfront, it
			//may be a deterent.  Rather do it when we actually need flash (show it when a content page has a video,
			//when the slide view is launched, etc..  Still this is better than
			//the hard gate we were imposing...
			if(!swfobject.hasFlashPlayerVersion("9.0.18")){
				Ext.widget('message-bar', {
					renderTo: Ext.getBody(),
					messageType: 'flash-required',
					message: {cls: 'message',
							  tag: 'span',
							  cn: [
								  'Portions of this application may require Adobe Flash Player to work correctly.',
								  {tag: 'a', href: 'http://get.adobe.com/flashplayer/', html: 'Download it here.', target: '_blank'}
							  ]}
				});
			}

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
