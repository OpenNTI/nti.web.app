Ext.define('NextThought.view.chat.OccupantsList', {
	extend:'Ext.panel.Panel',
	alias: 'widget.chat-occupants-list',

	requires: [
		'NextThought.view.chat.FriendEntry'
	],

	cls: 'chat-occupants-list',
	width: 125,
	autoScroll: true,
	layout: 'anchor',
	border: false,
	title: 'Chat Room',

	moderationOnMessage: 'Click to become moderator',
	moderationOffMessage: 'Click to quit moderation',

	defaults: {border: false, defaults: {border: false}},

	initComponent:function() {
		var me = this;

		if (this.autoHide !== false){this.autoHide = true;}

		this.dockedItems = {
		   xtype: 'toolbar',
		   dock: 'bottom',
		   items: [
			   {
				   cls: 'moderation-toggle',
				   action: 'moderate',
				   tooltip: this.moderationOnMessage
			   }
		   ]
		};


		me.callParent(arguments);
	},

	toggleModerationButton: function(moderated) {
		var b = this.down('button[action=moderate]'),
			cls = 'moderation-on';

		if (b && moderated) {
			b.addCls(cls);
			b.setTooltip(this.moderationOffMessage);
		}
		else if (b){
			b.removeCls(cls);
			b.setTooltip(this.moderationOnMessage);
		}
	},

	setOccupants: function(a, isModerator) {
		var me = this;

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
							isModerator: isModerator
						});
					}
				});
			});
	}
});
