Ext.define('NextThought.model.openbadges.Badge', {
	extend: 'NextThought.model.Base',

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
		{name: 'isEmpty', type: 'bool', persist: false}
	],


	downloadBadge: function() {
		this.lockBadge()
			.then(function() {
				// TODO: Start downloading file
			})
			.fail(function() {
				console.error('Failed to lock badge...', arguments);
			});
	},


	exportToBackPack: function() {
		// TODO: To be implemented
	},


	lockBadge: function() {
		if (this.isBadgeLocked()) { return Promise.resolve(); }

		var me = this;
		if (!$AppConfig.userObject.isEmailVerified()) {
			return Promise.reject();
		}

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
