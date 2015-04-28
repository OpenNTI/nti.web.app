Ext.define('NextThought.controller.Updates', {
	extend: 'Ext.app.Controller',

	views: ['MessageBar'],

	UPDATE_CHECK_INTERVAL: 5000,//3600000,//1000ms * 60sec * 60min = 1hour

	init: function() {
		this.startTime = new Date();
		//this.application.on('finished-loading', 'updateNotificationCheck', this);
	},


	updateNotificationCheck: function() {
		var me = this;

		function recheck() {Ext.defer(me.updateNotificationCheck, me.UPDATE_CHECK_INTERVAL, me);}

		Service.request({url: location.pathname, method: 'HEAD'})
				.done(function(resp) {
					var mod = new Date(resp.getResponseHeader('Last-Modified'));
					if (mod <= me.startTime) {
						return;
					}

					me.updateNotification();
				})
				.always(recheck);
	},


	updateNotification: function() {
		//console.log('Update available');
		if (this.messageBar && !this.messageBar.isDestroyed) { return; }

		this.messageBar = Ext.widget('message-bar', {
			renderTo: Ext.getBody(),
			messageType: 'update-available',
			message: {cls: 'message',
					  tag: 'span',
					  cn: [
						  'There is an update available.',
						  {tag: 'a', href: '#', onclick: 'location.reload()', html: 'Reload to update.'}
					  ]}
		});
	}
});
