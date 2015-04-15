Ext.define('NextThought.model.openbadges.Badge', {
	extend: 'NextThought.model.Base',

	requires: [
		'NextThought.view.account.verification.EmailVerify'
	],
	fields: [
		{name: 'alignment', type: 'auto'},
		{name: 'criteria', type: 'string'},
		{name: 'description', type: 'string'},
		{name: 'image', type: 'string'},
		{name: 'issuer', type: 'auto'},
		{name: 'name', type: 'string'},
		{name: 'tags', type: 'auto'},
		{name: 'Locked', type: 'boolean'},
		//properties for the ui
		{name: 'earnedCls', type: 'string', persist: false},
		{name: 'isEmpty', type: 'bool', persist: false},
		{name: 'isMe', type: 'boolean', persist: false}
	],


	pushToMozillaBackpack: function() {
		var jsonURL = this.getLink('mozilla-backpack');

		if (Ext.isEmpty(jsonURL)) {
			return Promise.reject();
		}

		return new Promise(function(fulfill, reject) {
			OpenBadges.issue([jsonURL], function(errors, successes) {
				if (!Ext.isEmpty(errors)) {
					reject(errors);
				} else {
					fulfill(successes);
				}
			});
		});
	},


	lockBadge: function() {
		if (this.isBadgeLocked()) { return Promise.resolve(); }

		var me = this;
		return Service.post(this.getLink('lock'))
			.then(function(resp) {
				me.deleteLink('lock');
				Promise.resolve(resp);
			});
	},


	isBadgeLocked: function() {
		return !this.hasLink('lock');
	}
});
