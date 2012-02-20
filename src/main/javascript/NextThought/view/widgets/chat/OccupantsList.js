Ext.define('NextThought.view.widgets.chat.OccupantsList', {
	extend:'Ext.panel.Panel',
	alias: 'widget.chat-occupants-list',

	requires: [
		'NextThought.view.widgets.chat.FriendEntry'
	],

	width: 125,
	collapsible: true,
	collapseFirst: false,
	autoScroll: true,
	layout: 'anchor',
	border: false,
	title: 'Chat Room',

	defaults: {border: false, defaults: {border: false}},

	initComponent:function() {
		var me = this;

		if (this.autoHide !== false){this.autoHide = true;}

		me.tools = [{
			type: 'gear',
			tooltip: 'become moderator',
			action: 'moderate'
		}];

		me.callParent(arguments);
	},

	setOccupants: function(a, rid, isModerator) {
		var me = this,
			total = a.length,
			numberOccupants = 0;

		me.removeAll(true);
		
		Ext.each(a,
			function(username){
				NextThought.cache.UserRepository.prefetchUser(username, function(users){
					var u = users[0];
					if (!u) {
						console.error('could not resolve user', username);
					}
					else {
						me.add({
							xtype: 'chat-friend-entry',
							user: u,
							userId: u.getId(),
							roomId: rid,
							isModerator: isModerator
						});
					}

					if (!u || u.getId() !== $AppConfig.userObject.getId()){
						numberOccupants++;
					}

					total--;
					if (total <= 0){finish();}
				});
			});

		function finish() {
			if (numberOccupants <= 1) {
				//just me and someone else here
				if (me.autoHide) {
					me.hide();
				}
			}
			else if(!me.isVisible()) {
				me.show();
			}
		}

	}
});
