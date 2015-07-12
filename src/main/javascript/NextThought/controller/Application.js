Ext.define('NextThought.controller.Application', {
	extend: 'Ext.app.Controller',
	requires: [
		'NextThought.Library'
	],

	views: ['Main', 'MessageBar'],

	launchToken: {timeout: 3600000},//hour

	load: function(app) {
		// debugger;
	},

	init: function() {
		this.application.registerInitializeTask(this.launchToken);

		this.application.on('finished-loading', function() {
			NextThought.isInitialized = true;
			Globals.removeLoaderSplash();
		});
	},

	restore: function() {
		var token = {id: 'state-restore'},
			app = this.application;
		try {
			app.registerInitializeTask(token);
			this.getController('State').restoreState(PREVIOUS_STATE)
					.always(function() {
						app.finishInitializeTask(token);
					});
		}
		catch (e) {//restoring state
			console.error('Restoring State: ', e, e.message, e.stack);
			this.getController('Navigation').setView('profile');
		}
		this.application.finishInitializeTask(this.launchToken);

	},


	openViewport: function() {
		var v;
		try {
			v = Ext.widget('master-view');
		}
		catch (e1) {
			console.error('Loading View: ', Globals.getError(e1));
		}

		Promise.all([
			//todo: add ContentManagement.onceLoaded()
			Library.onceLoaded(),
			CourseWareUtils.onceLoaded()])
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

					try {
						Ext.destroy(v);
					} catch (e) {
						console.error(e.stack || e.message || e);
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
