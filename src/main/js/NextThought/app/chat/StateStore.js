Ext.define('NextThought.app.chat.StateStore', {
	extend: 'NextThought.common.StateStore',

	availableForChat: false,

	PRESENCE_MAP: {},

	getSocket: function() {
		if (!this.socket) {
			this.socket = Socket;
		}

		return this.socket;
	},


	setMySelfOffline: function() {
		var me = this;

		me.didSetMySelfOffline = true;

		wait(5000)
			.then(function() {
				me.didSetMySelfOffline = false;
			});
	},


	getPresenceOf: function(user) {
		var username = (user && user.isModel) ? user.get('Username') : user;

		if (!username) { return; }

		return this.PRESENCE_MAP[username];
	},


	/**
	 * Update the presence of a user, if it is the current user and they went offline
	 * in another session, give them a chance to come back online.
	 *
	 * @param {String} username       id of the user the presence if for
	 * @param {PresenceInfo} presence       the presence
	 * @param {Function} changePresence what to call if they do set themselves online
	 */
	setPresenceOf: function(username, presence, changePresence) {
		var prevToast = this.__offlineToast,
			oldPresence;

		if (isMe(username)) {
			//if we are online we are available for chat
			if (presence.isOnline()) {
				this.availableForChat = true;

				if (prevToast) {
					prevToast.destroy();
				}
			} else {
				oldPresence = this.presenceMap[key];

				//if we didn't trigger being offline and our old presence was online alert the user
				if (!this.didSetMySelfOffline && oldPresence && oldPresence.isOnline()) {
					console.log('Set offline in another session');
					this.didSetMySelfOffline = false;

					if (prevToast) {
						prevToast.destroy();
					}

					this.__offlineToast = Toaster.makeToast({
						id: 'revertToast',
						message: 'You are currently unavailable because you went offline in another session.',
						buttons: [
							{
								label: 'Okay'
							},
							{
								label: 'Set to available',
								callback: function() {
									presence.set({type: 'available', show: 'chat'});
									changePresence(presence);
								}
							}
						]
					});
				}
			}
		}

		this.PRESENCE_MAP[username] = presence;

		this.fireEvent('presence-changed', username, presence);
	}
});
