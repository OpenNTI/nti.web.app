Ext.define('NextThought.controller.Application', {
	extend: 'Ext.app.Controller',
	requires: [
		'NextThought.Library'
	],

	views: ['Main', 'MessageBar'],

	launchToken: {timeout: 3600000},//hour

	init: function() {
		this.application.registerInitializeTask(this.launchToken);

		this.application.on('finished-loading', function() {
			NextThought.isInitialized = true;
			Globals.removeLoaderSplash();

			//We were doing the flash check just for IE.  But it seems like we need
			//it everywhere b/c apperantly we can't force the youtube video api to use html5,
			//only suggest it.  TODO it would be nice if we didn't have to do this upfront, it
			//may be a deterent.  Rather do it when we actually need flash (show it when a content page has a video,
			//when the slide view is launched, etc..  Still this is better than
			//the hard gate we were imposing...
			if (!swfobject.hasFlashPlayerVersion('9.0.18') && !Ext.is.iPad) {
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

	restore: function() {
		try {
			this.getController('State').fireEvent('restore', PREVIOUS_STATE);
		}
		catch (e) {//restoring state
			console.error('Restoring State: ', e, e.message, e.stack);
			this.getController('Navigation').setView('profile');
		}
		this.application.finishInitializeTask(this.launchToken);

	},


	openViewport: function() {
		try {
			Ext.widget('master-view');
		}
		catch (e1) {
			console.error('Loading View: ', Globals.getError(e1));
		}

		Promise.pool(
			Library.onceLoaded(),
			CourseWareUtils.onceLoaded())
				.then(
				this.restore.bind(this),
				function(reason) {//failure
					//check library... (it will only have a value if it fails)
					if (reason[0]) {
						console.error('Library failed to load:', reason[0]);
					}

					//check courses
					reason = reason[1];

					if (!(reason[0] instanceof Ext.data.Store)) {
						console.error('Enrolled Courses failed to load:', reason[0]);
					}

					if (!(reason[1] instanceof Ext.data.Store)) {
						console.error('Administered Courses failed to load:', reason[1]);
					}

					Ext.DomHelper.overwrite(Ext.getBody(), {
						cls: 'empty-state error-message-component',
						cn: [
							{tag: 'h1', html: 'There was an error communicating with the server.'},
							{ html: 'Please try again in a few moments.'}
						]
					});
				});

		Library.load();

	}

});
